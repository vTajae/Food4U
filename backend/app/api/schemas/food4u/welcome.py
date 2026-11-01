from pydantic import BaseModel
from typing import List, Optional

class Suggestion(BaseModel):
    name: Optional[str] = None
    value: Optional[str] = None
    code: Optional[str] = None

class Answer(BaseModel):
    questionId: int
    queryKey: str
    answers: List[Suggestion]

class WelcomeFormData(BaseModel):
    submission: List[Answer]



