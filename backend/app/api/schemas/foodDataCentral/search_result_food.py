from pydantic import BaseModel
from typing import Optional, List
from FoodCentralAPI.models.abridged_food_nutrient import AbridgedFoodNutrient


class SearchResultFood(BaseModel):
    fdc_id: Optional[int] = None
    data_type: Optional[str] = None
    description: Optional[str] = None
    food_code: Optional[str] = None
    food_nutrients: Optional[List[AbridgedFoodNutrient]] = None
    publication_date: Optional[str] = None
    scientific_name: Optional[str] = None
    brand_owner: Optional[str] = None
    gtin_upc: Optional[str] = None
    ingredients: Optional[str] = None
    ndb_number: Optional[int] = None
    additional_descriptions: Optional[str] = None
    all_highlight_fields: Optional[str] = None
    score: Optional[float] = None

    class Config:
        orm_mode = True
