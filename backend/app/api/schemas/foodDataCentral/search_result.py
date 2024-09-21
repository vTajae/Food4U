from pydantic import BaseModel, Field
from typing import Optional, List

from app.api.schemas.foodDataCentral.food_search_criteria import FoodSearchCriteria
from app.api.schemas.foodDataCentral.search_result_food import SearchResultFood

class SearchResult(BaseModel):
    food_search_criteria: Optional[FoodSearchCriteria] = Field(None, alias="foodSearchCriteria")
    total_hits: Optional[int] = Field(None, alias="totalHits")
    current_page: Optional[int] = Field(None, alias="currentPage")
    total_pages: Optional[int] = Field(None, alias="totalPages")
    foods: Optional[List[SearchResultFood]] = Field(None, alias="foods")

    class Config:
        from_attributes = True
