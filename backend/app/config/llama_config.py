import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

class AIConfig:
    # Directory where documents are stored
    DATA_DIRECTORY = os.getenv("DATA_DIRECTORY", "data")

    # HuggingFace embedding model name
    EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-base-en-v1.5")

    # Ollama model and request timeout settings
    LLM_MODEL = os.getenv("LLM_MODEL", "llama3")
    REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", 360.0))
