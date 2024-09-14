import logging
from typing import Dict, List, Optional

from app.client.spoon_cli import Spoon_AuthClient

# Assuming that the schemas are defined in app.api.schemas.spoonacular

class Spoon_Service:
    def __init__(self, auth_client: Spoon_AuthClient):
        """
        Service class that uses Spoon_AuthClient to interact with the Spoonacular API.
        """
        self.auth_client = auth_client
        

    async def analyze_recipe(self, analyze_recipe_request: Dict, language: Optional[str] = None,
                            include_nutrition: Optional[bool] = None, include_taste: Optional[bool] = None):
        # Build the query parameters dictionary, excluding None values
        query_params = {
            "language": language,
            "includeNutrition": include_nutrition,
            "includeTaste": include_taste
        }

        # Construct the API endpoint
        endpoint = "recipes/analyze"

        # Make the POST request using the helper method
        response = await self.auth_client.make_post_request(endpoint=endpoint, data=analyze_recipe_request)

        # Read and return the response content
        return response

    async def create_recipe_card(self, recipe_id: int, mask: Optional[str] = None,
                                background_image: Optional[str] = None, background_color: Optional[str] = None,
                                font_color: Optional[str] = None):
        # Build the query parameters dictionary, excluding None values
        query_params = {
            "mask": mask,
            "backgroundImage": background_image,
            "backgroundColor": background_color,
            "fontColor": font_color
        }

        # Remove any key-value pairs where the value is None
        query_params = {key: value for key, value in query_params.items() if value is not None}

        # Construct the API endpoint
        endpoint = f"recipes/{recipe_id}/card"

        # Make the GET request using the helper method
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=query_params)
        # Read and return the response content
        return await response.aread()  # Using `aread()` for reading the async response content

    async def search_restaurants(self, lat: float, lng: float, query: Optional[str] = None,
                                distance: Optional[float] = None, budget: Optional[float] = None, cuisine: Optional[str] = None,
                                min_rating: Optional[float] = None, is_open: Optional[bool] = None, sort: Optional[str] = None,
                                page: Optional[int] = None):
        # Build the query parameters dictionary, excluding None values
        query_params = {
            "query": query,
            "lat": lat,  # Latitude is now required
            "lng": lng,  # Longitude is now required
            "distance": distance,
            "budget": budget,
            "cuisine": cuisine,
            "min-rating": min_rating,
            "is-open": is_open,
            "sort": sort,
            "page": page
        }

        # Remove any key-value pairs where the value is None
        query_params = {key: value for key, value in query_params.items() if value is not None}

        # Construct the API endpoint
        endpoint = "food/restaurants/search"

        # Make the GET request using the helper method
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=query_params)

        # Read and return the response content
        return await response.aread()
