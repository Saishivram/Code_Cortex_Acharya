from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from datetime import datetime
import logging
from model import get_groq_response, MODEL_NAME
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI Initialization
app = FastAPI(
    title="Medical Assistant Chatbot",
    description="A medical chatbot that provides healthcare information and manages patient data",
    version="1.0.0"
)

# CORS Setup for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React/Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
try:
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = MongoClient(MONGODB_URI)
    db = client["doctor_assistant"]
    appointments = db.appointments
    patients = db.patients
    users = db.users
    chat_history = db.chat_history
    logger.info("✅ Successfully connected to MongoDB.")
    
    # Test the connection
    client.admin.command('ping')
    logger.info("✅ MongoDB connection test successful")
except Exception as e:
    logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
    raise

# Prompt templates for chatbot
MEDICAL_PROMPT = MEDICAL_PROMPT = """You are a medical assistant chatbot. Your primary functions are:
1. Provide accurate medical information based on patient records and appointment history
2. Answer general medical queries with scientifically backed information
3. Provide preliminary medical advice while emphasizing the importance of consulting healthcare professionals
4. Only respond to medical-related queries and politely decline other topics
5. Always maintain patient confidentiality and medical ethics
6. Use clear, simple language to explain medical concepts
7. Include relevant disclaimers when providing medical information
8. Stay updated with the latest medical guidelines and research
9. Provide emergency contact suggestions when necessary
10. Never make definitive diagnoses, only suggestions for professional consultation

Remember:
- Always verify information against patient records
- Maintain a professional and empathetic tone
- Prioritize patient safety and well-being
- Direct serious medical concerns to healthcare professionals
- Do not engage with non-medical queries"""

REPORT_GENERATION_PROMPT = """Generate a detailed medical report based on the following patient information and consultation. Include:
1. Patient Demographics
2. Chief Complaints
3. History of Present Illness
4. Past Medical History
5. Physical Examination Findings
6. Assessment
7. Treatment Plan
8. Recommendations
9. Next Appointment Details

Format the report professionally and include all relevant medical details while maintaining patient confidentiality."""

class Query(BaseModel):
    message: str
    patient_id: str = None
    generate_report: bool = False
    user_id: str = None

class Response(BaseModel):
    response: str
    model_used: str

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>Medical Assistant Chatbot</title>
        </head>
        <body>
            <h1>Welcome to Medical Assistant Chatbot API</h1>
            <p>Endpoints:</p>
            <ul>
                <li><strong>POST /chat</strong> - Main chatbot endpoint</li>
                <li><strong>GET /docs</strong> - API documentation</li>
            </ul>
        </body>
    </html>
    """

@app.post("/chat", response_model=Response)
async def chat_endpoint(query: Query):
    """
    Main chat endpoint that interacts with Groq API dynamically.
    """
    try:
        logger.info(f"Received request - Message: {query.message}, Patient ID: {query.patient_id}, User ID: {query.user_id}")
        
        # Check MongoDB connection
        if not db or not patients or not chat_history:
            logger.error("❌ MongoDB is not connected")
            return Response(
                response="System Error: Database connection is not available. Please try again later.",
                model_used=MODEL_NAME
            )

        # Get patient data if patient_id is provided
        patient_context = ""
        if query.patient_id:
            try:
                # Convert string ID to ObjectId if necessary
                patient_id = query.patient_id
                if not isinstance(patient_id, ObjectId):
                    try:
                        patient_id = ObjectId(patient_id)
                    except Exception as e:
                        logger.error(f"❌ Invalid patient ID format: {str(e)}")
                        return Response(
                            response="Error: Invalid patient ID format. Please check the patient ID.",
                            model_used=MODEL_NAME
                        )

                patient = patients.find_one({"_id": patient_id})
                if patient:
                    patient_context = f"\nPatient Context:\nName: {patient.get('name')}\nAge: {patient.get('age')}\nMedical History: {patient.get('medical_history')}"
                    logger.info("✅ Patient data retrieved successfully")
                else:
                    logger.warning(f"⚠️ Patient with ID {query.patient_id} not found")
                    return Response(
                        response="I cannot find any records for this patient ID. Please verify the patient ID and try again.",
                        model_used=MODEL_NAME
                    )
            except Exception as e:
                logger.error(f"❌ Error retrieving patient data: {str(e)}")
                return Response(
                    response="There was an error accessing the patient records. Please try again or contact support if the issue persists.",
                    model_used=MODEL_NAME
                )

        # Check if it's a medical query
        is_medical = is_medical_query(query.message)
        
        if not is_medical:
            return Response(
                response="I apologize, but I can only assist with medical-related questions. Please ask a medical question.",
                model_used=MODEL_NAME
            )

        # Prepare the conversation prompt with patient context
        system_message = f"""You are a medical assistant chatbot. {MEDICAL_PROMPT}
        {patient_context if patient_context else 'Note: No patient context available. Please ask the user to provide a valid patient ID for personalized responses.'}"""

        # Call Groq API with selected model
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": query.message}
        ]
        response = get_groq_response(messages)

        # Store chat history in MongoDB
        try:
            chat_history.insert_one({
                "timestamp": datetime.utcnow(),
                "patient_id": query.patient_id,
                "user_id": query.user_id,
                "user_message": query.message,
                "assistant_response": response,
                "model_used": MODEL_NAME
            })
            logger.info("✅ Chat history stored successfully")
        except Exception as e:
            logger.error(f"❌ Error storing chat history: {str(e)}")

        return Response(response=response, model_used=MODEL_NAME)

    except Exception as e:
        logger.error(f"❌ Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def is_medical_query(query):
    """Check if the query is medical-related using the model."""
    try:
        messages = [
            {"role": "system", "content": """You are a classifier that determines if a query is medical-related.
            Respond with only 'true' for medical queries or 'false' for non-medical queries.
            Medical queries include questions about:
            - Symptoms and diseases
            - Medications and treatments
            - Medical procedures
            - Health and wellness
            - Medical terminology
            - Human anatomy and physiology
            - Mental health
            """},
            {"role": "user", "content": f"Is this a medical query? Query: '{query}'. Respond with only 'true' or 'false'."}
        ]
        
        response = get_groq_response(messages, temperature=0.1)
        logger.info(f"Medical classification response: {response}")
        
        return response.lower().strip() == 'true'
    except Exception as e:
        logger.error(f"❌ Error in medical classification: {str(e)}")
        return False

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
