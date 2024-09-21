from pydantic import BaseModel
from typing import Optional


class RetentionFactor(BaseModel):
    id: Optional[int] = None
    code: Optional[int] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
