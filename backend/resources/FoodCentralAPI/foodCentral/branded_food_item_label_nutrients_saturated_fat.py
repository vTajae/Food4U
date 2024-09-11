from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsSaturatedFat(BaseModel):
    value: Optional[float] = None  # Optional allows this field to be None

    class Config:
        orm_mode = True  # For compatibility with ORMs if needed
