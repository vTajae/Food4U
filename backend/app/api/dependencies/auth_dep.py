import os
from app.api.dependencies.user_dep import get_user_service
from app.api.services.user_service import UserService
from fastapi import Depends, HTTPException, Request
from jwt import decode, ExpiredSignatureError, InvalidSignatureError, PyJWTError
from dotenv import load_dotenv

load_dotenv()

USER_JWT_SECRET_KEY = os.getenv('USER_JWT_SECRET_KEY')
USER_JWT_ALGORITHM = os.getenv('USER_JWT_ALGORITHM')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv(
    'JWT_ACCESS_TOKEN_EXPIRE_MINUTES')


async def get_current_user(request: Request, user_service: UserService = Depends(get_user_service)):
    
    token = request.headers.get("Authorization")
    print(token, "token")


    if not token:
        print("1")
        raise HTTPException(
            status_code=403, detail="No authentication token found")
    try:
        
        # Extract the token value
        token = token.split(" ")[1]  # Assumes "Bearer <token>"
        # Decode the JWT token
        payload = decode(token, USER_JWT_SECRET_KEY, algorithms=[USER_JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        
        
        payload = decode(token, USER_JWT_SECRET_KEY,
                             algorithms=[USER_JWT_ALGORITHM])
        
        print(payload, "payload")
                
        user_id = payload.get("user_id")

        if user_id is None:
            print("2")
            raise HTTPException(
                status_code=403, detail="User ID not found in token")

        user = await user_service.get_profile_by_id(int(user_id))
        if user:
            return user
        
        else:
            print("3")
            raise HTTPException(status_code=403, detail="User not found")

    except ExpiredSignatureError:
        print("4")
        # Here, you inform the frontend that the token has expired.
        raise HTTPException(status_code=403, detail="Token has expired")

    except PyJWTError as e:
        print("5")
        raise HTTPException(
            status_code=403, detail="Could not validate credentials")


async def get_current_user_id(request: Request, user_service: UserService = Depends(get_user_service)):
    token = request.cookies.get("Authorization")
    # print(token, "token")
    
    # print("get_current_user", request.cookies)

    
    if not token:
        raise HTTPException(
            status_code=403, detail="No authentication token found")
    try:
        payload = decode(token, USER_JWT_SECRET_KEY,
                             algorithms=[USER_JWT_ALGORITHM])
        
        print(payload, "payload")
        user_id = payload.get("user_id")

        if user_id is None:
            print("2")
            raise HTTPException(
                status_code=403, detail="User ID not found in token")

        user_id = "68493456457656"
        user = await user_service.get_profile_by_id(int(user_id))
        # print(user, "user12")
        if user:
            return user.id
        else:
            print("3")
            raise HTTPException(status_code=403, detail="User not found")

    except ExpiredSignatureError:
        print("4")
        # Here, you inform the frontend that the token has expired.
        raise HTTPException(status_code=403, detail="Token has expired")

    except PyJWTError as e:
        print("5")
        raise HTTPException(
            status_code=403, detail="Could not validate credentials")


