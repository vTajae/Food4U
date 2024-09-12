from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date

from app.api.schemas.foodDataCentral import abridged_food_nutrient

# Assuming AbridgedFoodNutrient is another Pydantic model that we would import
class AbridgedFoodNutrient(BaseModel):
    # Define the fields for AbridgedFoodNutrient here
    nutrient_id: int
    nutrient_name: str
    unit: str
    value: float



class AbridgedFoodItem(BaseModel):
    data_type: Optional[str] = Field(alias="dataType", default=None)
    description: str
    fdc_id: int = Field(alias="fdcId")
    food_nutrients: Optional[List[abridged_food_nutrient.AbridgedFoodNutrient]] = Field(alias="foodNutrients", default=[])
    publication_date: Optional[date] = Field(alias="publicationDate", default=None)
    brand_owner: Optional[str] = Field(alias="brandOwner", default=None)
    gtin_upc: Optional[str] = Field(alias="gtinUpc", default=None)
    ndb_number: Optional[int] = Field(alias="ndbNumber", default=None)
    food_code: Optional[str] = Field(alias="foodCode", default=None)

    class Config:
        from_attributes = True  # Allows compatibility with ORM models if needed
