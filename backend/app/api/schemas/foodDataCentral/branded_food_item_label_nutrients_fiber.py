from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsFiber(BaseModel):
    value: Optional[float] = None  # Optional field for Fiber value

    class Config:
        from_attributes = True  # Enables compatibility with ORM (e.g., SQLAlchemy)
