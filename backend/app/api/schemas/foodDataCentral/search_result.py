from pydantic import BaseModel
from typing import Optional, List
from FoodCentralAPI.models.food_search_criteria import FoodSearchCriteria
from FoodCentralAPI.models.search_result_food import SearchResultFood


class SearchResult(BaseModel):
    food_search_criteria: Optional[FoodSearchCriteria] = None
    total_hits: Optional[int] = None
    current_page: Optional[int] = None
    total_pages: Optional[int] = None
    foods: Optional[List[SearchResultFood]] = None

    class Config:
        orm_mode = True
