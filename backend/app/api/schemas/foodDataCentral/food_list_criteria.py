from pydantic import BaseModel, Field
from typing import List, Optional


class FoodListCriteria(BaseModel):
    """Pydantic model for FoodListCriteria."""
    
    data_type: Optional[List[str]] = Field(
        None,
        alias="dataType",
        description="Optional. Filter on a specific data type; specify one or more values in an array.",
    )
    
    page_size: Optional[int] = Field(
        50,
        alias="pageSize",
        description="Optional. Maximum number of results to return for the current page. Default is 50.",
        ge=1
    )
    
    page_number: Optional[int] = Field(
        1,
        alias="pageNumber",
        description="Optional. Page number to retrieve. The offset into the overall result set is expressed as (pageNumber * pageSize).",
        ge=1
    )
    
    sort_by: Optional[str] = Field(
        None,
        alias="sortBy",
        description="Optional. Specify one of the possible values to sort by that field.",
    )
    
    sort_order: Optional[str] = Field(
        None,
        alias="sortOrder",
        description="Optional. The sort direction for the results. Only applicable if sortBy is specified.",
        pattern=r"^(asc|desc)$"
    )