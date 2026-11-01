# app/config/gemini_config.py

import base64
import json
import os
from dotenv import load_dotenv
from google.oauth2 import service_account

# Load environment variables from .env file
load_dotenv()

class GeminiConfig:
    GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
    GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    QDRANT_URL = os.getenv("QDRANT_URL")
    
    if not GOOGLE_GEMINI_API_KEY:
        raise ValueError("GOOGLE_GEMINI_API_KEY environment variable is missing or not set")

    if not QDRANT_URL:
        raise ValueError("QDRANT_URL environment variable is missing or not set")

    if not QDRANT_API_KEY:
        raise ValueError("QDRANT_API_KEY environment variable is missing or not set")

    if not GOOGLE_DRIVE_FOLDER_ID:
        raise ValueError("GOOGLE_DRIVE_FOLDER_ID environment variable is missing or not set")

    google_service_account_json_base64 = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64")
    
    if google_service_account_json_base64 is None:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 environment variable is missing or not set")

    GOOGLE_SERVICE_ACCOUNT_JSON = json.loads(
        base64.b64decode(google_service_account_json_base64).decode('utf-8')
    )

    @classmethod
    def get_google_credentials(cls, scopes):
        """Return the Google service account credentials for provided API scopes."""
        credentials = service_account.Credentials.from_service_account_info(
            cls.GOOGLE_SERVICE_ACCOUNT_JSON, scopes=scopes
        )
        return credentials

    @classmethod
    def get_drive_credentials(cls):
        """Return the Google Drive service account credentials."""
        scopes = ['https://www.googleapis.com/auth/drive']
        return cls.get_google_credentials(scopes)

    @classmethod
    def get_palm_credentials(cls):
        """Return the credentials for Google Gemini (PALM) API."""
        scopes = ['https://www.googleapis.com/auth/generativelanguage']
        return cls.get_google_credentials(scopes)
