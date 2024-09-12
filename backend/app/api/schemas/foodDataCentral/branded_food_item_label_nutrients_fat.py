from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsFat(BaseModel):
    value: Optional[float] = None  # Optional allows this field to be None

    class Config:
        from_attributes = True  # For compatibility with ORMs if needed
