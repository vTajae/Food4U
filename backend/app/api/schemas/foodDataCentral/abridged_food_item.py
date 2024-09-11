from typing import List, Optional
from pydantic import BaseModel
from datetime import date

# Assuming AbridgedFoodNutrient is another Pydantic model that we would import
class AbridgedFoodNutrient(BaseModel):
    # Define the fields for AbridgedFoodNutrient here
    nutrient_id: int
    nutrient_name: str
    unit: str
    value: float


class AbridgedFoodItem(BaseModel):
    data_type: str
    description: str
    fdc_id: int
    food_nutrients: Optional[List[AbridgedFoodNutrient]] = []
    publication_date: Optional[date] = None
    brand_owner: Optional[str] = None
    gtin_upc: Optional[str] = None
    ndb_number: Optional[int] = None
    food_code: Optional[str] = None

    class Config:
        orm_mode = True  # Allows compatibility with ORM models if needed
