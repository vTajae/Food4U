from typing import Optional
from pydantic import BaseModel


class SecurePost(BaseModel):
    message: str
    error: Optional[str] = None
