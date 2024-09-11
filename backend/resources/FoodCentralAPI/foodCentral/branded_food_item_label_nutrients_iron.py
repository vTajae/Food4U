from pydantic import BaseModel
from typing import Optional

class BrandedFoodItemLabelNutrientsIron(BaseModel):
    value: Optional[float] = None  # Optional field for Iron value

    class Config:
        orm_mode = True  # Enables compatibility with ORM
