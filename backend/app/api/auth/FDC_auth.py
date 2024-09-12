from typing import List
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

# Define API key header (customize header name if needed)
api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)

def check_ApiKeyAuth(api_key: str = Security(api_key_header), required_scopes: List[str] = []):
    """
    Check API Key authentication.
    
    :param api_key: The API key provided in the request headers.
    :param required_scopes: The scopes that are required for this endpoint.
    :return: Dictionary with authorization details.
    :raises: HTTPException if the API key is invalid or missing.
    """
    if not api_key:
        raise HTTPException(status_code=403, detail="API key is missing")

    # Replace 'expected_valid_api_key' with actual logic for validating the API key
    expected_api_key = "expected_valid_api_key"  # You can replace this with environment variable or database check
    if api_key != expected_api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")

    # Optionally check required scopes (if needed for your API)
    if required_scopes and "read" not in required_scopes:
        raise HTTPException(status_code=403, detail="Insufficient scope")

    # If valid, return the API key and scopes
    return {'api_key': api_key, 'scopes': required_scopes}
