from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsProtein(BaseModel):
    value: Optional[float] = None  # Optional field for Protein value

    class Config:
        from_attributes = True  # Enables compatibility with ORM
