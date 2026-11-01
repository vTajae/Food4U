from pydantic import BaseModel
from typing import Optional


class FoodNutrientSource(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
