# app/schemas/user_schema.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SuggestionRequest(BaseModel):
    queryKey: str
    action: str
    text: str

