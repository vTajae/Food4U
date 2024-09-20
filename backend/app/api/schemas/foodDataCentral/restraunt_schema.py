from pydantic import BaseModel, Field, StrictBool, StrictStr, StrictFloat, StrictInt
from typing import Optional, Union, Dict, Any, Tuple

class SearchRestaurantsRequest(BaseModel):
    query: Optional[StrictStr] = Field(
        None, description="The search query."
    )
    lat: Optional[Union[StrictFloat, StrictInt]] = Field(
        None, description="The latitude of the user's location."
    )
    lng: Optional[Union[StrictFloat, StrictInt]] = Field(
        None, description="The longitude of the user's location."
    )
    distance: Optional[Union[StrictFloat, StrictInt]] = Field(
        None, description="The distance around the location in miles."
    )
    budget: Optional[Union[StrictFloat, StrictInt]] = Field(
        None, description="The user's budget for a meal in USD."
    )
    cuisine: Optional[StrictStr] = Field(
        None, description="The cuisine of the restaurant."
    )
    min_rating: Optional[Union[StrictFloat, StrictInt]] = Field(
        None, description="The minimum rating of the restaurant between 0 and 5."
    )
    is_open: Optional[StrictBool] = Field(
        None, description="Whether the restaurant must be open at the time of search."
    )
    sort: Optional[StrictStr] = Field(
        None, description=(
            "How to sort the results. One of the following: "
            "'cheapest', 'fastest', 'rating', 'distance', or the default 'relevance'."
        )
    )
    page: Optional[Union[StrictFloat, StrictInt]] = Field(
        None, description="The page number of results."
    )
    request_timeout: Optional[
        Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]
    ] = Field(None, description="Timeout setting for this request.")
    
    request_auth: Optional[Dict[StrictStr, Any]] = Field(
        None, description="Override the auth_settings for a single request."
    )
    content_type: Optional[StrictStr] = Field(
        None, description="Force content-type for the request."
    )
    headers: Optional[Dict[StrictStr, Any]] = Field(
        None, description="Override the headers for a single request."
    )
    host_index: Optional[StrictInt] = Field(
        0, ge=0, le=0, description="Override the host index for a single request."
    )

    class Config:
        schema_extra = {
            "example": {
                "query": "Sushi",
                "lat": 37.7749,
                "lng": -122.4194,
                "distance": 5.0,
                "budget": 50.0,
                "cuisine": "Japanese",
                "min_rating": 4.0,
                "is_open": True,
                "sort": "rating",
                "page": 1,
                "_request_timeout": 30,
                "_headers": {"Authorization": "Bearer token"},
            }
        }
