import os
from app.api.dependencies.user_dep import get_user_service
from app.api.services.user_service import UserService
from fastapi import Depends, HTTPException, Request
from jwt import decode, ExpiredSignatureError, PyJWTError
from dotenv import load_dotenv

load_dotenv()

USER_JWT_SECRET_KEY = os.getenv('USER_JWT_SECRET_KEY')
USER_JWT_ALGORITHM = os.getenv('USER_JWT_ALGORITHM')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES')

LEGACY_PREFIX = "legacy-"


def public_id_from_claims(payload: dict) -> str | None:
    """
    The JWT `user_id` claim is the user's stable public id (a string chosen by
    the frontend at registration). Tokens minted before public ids existed
    carry the frontend's integer primary key; those map onto the backfilled
    'legacy-<n>' public ids so old sessions keep working during rollout.
    """
    raw = payload.get("user_id")
    if raw is None:
        return None
    if isinstance(raw, bool):
        return None
    if isinstance(raw, int):
        return f"{LEGACY_PREFIX}{raw}"
    if isinstance(raw, str) and raw.strip():
        return raw.strip()
    return None


def bearer_token(request: Request) -> str:
    header = request.headers.get("Authorization")
    if not header:
        raise HTTPException(status_code=403, detail="No authentication token found")
    parts = header.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1]:
        raise HTTPException(status_code=403, detail="Malformed authorization header")
    return parts[1]


async def get_current_user(request: Request, user_service: UserService = Depends(get_user_service)):
    token = bearer_token(request)
    try:
        payload = decode(token, USER_JWT_SECRET_KEY, algorithms=[USER_JWT_ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token has expired")
    except PyJWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")

    public_id = public_id_from_claims(payload)
    if public_id is None:
        raise HTTPException(status_code=403, detail="User ID not found in token")

    user = await user_service.get_profile_by_public_id(public_id)
    if not user:
        raise HTTPException(status_code=403, detail="User not found")
    return user
