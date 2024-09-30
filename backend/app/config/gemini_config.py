import base64
import os
import json
from dotenv import load_dotenv
from google.oauth2 import service_account

# Load environment variables from .env file
load_dotenv()

class GeminiConfig:
    
    GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
    GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

    if not GOOGLE_DRIVE_FOLDER_ID:
        raise ValueError("GOOGLE_DRIVE_FOLDER_ID environment variable is missing or not set")

    # Load the Base64 encoded JSON string from env and decode it
    google_service_account_json_base64 = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64")
    
    if google_service_account_json_base64 is None:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 environment variable is missing or not set")

    # Decode the Base64-encoded JSON and parse it into a Python dict
    GOOGLE_SERVICE_ACCOUNT_JSON = json.loads(base64.b64decode(google_service_account_json_base64).decode('utf-8'))

    @classmethod
    def get_google_credentials(self, scopes):
        """
        Return the Google service account credentials for the provided API scopes.
        
        Args:
            scopes (list): List of scopes needed for the API, e.g. Google Drive API, Zero-Touch Enrollment API.
        
        Returns:
            google.oauth2.service_account.Credentials: The credentials object for authentication.
        """
        credentials = service_account.Credentials.from_service_account_info(self.GOOGLE_SERVICE_ACCOUNT_JSON, scopes=scopes)
        return credentials

    @classmethod
    def get_drive_credentials(self):
        """
        Return the Google Drive service account credentials.
        
        Scopes:
            - https://www.googleapis.com/auth/drive
        
        Returns:
            google.oauth2.service_account.Credentials: The credentials object for Google Drive API.
        """
        scopes = ['https://www.googleapis.com/auth/drive']
        return self.get_google_credentials(scopes)

