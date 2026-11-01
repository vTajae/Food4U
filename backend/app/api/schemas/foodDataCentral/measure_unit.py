from pydantic import BaseModel
from typing import Optional


class MeasureUnit(BaseModel):
    id: Optional[int] = None
    abbreviation: Optional[str] = None
    name: Optional[str] = None

    class Config:
        from_attributes = True
