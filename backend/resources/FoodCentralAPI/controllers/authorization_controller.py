from fastapi import Request, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from typing import List

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
    if api_key is None:
        raise HTTPException(status_code=403, detail="API key is missing")

    # Here, implement logic to validate the API key.
    # This can include checking the key against a database or static list
    if api_key != "expected_valid_api_key":  # Placeholder validation logic
        raise HTTPException(status_code=403, detail="Invalid API key")

    # Optionally, check required scopes (if your API requires scope-based permissions)
    # This is just an example, adapt it as per your needs
    if "read" not in required_scopes:  # Assuming 'read' scope is required
        raise HTTPException(status_code=403, detail="Insufficient scope")

    # If everything is fine, return some details for the authenticated user/service
    return {'api_key': api_key, 'scopes': required_scopes}

