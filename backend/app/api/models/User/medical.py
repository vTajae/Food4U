from pydantic import BaseModel

class MedicalPost(BaseModel):
    icd10cm: str
    description: str
