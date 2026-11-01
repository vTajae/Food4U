from pydantic import BaseModel, Field
from typing import Optional, List

from app.api.schemas.foodDataCentral.abridged_food_item import AbridgedFoodNutrient


class SearchResultFood(BaseModel):
    fdc_id: Optional[int] = Field(None, alias="fdcId")
    data_type: Optional[str] = Field(None, alias="dataType")
    description: Optional[str] = None
    food_code: Optional[int] = Field(None, alias="foodCode")
    food_nutrients: Optional[List[AbridgedFoodNutrient]] = Field(None, alias="foodNutrients")
    publication_date: Optional[str] = Field(None, alias="publicationDate")
    scientific_name: Optional[str] = Field(None, alias="scientificName")
    brand_owner: Optional[str] = Field(None, alias="brandOwner")
    gtin_upc: Optional[str] = Field(None, alias="gtinUpc")
    ingredients: Optional[str] = None
    ndb_number: Optional[int] = Field(None, alias="ndbNumber")
    additional_descriptions: Optional[str] = Field(None, alias="additionalDescriptions")
    all_highlight_fields: Optional[str] = Field(None, alias="allHighlightFields")
    score: Optional[float] = None


    class Config:
        from_attributes = True
