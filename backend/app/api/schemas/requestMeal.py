from pydantic import BaseModel, Field
from typing import List, Optional

# Define the schema for the search query
class FoodSearchRequest(BaseModel):
    query: str = Field(
        ..., 
        description="Search keywords. Example: 'cheddar cheese'",
        example="cheddar cheese"
    )
    data_type: Optional[List[str]] = Field(
        None, 
        description="Optional data type filters", 
        example=["Foundation", "SR Legacy"]
    )
    page_size: Optional[int] = Field(
        50, 
        gt=0, 
        le=200, 
        description="Maximum results per page", 
        example=25
    )
    page_number: Optional[int] = Field(
        1, 
        gt=0, 
        description="Page number to retrieve", 
        example=2
    )
    sort_by: Optional[str] = Field(
        None, 
        description="Field to sort by (e.g., dataType.keyword, fdcId, etc.)", 
        example="dataType.keyword"
    )
    sort_order: Optional[str] = Field(
        "asc", 
        description="Sort order (asc or desc)", 
        example="asc",
        enum=["asc", "desc"]
    )
    brand_owner: Optional[str] = Field(
        None, 
        description="Filter results by brand owner", 
        example="Kar Nut Products Company"
    )




