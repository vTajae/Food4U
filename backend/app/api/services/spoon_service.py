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
        query_params = {key: value for key,
                        value in query_params.items() if value is not None}

        # Construct the API endpoint
        endpoint = f"recipes/{recipe_id}/card"

        # Make the GET request using the helper method
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=query_params)
        # Read and return the response content
        # Using `aread()` for reading the async response content
        return await response.aread()

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
        query_params = {key: value for key,
                        value in query_params.items() if value is not None}

        # Construct the API endpoint
        endpoint = "food/restaurants/search"

        # Make the GET request using the helper method
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=query_params)

        # Read and return the response content
        return await response.aread()

 # Autocomplete Ingredient Search
    async def autocomplete_ingredient_search(self, query: str, number: Optional[int] = None,
                                             meta_information: Optional[bool] = None,
                                             intolerances: Optional[str] = None,
                                             language: Optional[str] = None):
        params = {
            "query": query,
            "number": number,
            "metaInformation": meta_information,
            "intolerances": intolerances,
            "language": language
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/ingredients/autocomplete"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Compute Ingredient Amount
    async def compute_ingredient_amount(self, id: int, nutrient: str, target: int,
                                        unit: Optional[str] = None):
        params = {
            "nutrient": nutrient,
            "target": target,
            "unit": unit
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = f"food/ingredients/{id}/amount"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Get Ingredient Information
    async def get_ingredient_information(self, id: int, amount: Optional[Union[float, int]] = None,
                                         unit: Optional[str] = None):
        params = {
            "amount": amount,
            "unit": unit
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = f"food/ingredients/{id}/information"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

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

    # Ingredient Search
    async def ingredient_search(self, query: str, add_children: Optional[bool] = None,
                                min_protein_percent: Optional[Union[float, int]] = None,
                                max_protein_percent: Optional[Union[float, int]] = None,
                                min_fat_percent: Optional[Union[float, int]] = None,
                                max_fat_percent: Optional[Union[float, int]] = None,
                                min_carbs_percent: Optional[Union[float, int]] = None,
                                max_carbs_percent: Optional[Union[float, int]] = None,
                                meta_information: Optional[bool] = None,
                                intolerances: Optional[str] = None, sort: Optional[str] = None,
                                sort_direction: Optional[str] = None, offset: Optional[int] = None,
                                number: Optional[int] = None, language: Optional[str] = None):
        params = {
            "query": query,
            "addChildren": add_children,
            "minProteinPercent": min_protein_percent,
            "maxProteinPercent": max_protein_percent,
            "minFatPercent": min_fat_percent,
            "maxFatPercent": max_fat_percent,
            "minCarbsPercent": min_carbs_percent,
            "maxCarbsPercent": max_carbs_percent,
            "metaInformation": meta_information,
            "intolerances": intolerances,
            "sort": sort,
            "sortDirection": sort_direction,
            "offset": offset,
            "number": number,
            "language": language
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/ingredients/search"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Map Ingredients to Grocery Products
    async def map_ingredients_to_grocery_products(self, map_ingredients_to_grocery_products_request: Dict):
        endpoint = "food/ingredients/map"
        response = await self.auth_client.make_post_request(endpoint, data=map_ingredients_to_grocery_products_request)
        return await response.aread()

    # Visualize Ingredients
    async def visualize_ingredients(self, ingredient_list: str, servings: Union[float, int],
                                    language: Optional[str] = None, measure: Optional[str] = None,
                                    view: Optional[str] = None, default_css: Optional[bool] = None,
                                    show_backlink: Optional[bool] = None):
        params = {
            "ingredientList": ingredient_list,
            "servings": servings,
            "language": language,
            "measure": measure,
            "view": view,
            "defaultCss": default_css,
            "showBacklink": show_backlink
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "recipes/visualizeIngredients"
        response = await self.auth_client.make_post_request(endpoint, data=params)
        return await response.aread()

    # Add Meal Plan Template
    async def add_meal_plan_template(self, username: str, hash: str):
        endpoint = f"mealplanner/{username}/templates"
        params = {"hash": hash}
        response = await self.auth_client.make_post_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Add to Meal Plan
    async def add_to_meal_plan(self, username: str, hash: str, add_to_meal_plan_request: Dict):
        endpoint = f"mealplanner/{username}/items"
        params = {"hash": hash}
        response = await self.auth_client.make_post_request(endpoint=endpoint, data=add_to_meal_plan_request, params=params)
        return await response.aread()

    # Generate Meal Plan
    async def generate_meal_plan(self, time_frame: Optional[str] = None, target_calories: Optional[Union[float, int]] = None,
                                 diet: Optional[str] = None, exclude: Optional[str] = None):
        params = {
            "timeFrame": time_frame,
            "targetCalories": target_calories,
            "diet": diet,
            "exclude": exclude
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "mealplanner/generate"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Generate Shopping List
    async def generate_shopping_list(self, username: str, start_date: str, end_date: str, hash: str):
        params = {
            "startDate": start_date,
            "endDate": end_date,
            "hash": hash
        }
        endpoint = f"mealplanner/{username}/shopping-list"
        response = await self.auth_client.make_post_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Get Meal Plan Template
    async def get_meal_plan_template(self, username: str, id: int, hash: str):
        endpoint = f"mealplanner/{username}/templates/{id}"
        params = {"hash": hash}
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Get All Meal Plan Templates
    async def get_meal_plan_templates(self, username: str, hash: str):
        endpoint = f"mealplanner/{username}/templates"
        params = {"hash": hash}
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Get Meal Plan Week
    async def get_meal_plan_week(self, username: str, start_date: str, hash: str):
        endpoint = f"mealplanner/{username}/week/{start_date}"
        params = {"hash": hash}
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Get Shopping List
    async def get_shopping_list(self, username: str, hash: str):
        endpoint = f"mealplanner/{username}/shopping-list"
        params = {"hash": hash}
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Clear Meal Plan Day
    async def clear_meal_plan_day(self, username: str, var_date: str, hash: str):
        endpoint = f"mealplanner/{username}/day/{var_date}"
        params = {"hash": hash}
        response = await self.auth_client.make_delete_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Delete from Meal Plan
    async def delete_from_meal_plan(self, username: str, id: int, hash: str):
        endpoint = f"mealplanner/{username}/items/{id}"
        params = {"hash": hash}
        response = await self.auth_client.make_delete_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Delete from Shopping List
    async def delete_from_shopping_list(self, username: str, id: int, hash: str):
        endpoint = f"mealplanner/{username}/shopping-list/{id}"
        params = {"hash": hash}
        response = await self.auth_client.make_delete_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Delete Meal Plan Template
    async def delete_meal_plan_template(self, username: str, id: int, hash: str):
        endpoint = f"mealplanner/{username}/templates/{id}"
        params = {"hash": hash}
        response = await self.auth_client.make_delete_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Autocomplete Menu Item Search

    async def autocomplete_menu_item_search(self, query: str, number: Optional[int] = None):
        params = {
            "query": query,
            "number": number
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/menuItems/suggest"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Get Menu Item Information
    async def get_menu_item_information(self, id: int):
        endpoint = f"food/menuItems/{id}"
        response = await self.auth_client.make_get_request(endpoint)
        return await response.aread()

    # Menu Item Nutrition by ID Image
    async def menu_item_nutrition_by_id_image(self, id: int):
        endpoint = f"food/menuItems/{id}/nutritionWidget.png"
        response = await self.auth_client.make_get_request(endpoint)
        return await response.aread()

    # Menu Item Nutrition Label Image
    async def menu_item_nutrition_label_image(self, id: int, show_optional_nutrients: Optional[bool] = None,
                                              show_zero_values: Optional[bool] = None,
                                              show_ingredients: Optional[bool] = None):
        params = {
            "showOptionalNutrients": show_optional_nutrients,
            "showZeroValues": show_zero_values,
            "showIngredients": show_ingredients
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = f"food/menuItems/{id}/nutritionLabel.png"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Menu Item Nutrition Label Widget
    async def menu_item_nutrition_label_widget(self, id: int, default_css: Optional[bool] = None,
                                               show_optional_nutrients: Optional[bool] = None,
                                               show_zero_values: Optional[bool] = None,
                                               show_ingredients: Optional[bool] = None):
        params = {
            "defaultCss": default_css,
            "showOptionalNutrients": show_optional_nutrients,
            "showZeroValues": show_zero_values,
            "showIngredients": show_ingredients
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = f"food/menuItems/{id}/nutritionLabel"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Search Menu Items
    async def search_menu_items(self, query: str, min_calories: Optional[Union[float, int]] = None,
                                max_calories: Optional[Union[float, int]] = None,
                                min_carbs: Optional[Union[float, int]] = None,
                                max_carbs: Optional[Union[float, int]] = None,
                                min_protein: Optional[Union[float, int]] = None,
                                max_protein: Optional[Union[float, int]] = None,
                                min_fat: Optional[Union[float, int]] = None,
                                max_fat: Optional[Union[float, int]] = None,
                                add_menu_item_information: Optional[bool] = None,
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
            "addMenuItemInformation": add_menu_item_information,
            "offset": offset,
            "number": number
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/menuItems/search"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Visualize Menu Item Nutrition by ID
    async def visualize_menu_item_nutrition_by_id(self, id: int, default_css: Optional[bool] = None):
        params = {"defaultCss": default_css} if default_css is not None else {}
        endpoint = f"food/menuItems/{id}/nutritionWidget"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Detect Food in Text

    async def detect_food_in_text(self, text: str):
        endpoint = "food/detect"
        data = {"text": text}
        response = await self.auth_client.make_post_request(endpoint=endpoint, data=data)
        return await response.aread()

    # Get a Random Food Joke
    async def get_a_random_food_joke(self):
        endpoint = "food/jokes/random"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params={})
                
        return response.json()

    # Get Conversation Suggestions
    async def get_conversation_suggests(self, query: str, number: Optional[Union[float, int]] = None):
        params = {
            "query": query,
            "number": number
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/conversation/suggestions"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Get Random Food Trivia
    async def get_random_food_trivia(self):
        endpoint = "food/trivia/random"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params={})
        
        return response.json()

    # Image Analysis by URL
    async def image_analysis_by_url(self, image_url: str):
        data = {"imageUrl": image_url}
        endpoint = "food/images/analyze"
        response = await self.auth_client.make_post_request(endpoint=endpoint, data=data)
        return await response.aread()

    # Image Classification by URL
    async def image_classification_by_url(self, image_url: str):
        data = {"imageUrl": image_url}
        endpoint = "food/images/classify"
        response = await self.auth_client.make_post_request(endpoint=endpoint, data=data)
        return await response.aread()

    # Search All Food
    async def search_all_food(self, query: str, offset: Optional[int] = None, number: Optional[int] = 10):
        params = {
            "query": query,
            "offset": offset,
            "number": number
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/search"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Search Custom Foods
    async def search_custom_foods(self, query: str, username: str, hash: str,
                                  offset: Optional[int] = None, number: Optional[int] = 10):
        params = {
            "query": query,
            "username": username,
            "hash": hash,
            "offset": offset,
            "number": number
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/customFoods/search"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Search Food Videos
    async def search_food_videos(self, query: str, type: Optional[str] = None, cuisine: Optional[str] = None,
                                 diet: Optional[str] = None, include_ingredients: Optional[str] = None,
                                 exclude_ingredients: Optional[str] = None,
                                 min_length: Optional[Union[float, int]] = None,
                                 max_length: Optional[Union[float, int]] = None,
                                 offset: Optional[int] = None, number: Optional[int] = 10):
        params = {
            "query": query,
            "type": type,
            "cuisine": cuisine,
            "diet": diet,
            "includeIngredients": include_ingredients,
            "excludeIngredients": exclude_ingredients,
            "minLength": min_length,
            "maxLength": max_length,
            "offset": offset,
            "number": number
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = "food/videos/search"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Search Site Content
    async def search_site_content(self, query: str):
        params = {"query": query}
        endpoint = "site/search"
        response = await self.auth_client.make_get_request(endpoint=endpoint, params=params)
        return await response.aread()

    # Talk to Chatbot
    async def talk_to_chatbot(self, text: str, context_id: Optional[str] = None):
        data = {
            "text": text,
            "contextId": context_id
        }
        data = {k: v for k, v in data.items() if v is not None}
        endpoint = "chatbot"
        response = await self.auth_client.make_post_request(endpoint=endpoint, data=data)
        return await response.aread()

    # Autocomplete Product Search

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

    # Get Product Nutrition by ID as Image
    async def product_nutrition_by_id_image(self, id: int):
        endpoint = f"food/products/{id}/nutritionWidget.png"
        response = await self.auth_client.make_get_request(endpoint)
        return await response.aread()

    # Get Product Nutrition Label as Image
    async def product_nutrition_label_image(self, id: int, show_optional_nutrients: Optional[bool] = None,
                                            show_zero_values: Optional[bool] = None, show_ingredients: Optional[bool] = None):
        params = {
            "showOptionalNutrients": show_optional_nutrients,
            "showZeroValues": show_zero_values,
            "showIngredients": show_ingredients
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = f"food/products/{id}/nutritionLabel.png"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    # Get Product Nutrition Label Widget
    async def product_nutrition_label_widget(self, id: int, default_css: Optional[bool] = None,
                                             show_optional_nutrients: Optional[bool] = None,
                                             show_zero_values: Optional[bool] = None,
                                             show_ingredients: Optional[bool] = None):
        params = {
            "defaultCss": default_css,
            "showOptionalNutrients": show_optional_nutrients,
            "showZeroValues": show_zero_values,
            "showIngredients": show_ingredients
        }
        params = {k: v for k, v in params.items() if v is not None}
        endpoint = f"food/products/{id}/nutritionLabel"
        response = await self.auth_client.make_get_request(endpoint, params=params)
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

    # Visualize Product Nutrition by ID as HTML
    async def visualize_product_nutrition_by_id(self, id: int, default_css: Optional[bool] = None):
        params = {"defaultCss": default_css} if default_css is not None else {}
        endpoint = f"food/products/{id}/nutritionWidget"
        response = await self.auth_client.make_get_request(endpoint, params=params)
        return await response.aread()

    async def analyze_recipe_search_query(self, q: str):
        """
        Analyze a recipe search query.
        """
        params = {"q": q}

        # Call the GET request method from auth_client
        response = await self.auth_client.make_get_request(
            endpoint="recipes/analyze", params=params
        )

        # Return the parsed response data
        return await response.json()  # Assuming the response is in JSON format

    async def analyze_recipe_instructions(self, instructions: str):
        """
        Analyze recipe instructions.
        """
        data = {"instructions": instructions}

        # Call the POST request method from auth_client
        response = await self.auth_client.make_post_request(
            endpoint="recipes/instructions/analyze", data=data
        )

        return response  # Return the response as is, already parsed in the post request method

    # Autocomplete Recipe Search
    async def autocomplete_recipe_search(self, query: str, number: Optional[int] = None, _request_timeout: Optional[Union[float, Tuple[float, float]]] = None,
                                         _request_auth: Optional[Dict[str, Any]] = None, _content_type: Optional[str] = None,
                                         _headers: Optional[Dict[str, Any]] = None, _host_index: int = 0):
        params = {
            "query": query,
            "number": number,
            "_request_auth": _request_auth,
            "_content_type": _content_type,
            "_headers": _headers,
            "_host_index": _host_index
        }
        response_data = await self.auth_client.call_api("autocomplete/recipe_search", params=params, _request_timeout=_request_timeout)
        return await response_data.aread()

    async def classify_cuisine(self, title: str, ingredient_list: str, language: Optional[str] = None):
        """
        Classify the cuisine based on the recipe title and ingredient list.
        """
        data = {
            "title": title,
            "ingredientList": ingredient_list,
            "language": language,
        }

        # Call the POST request method from auth_client
        response = await self.auth_client.make_post_request(
            endpoint="recipes/cuisine", data=data
        )

        return response  # Already parsed JSON returned

    async def compute_glycemic_load(self, compute_glycemic_load_request: Dict):
        """
        Compute the glycemic load for a set of ingredients.
        """
        # Call the POST request method from auth_client
        response = await self.auth_client.make_post_request(
            endpoint="recipes/glycemicLoad", data=compute_glycemic_load_request
        )

        return response

    async def convert_amounts(self, ingredient_name: str, source_amount: Union[float, int], source_unit: str, target_unit: str):
        """
        Convert ingredient amounts from one unit to another.
        """
        params = {
            "ingredientName": ingredient_name,
            "sourceAmount": source_amount,
            "sourceUnit": source_unit,
            "targetUnit": target_unit
        }

        # Call the GET request method from auth_client
        response = await self.auth_client.make_get_request(
            endpoint="recipes/convert", params=params
        )

        return await response.json()

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

    async def equipment_by_id_image(self, id: int):
        """
        Get the image of equipment by its ID.
        """
        # Call the GET request method from auth_client
        response = await self.auth_client.make_get_request(
            endpoint=f"recipes/equipment/{id}/image", params={}
        )

        return await response.json()

    async def extract_recipe_from_website(self, url: str, force_extraction: Optional[bool] = None):
        """
        Extract a recipe from a website.
        """
        data = {
            "url": url,
            "forceExtraction": force_extraction
        }

        # Call the POST request method from auth_client
        response = await self.auth_client.make_post_request(
            endpoint="recipes/extract", data=data
        )

        return response

    async def get_analyzed_recipe_instructions(self, id: int, step_breakdown: Optional[bool] = None):
        """
        Get the analyzed instructions for a recipe by its ID.
        """
        params = {
            "id": id,
            "stepBreakdown": step_breakdown
        }

        # Call the GET request method from auth_client
        response = await self.auth_client.make_get_request(
            endpoint=f"recipes/{id}/analyzedInstructions", params=params
        )

        return await response.json()

    async def search_restaurants(self, lat: float, lng: float, query: Optional[str] = None, distance: Optional[float] = None):
        """
        Search for restaurants near a specific latitude and longitude.
        """
        params = {
            "lat": lat,
            "lng": lng,
            "query": query,
            "distance": distance
        }

        # Call the GET request method from auth_client
        response = await self.auth_client.make_get_request(
            endpoint="food/restaurants/search", params=params
        )

        return await response.json()
