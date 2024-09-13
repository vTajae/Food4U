import logging
import os
import httpx
from fastapi import HTTPException, Response, Security
from app.api.auth.FDC_auth import check_ApiKeyAuth

# Global AsyncClient instance to be reused across the application
client = httpx.AsyncClient(timeout=10.0)

class FDC_AuthClient:
    def __init__(self, request: Security = Security(check_ApiKeyAuth)):
        """
        Initialize the client with the base URL and API key.
        Includes API key authentication check using the `check_ApiKeyAuth` method.
        """
        self.api_key = self._get_api_key()
        self.base_url = "https://api.nal.usda.gov/fdc/v1"  # Base URL for the FoodData Central API
        self.auth = request  # API key and authorization details from `check_ApiKeyAuth`

    @staticmethod
    def _get_api_key() -> str:
        """
        Retrieve the API key from environment variables.
        Raise an exception if the key is not set.
        """
        api_key = os.getenv("FDC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key is not set. Please set the FDC_API_KEY environment variable.")
        return api_key

    def build_url(self, endpoint: str, params: dict) -> str:
        """
        Build the full URL by appending the endpoint to the base URL and ensuring the API key is the first parameter.
        """
        # Create the URL by manually appending the API key as the first parameter
        base_url_with_key = f"{self.base_url}/{endpoint}?api_key={self.api_key}"
        # Create the query string from the params (ignoring api_key because it's already added)
        query_string = "&".join([f"{key}={value}" for key, value in params.items() if key != 'api_key'])
        return f"{base_url_with_key}&{query_string}"


    def get_headers(self) -> dict:
        """
        Returns headers for requests, including the API key and curl-like headers.
        """
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "curl/7.64.1",  # Mimic curl headers
            "Accept": "*/*",
            "Connection": "keep-alive",
        }



    async def make_get_request(self, endpoint: str, params: dict) -> Response:
        """
        Helper method to make GET requests, ensuring the API key is the first query parameter.
        """
        self.auth  # Ensure API key authentication is checked

        # Build the URL with the API key as the first parameter
        url = self.build_url(endpoint, params)

        logging.basicConfig(level=logging.DEBUG)
        logging.getLogger("httpx").setLevel(logging.DEBUG)

        # Print each component separately for debugging purposes
        print(f"URL: {url}")

        try:
            response = await client.get(url, headers=self.get_headers())
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)

    async def make_post_request(self, endpoint: str, data: dict) -> dict:
        """
        Helper method to make POST requests, ensuring the API key is the first parameter.
        """
        self.auth  # Ensure API key authentication is checked

        # Add API key to the data manually
        data['api_key'] = self.api_key

        url = self.build_url(endpoint, {})  # No query params needed, as we're using POST body

        try:
            response = await client.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)

    async def close(self):
        """
        Close the global HTTP client when no longer needed.
        """
        await client.aclose()
