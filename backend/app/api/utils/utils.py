from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import HTTPException, Request, Security
from fastapi.security import APIKeyHeader
from sqlalchemy import case, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.models.food4u.ratelimit import RateLimit
from datetime import datetime, timezone, timedelta
from sqlalchemy import update
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert  # if using PostgreSQL


# Rate limiting configuration
RATE_LIMIT = 5  # Allow 5 requests
RATE_LIMIT_WINDOW = 1  # Window of 60 seconds


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


async def rate_limiter(request: Request, db: AsyncSession):
    identifier = request.client.host  # Use user ID if available
    current_time = datetime.now(timezone.utc)

    # Calculate window boundary
    window_start = current_time - timedelta(seconds=RATE_LIMIT_WINDOW)

    # Upsert logic using PostgreSQL's `ON CONFLICT DO UPDATE`
    stmt = insert(RateLimit).values(
        identifier=identifier,
        request_count=1,
        last_request=current_time
    ).on_conflict_do_update(
        index_elements=['identifier'],  # Assumes unique constraint/index on `identifier`
        set_={
            "request_count": case(
                (RateLimit.last_request < window_start, 1),  # Reset count if outside the window
                else_=RateLimit.request_count + 1  # Increment if within the window
            ),
            "last_request": current_time
        }
    ).returning(RateLimit.request_count, RateLimit.last_request)

    result = await db.execute(stmt)
    rate_limit = result.fetchone()

    # Extract values after upsert
    request_count, last_request = rate_limit.request_count, rate_limit.last_request

    # Check if the request is within the allowed window
    if last_request > window_start and request_count > RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests")

    # Commit the changes if everything is fine
    await db.commit()



# Prefix-based category mapping
def get_category_by_question_id(question_id: str) -> str:
    if question_id.startswith("1"):
        return "medical"
    elif question_id.startswith("2"):
        return "goals"
    elif question_id.startswith("3"):
        return "food"
    elif question_id.startswith("4"):
        return "mealPlans"
    elif question_id.startswith("5"):
        return "preferences"
    elif question_id.startswith("6"):
        return "suggestions"
    else:
        return None