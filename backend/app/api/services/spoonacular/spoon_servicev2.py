import json
import logging
from typing import Any, Dict, List, Optional, Tuple, Union

from app.api.client.spoon_cli import Spoon_AuthClient

# Assuming that the schemas are defined in app.api.schemas.spoonacular


class Spoon_Service:
    def __init__(self, auth_client: Spoon_AuthClient):
        """
        Service class that uses Spoon_AuthClient to interact with the Spoonacular API.
        """
        self.auth_client = auth_client


    async def search_restaurants(self, query: Optional[str], lat: float, lng: float, 
                                 distance: Optional[float] , budget: Optional[float] , cuisine: Optional[str] ,
                                 min_rating: Optional[float] , is_open: Optional[bool] , sort: Optional[str] ,
                                 page: Optional[int] ):
        # Build the query parameters dictionary, excludin values
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
        query_params = {key: value for key,
                        value in query_params.items() if value is not None}

        # Construct the API endpoint
        endpoint = "food/restaurants/search"

        # Make the GET request using the helper method
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=query_params)

        # Read the response content
        response_content = await response.aread()

        # Parse the response as JSON
        try:
            response_data = json.loads(response_content)
            return response_data
        except json.JSONDecodeError:
            raise ValueError("Unable to parse response from the restaurant API")



    # Get Ingredient Substitutes by Name
    async def get_ingredient_substitutes(self, ingredient_name: str):
        endpoint = "food/ingredients/substitutes"
        params = {"ingredientName": ingredient_name}
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Get Ingredient Substitutes by ID
    async def get_ingredient_substitutes_by_id(self, id: int):
        endpoint = f"food/ingredients/{id}/substitutes"
        response = await self.auth_client.make_get_request(endpoint)
        return await response.aread()


    # Map Ingredients to Grocery Products
    async def map_ingredients_to_grocery_products(self, map_ingredients_to_grocery_products_request: Dict):
        endpoint = "food/ingredients/map"
        response = await self.auth_client.make_post_request(endpoint, data=map_ingredients_to_grocery_products_request)
        return await response.aread()
    
        # Get Menu Item Information
    async def get_menu_item_information(self, id: int):
        endpoint = f"food/menuItems/{id}"
        response = await self.auth_client.make_get_request(endpoint)
        return await response.aread()
    
        # Get a Random Food Joke
    async def get_a_random_food_joke(self):
        endpoint = "food/jokes/random"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params={})
                
        return response.json()
    
    
    async def autocomplete_product_search(self, query: str, number: Optional[int] = None):
        params = {"query": query, "number": number}
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/products/suggest"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Classify Grocery Product
    async def classify_grocery_product(self, classify_grocery_product_request: Dict, locale: Optional[str] = None):
        data = {"locale": locale, **classify_grocery_product_request.dict()}
        endpoint = "food/products/classify"
        response = await self.auth_client.make_post_request(endpoint, data=data)
        return await response.aread()

    # Classify Grocery Product Bulk
    async def classify_grocery_product_bulk(self, classify_grocery_product_bulk_request: List[Dict], locale: Optional[str] = None):
        data = {"locale": locale,
                "requests": classify_grocery_product_bulk_request}
        endpoint = "food/products/classify/bulk"
        response = await self.auth_client.make_post_request(endpoint, data=data)
        return await response.aread()

    # Get Comparable Products
    async def get_comparable_products(self, upc: str):
        params = {"upc": upc}
        endpoint = "food/products/upc/comparable"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Get Product Information by ID
    async def get_product_information(self, id: int):
        endpoint = f"food/products/{id}"
        response = await self.auth_client.make_get_request(endpoint)
        return await response.aread()
    
    
    
        # Search Grocery Products
    async def search_grocery_products(self, query: str, min_calories: Optional[Union[float, int]] = None,
                                      max_calories: Optional[Union[float, int]] = None,
                                      min_carbs: Optional[Union[float,
                                                                int]] = None,
                                      max_carbs: Optional[Union[float,
                                                                int]] = None,
                                      min_protein: Optional[Union[float, int]] = None,
                                      max_protein: Optional[Union[float, int]] = None,
                                      min_fat: Optional[Union[float,
                                                              int]] = None,
                                      max_fat: Optional[Union[float,
                                                              int]] = None,
                                      add_product_information: Optional[bool] = None,
                                      offset: Optional[int] = None, number: Optional[int] = 10):
        params = {
            "query": query,
            "minCalories": min_calories,
            "maxCalories": max_calories,
            "minCarbs": min_carbs,
            "maxCarbs": max_carbs,
            "minProtein": min_protein,
            "maxProtein": max_protein,
            "minFat": min_fat,
            "maxFat": max_fat,
            "addProductInformation": add_product_information,
            "offset": offset,
            "number": number
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/products/search"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Search Grocery Products by UPC
    async def search_grocery_products_by_upc(self, upc: str):
        params = {"upc": upc}
        endpoint = f"food/products/upc/{upc}"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    async def create_recipe_card(self, title: str, ingredients: str, instructions: str, ready_in_minutes: int, servings: int, mask: str, background_image: str):
        """
        Create a recipe card with specified parameters.
        """
        data = {
            "title": title,
            "ingredients": ingredients,
            "instructions": instructions,
            "readyInMinutes": ready_in_minutes,
            "servings": servings,
            "mask": mask,
            "backgroundImage": background_image
        }

        # Call the POST request method from auth_client
        response = await self.auth_client.make_post_request(
            endpoint="recipes/card", data=data
        )

        return response
