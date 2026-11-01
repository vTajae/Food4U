from pydantic import BaseModel
from typing import Optional


class WweiaFoodCategory(BaseModel):
    wweia_food_category_code: Optional[int] = None
    wweia_food_category_description: Optional[str] = None

    class Config:
        from_attributes = True
