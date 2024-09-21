from typing import Optional
from pydantic import BaseModel

class MedicalPost(BaseModel):
    icd10cm: str
    description: str

class SecurePost(BaseModel):
    message: str
    error: Optional[str] = None
