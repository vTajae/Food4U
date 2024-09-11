from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsFiber(BaseModel):
    value: Optional[float] = None  # Optional field for Fiber value

    class Config:
        orm_mode = True  # Enables compatibility with ORM (e.g., SQLAlchemy)
