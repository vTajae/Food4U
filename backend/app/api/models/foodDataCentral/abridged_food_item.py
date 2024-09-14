from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date

from app.api.models.foodDataCentral import abridged_food_nutrient


class AbridgedFoodNutrient(BaseModel):
    nutrient_id: Optional[int] = Field(None, alias="nutrientId")
    nutrient_name: Optional[str] = Field(None, alias="nutrientName")
    nutrient_number: Optional[str] = Field(None, alias="nutrientNumber")
    unit_name: Optional[str] = Field(None, alias="unitName")
    value: Optional[float] = None
    derivation_code: Optional[str] = Field(None, alias="derivationCode")
    derivation_description: Optional[str] = Field(None, alias="derivationDescription")
    derivation_id: Optional[int] = Field(None, alias="derivationId")
    food_nutrient_source_id: Optional[int] = Field(None, alias="foodNutrientSourceId")
    food_nutrient_source_code: Optional[str] = Field(None, alias="foodNutrientSourceCode")
    food_nutrient_source_description: Optional[str] = Field(None, alias="foodNutrientSourceDescription")
    rank: Optional[int] = None
    indent_level: Optional[int] = Field(None, alias="indentLevel")
    food_nutrient_id: Optional[int] = Field(None, alias="foodNutrientId")
    data_points: Optional[int] = Field(None, alias="dataPoints")
    
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
