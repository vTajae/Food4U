from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsIron(BaseModel):
    value: Optional[float] = None  # Optional field for Iron value

    class Config:
        from_attributes = True  # Enables compatibility with ORM
