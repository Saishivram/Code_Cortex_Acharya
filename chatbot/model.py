import groq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Groq client with API key from environment variable
API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise ValueError("❌ GROQ_API_KEY is missing in environment variables.")

client = groq.Client(api_key=API_KEY)

# List of all available models in Groq (updated with valid models)
AVAILABLE_MODELS = [
    "llama-3.1-8b-instant",  # Primary
    "llama3-8b-8192",        # Backup 1
    "gemma2-9b-it",          # Backup 2
    "llama-guard-3-8b",      # Security-focused Backup
]


def get_available_model():
    """
    Check all available models and return the first working one.
    """
    for model in AVAILABLE_MODELS:
        try:
            # Test each model by sending a simple request
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Test message"}],
                temperature=0.1,  # Low temperature to ensure deterministic results
                max_tokens=10,
            )
            if response and response.choices:
                print(f"✅ Model {model} is available!")
                return model
        except Exception as e:
            print(f"❌ Model {model} is unavailable: {str(e)}")
            continue

    raise Exception("❌ No available models found. Please update the model list or check API access.")

# Get the best available model to use
MODEL_NAME = get_available_model()

def get_groq_response(messages, temperature=0.7):
    """
    Generate a response using the available Groq model.
    Args:
        messages: List of message dictionaries with 'role' and 'content'
        temperature: Float between 0 and 1 controlling response randomness
    """
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=temperature,
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating response: {str(e)}"
