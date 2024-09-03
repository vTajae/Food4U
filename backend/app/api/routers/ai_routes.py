import os
from dotenv import load_dotenv
from fastapi import APIRouter

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response


router = APIRouter()

load_dotenv()

@router.get("/ai")
async def dashboard():
    # Your dashboard logic here
    return {"message": "Welcome to the dashboard"}



