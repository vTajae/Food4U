from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsPotassium(BaseModel):
    value: Optional[float] = None  # Optional field for Potassium value

    class Config:
        from_attributes = True  # Enables compatibility with ORM
