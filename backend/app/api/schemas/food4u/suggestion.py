from pydantic import BaseModel, Field
from typing import List, Optional

# Define a schema for the food query
class FoodQuery(BaseModel):
    data_type: Optional[List[str]] = Field(
        default=None, 
        description="Filter by data type (e.g., Foundation, SR Legacy)", 
        example=["Foundation", "SR Legacy"]
    )
    page_size: Optional[int] = Field(
        default=50, 
        gt=0, 
        le=200, 
        description="Max number of results per page", 
        example=25
    )
    page_number: Optional[int] = Field(
        default=1, 
        gt=0, 
        description="Page number to retrieve", 
        example=2
    )
    sort_by: Optional[str] = Field(
        default=None, 
        description="Field to sort by (e.g., dataType.keyword, fdcId, etc.)", 
        example="fdcId"
    )
    sort_order: Optional[str] = Field(
        default="asc", 
        description="Sort order (asc or desc)", 
        example="asc"
    )

# Define a schema for the suggestion query
class SuggestionQuery(BaseModel):
    user_preferences: Optional[str] = Field(
        default=None, 
        description="User-specific preferences for suggestion"
    )
    health_goals: Optional[str] = Field(
        default=None, 
        description="User-specific health goals"
    )
    dietary_restrictions: Optional[List[str]] = Field(
        default=None, 
        description="List of dietary restrictions"
    )

# Define a combined schema to take input for both queries
class SuggestionRequest(BaseModel):
    food_query: FoodQuery
    suggestion_query: SuggestionQuery
    
