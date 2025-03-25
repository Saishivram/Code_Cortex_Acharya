# Medical Assistant Chatbot

A specialized medical chatbot that uses MongoDB for data storage and Groq API for natural language processing. The chatbot is designed to handle medical queries only and provides responses based on stored medical data and general medical knowledge.

## Features

- Medical query processing and validation
- MongoDB integration for medical data storage
- Groq API integration for natural language understanding
- Strict medical-only response policy
- Professional and ethical medical information handling

## Prerequisites

- Python 3.8+
- MongoDB instance
- Groq API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     GROQ_API_KEY=your_groq_api_key
     DB_NAME=doctor_assistant
     ```

4. Set up MongoDB:
   - Create a database named 'doctor_assistant'
   - Create a text index on relevant fields in your medical_data collection:
     ```javascript
     db.medical_data.createIndex({ "$**": "text" })
     ```

## Running the Application

1. Start the server:
   ```bash
   python app.py
   ```

2. The API will be available at `http://localhost:8000`

## API Endpoints

### POST /chat
- Endpoint for sending queries to the chatbot
- Request body:
  ```json
  {
    "message": "your medical query here"
  }
  ```

## Important Notes

- The chatbot will only respond to medical-related queries
- All medical advice comes with appropriate disclaimers
- The system should be used as a supplementary tool, not a replacement for professional medical advice
- Ensure all sensitive medical data is handled according to relevant privacy regulations

## Security Considerations

- Keep your API keys secure
- Regularly update dependencies
- Monitor access logs
- Implement rate limiting for production use
- Follow HIPAA compliance guidelines when handling medical data 