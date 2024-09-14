from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsCalcium(BaseModel):
    value: Optional[float] = None  # Optional allows the field to be None if not provided

    class Config:
        from_attributes = True  # For compatibility with ORMs if needed
