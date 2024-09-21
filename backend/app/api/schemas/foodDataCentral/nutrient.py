from pydantic import BaseModel
from typing import Optional


class Nutrient(BaseModel):
    id: Optional[int] = None
    number: Optional[str] = None
    name: Optional[str] = None
    rank: Optional[int] = None
    unit_name: Optional[str] = None

    class Config:
        from_attributes = True
