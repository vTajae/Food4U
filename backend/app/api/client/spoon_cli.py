import logging
import os
import httpx
from fastapi import HTTPException, Response, Security

from app.api.utils.utils import RateLimitUtil


# Global AsyncClient instance to be reused across the application
client = httpx.AsyncClient(timeout=10.0)

class Spoon_AuthClient:
    def __init__(self, request: Security = Security(RateLimitUtil.check_api_key_auth)):
        """
        Initialize the client with the base URL and API key.
        Includes API key authentication check using the `check_ApiKeyAuth` method.
        """
        self.api_key = self._get_api_key()
        self.base_url = "https://api.spoonacular.com"  # Base URL for the Spoonacular API
        self.auth = request  # API key and authorization details from `check_ApiKeyAuth`

    @staticmethod
    def _get_api_key() -> str:
        """
        Retrieve the API key from environment variables.
        Raise an exception if the key is not set.
        """
        api_key = os.getenv("SPOONACULAR_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="API key is not set. Please set the SPOONACULAR_API_KEY environment variable."
            )
        return api_key

    def build_url(self, endpoint: str, params: dict) -> str:
        """
        Build the full URL by appending the endpoint to the base URL and ensuring the API key is the first parameter.
        """
        # Create the URL by manually appending the API key as the first parameter
        base_url_with_key = f"{self.base_url}/{endpoint}?apiKey={self.api_key}"
        # Create the query string from the params (ignoring apiKey because it's already added)
        query_string = "&".join(
            [f"{key}={value}" for key, value in params.items() if key != 'apiKey']
        )
        if query_string:
            return f"{base_url_with_key}&{query_string}"
        else:
            return base_url_with_key

    def get_headers(self) -> dict:
        """
        Returns headers for requests, including the API key and curl-like headers.
        """
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Connection": "keep-alive",
        }

    async def make_get_request(self, endpoint: str, params: dict = None) -> Response:
        """
        Helper method to make GET requests, ensuring the API key is the first query parameter.
        Params is optional and defaults to an empty dictionary.
        """
        self.auth  # Ensure API key authentication is checked
        
        # Default params to an empty dictionary if not provided
        if params is None:
            params = {}
    
        # Build the URL with the API key as the first parameter
        url = self.build_url(endpoint, params)

        logging.basicConfig(level=logging.DEBUG)
        logging.getLogger("httpx").setLevel(logging.DEBUG)

        try:
            response = await client.get(url, headers=self.get_headers())
            response.raise_for_status()
            return response
        
        except httpx.HTTPStatusError as e:
            logging.error(f"HTTP Status Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            logging.error(f"Request Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An error occurred while processing the request.")
        except Exception as e:
            logging.error(f"Unexpected Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred.")

    async def make_post_request(self, endpoint: str, data: dict) -> dict:
        """
        Helper method to make POST requests, ensuring the API key is added as a query parameter.
        """
        self.auth  # Ensure API key authentication is checked

        logging.basicConfig(level=logging.DEBUG)
        logging.getLogger("httpx").setLevel(logging.DEBUG)

        # Build the URL with the API key as a query parameter
        url = self.build_url(endpoint, {})  # No query params needed here, only API key in the URL
        logging.debug(f"URL: {url}")
        logging.debug(f"Data: {data}")
        
        try:
            response = await client.post(url, json=data, headers=self.get_headers())
            response.raise_for_status()  # Ensure status code indicates success
            logging.debug(f"Response: {response.json()}")

            return response.json()  # Return JSON data from the response
        except httpx.HTTPStatusError as e:
            logging.error(f"HTTP Status Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            logging.error(f"Request Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An error occurred while processing the request.")
        except Exception as e:
            logging.error(f"Unexpected Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred.")

    async def make_put_request(self, endpoint: str, data: dict, params: dict = None) -> dict:
        """
        Helper method to make PUT requests.
        """
        self.auth  # Ensure API key authentication is checked
        
        # Default params to an empty dictionary if not provided
        if params is None:
            params = {}

        # Build the URL with params if any
        url = self.build_url(endpoint, params)
        logging.debug(f"URL: {url}")
        logging.debug(f"Data: {data}")
        
        try:
            response = await client.put(url, json=data, headers=self.get_headers())
            response.raise_for_status()
            logging.debug(f"Response: {response.json()}")
            return response.json()
        except httpx.HTTPStatusError as e:
            logging.error(f"HTTP Status Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            logging.error(f"Request Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An error occurred while processing the request.")
        except Exception as e:
            logging.error(f"Unexpected Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred.")

    async def make_delete_request(self, endpoint: str, params: dict = None) -> dict:
        """
        Helper method to make DELETE requests.
        """
        self.auth  # Ensure API key authentication is checked
        
        # Default params to an empty dictionary if not provided
        if params is None:
            params = {}

        # Build the URL with params if any
        url = self.build_url(endpoint, params)
        logging.debug(f"URL: {url}")
        
        try:
            response = await client.delete(url, headers=self.get_headers())
            response.raise_for_status()
            logging.debug(f"Response: {response.text}")
            return {"detail": "Resource deleted successfully."}
        except httpx.HTTPStatusError as e:
            logging.error(f"HTTP Status Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            logging.error(f"Request Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An error occurred while processing the request.")
        except Exception as e:
            logging.error(f"Unexpected Error: {str(e)}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred.")

    async def close(self):
        """
        Close the global HTTP client when no longer needed.
        """
        await client.aclose()
