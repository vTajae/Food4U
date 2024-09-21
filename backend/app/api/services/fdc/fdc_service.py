import json
import logging
from typing import List, Optional

from typing import List, Optional

from fastapi import Query

from app.api.client.fdc_cli import FDC_AuthClient
from app.api.schemas.foodDataCentral import abridged_food_item, inline_response200
from app.api.schemas.foodDataCentral.food_list_criteria import FoodListCriteria
from app.api.schemas.foodDataCentral.food_search_criteria import FoodSearchCriteria
from app.api.schemas.foodDataCentral.foods_criteria import FoodsCriteria
from app.api.schemas.foodDataCentral.search_result import SearchResult


class FDC_Service:
    def __init__(self, auth_client: FDC_AuthClient):
        """
        Service class that uses FDC_AuthClient to interact with the FoodData Central API.
        """
        self.auth_client = auth_client

    async def get_food(self, fdc_id: str, format: Optional[str] = None, nutrients: Optional[List[int]] = None) -> inline_response200.InlineResponse200:
            """
            Retrieve a single food item by FDC ID.
            """
            endpoint = f"food/{fdc_id}"
            params = {"format": format}
            
            # Add nutrients if provided, as a comma-separated list
            if nutrients and len(nutrients) > 0:
                params["nutrients"] = ",".join(map(str, nutrients))  # Ensure nutrients is a comma-separated string
                
            # Make the GET request and get the response
            response = await self.auth_client.make_get_request(endpoint, params)
            
            # Extract JSON content from the response
            response_data = response.json()
            
            # Print the response for debugging purposes (optional)
            print(response_data)
            
            # Map the JSON response to the Pydantic model
            return inline_response200.InlineResponse200(**response_data)
        
    async def get_foods(self, fdcIds: List[str], format: Optional[str] = None, nutrients: Optional[List[int]] = None) -> List[inline_response200.InlineResponse200]:
        """
        Retrieve multiple food items by FDC IDs using a GET request.

        :param fdcIds: List of FDC IDs to retrieve.
        :param format: Optional format for the response ('abridged' or 'full').
        :param nutrients: Optional list of nutrient IDs to filter by.
        """
        if not fdcIds:
            raise ValueError("fdcIds must not be empty.")
        
        endpoint = "foods"

        # Prepare query parameters
        params = {
            # Join FDC IDs as a comma-separated list
            "fdcIds": ",".join(fdcIds),
            "format": format or "full"  # Default to 'abridged' if format is not provided
        }

        # Add nutrients if provided, as a comma-separated list
        if nutrients and len(nutrients) > 0:
            params["nutrients"] = ",".join(map(str, nutrients))  # Ensure nutrients is a comma-separated string
            
        # Debugging log to check the request params
        logging.info(f"Requesting endpoint {endpoint} with params: {params}")

        # Make the GET request
        response = await self.auth_client.make_get_request(endpoint, params)

        # # Check if the response is valid
        if response.status_code != 200:
            logging.error(f"Failed to retrieve food items. Status code: {response.status_code}, Response: {response.text}")
            response.raise_for_status()

        # Parse and return the response as a list of inline_response200 objects
        return [inline_response200.InlineResponse200(**item) for item in response.json()]

    async def get_foods_list(
        self,
        dataType: Optional[List[str]] = Query(None, description="Filter on a specific data type", example=["Foundation", "SR Legacy"]),
        pageSize: Optional[int] = Query(50, description="Maximum number of results to return", ge=1, le=200, example=25),
        pageNumber: Optional[int] = Query(1, description="Page number to retrieve", example=2),  
        sortBy: Optional[str] = Query(None, description="Specify one of the possible values to sort by", enum=["dataType.keyword", "lowercaseDescription.keyword", "fdcId", "publishedDate"]),
        sortOrder: Optional[str] = Query("asc", description="The sort direction for the results", enum=["asc", "desc"])
    ):
        """
        Retrieve a paged list of foods, optionally filtered by data type, sorted, and paginated.
        """
        endpoint = "foods/list"
        
        # Prepare request parameters
        params = {
            "dataType": ",".join(dataType) if dataType else None,
            "pageSize": pageSize,
            "pageNumber": pageNumber,
            "sortBy": sortBy,
            "sortOrder": sortOrder
        }

        # Clean up None values in params
        params = {k: v for k, v in params.items() if v is not None}

        # Debugging log to check the request params
        logging.info(f"Requesting endpoint {endpoint} with params: {params}")

        # Make GET request to the API
        response = await self.auth_client.make_get_request(endpoint, params)

        # Check for non-200 response
        if response.status_code != 200:
            logging.error(f"Failed to retrieve food items. Status code: {response.status_code}, Response: {response.text}")
            response.raise_for_status()

        # Parse the response content
        response_content = await response.aread()

        try:
            # Parse the JSON response
            response_data = json.loads(response_content)

            # Ensure the response is a list (we expect a list of food items)
            if isinstance(response_data, list):
                return response_data
            else:
                raise ValueError("Unexpected response format: expected a list of food items")

        except json.JSONDecodeError:
            raise ValueError("Unable to parse response from the API")

        except Exception as e:
            logging.error(f"Error processing food list response: {str(e)}")
            raise ValueError(f"Failed to parse API response: {str(e)}")



    async def search_foods(
        self, 
        query: str, 
        data_type: Optional[List[str]] = None, 
        page_size: int = 50, 
        page_number: int = 1,
        sort_by: Optional[str] = None, 
        sort_order: Optional[str] = "asc", 
        brand_owner: Optional[str] = None
    ) -> SearchResult:
        """
        Search foods by a query with optional filters.
        """
        if not query:
            raise ValueError("Query must not be empty.")
        if page_size <= 0 or page_number <= 0:
            raise ValueError("page_size and page_number must be greater than 0.")

        endpoint = "foods/search"
        
        # Prepare query parameters, include only non-empty values
        params = {
            "query": query,
            "pageSize": page_size,
            "pageNumber": page_number,
            "sortOrder": sort_order  # 'asc' by default
        }

        # Add optional parameters if they have values
        if data_type:
            params["dataType"] = ",".join(data_type)
        if sort_by:
            params["sortBy"] = sort_by
        if brand_owner:
            params["brandOwner"] = brand_owner

        # # Log the request parameters for debugging
        # logging.info(f"Requesting {endpoint} with params: {params}")
        
        # Make the GET request
        response = await self.auth_client.make_get_request(endpoint, params)
        
        # Check for non-200 response
        if response.status_code != 200:
            logging.error(f"Failed to search foods. Status code: {response.status_code}, Response: {response.text}")
            response.raise_for_status()

        # Parse and return the response
        try:
            return SearchResult(**response.json())
        except Exception as e:
            logging.error(f"Error parsing search result: {str(e)}")
            raise ValueError(f"Failed to parse search result: {str(e)}")

    async def post_foods(self, body: 'FoodsCriteria') -> List['inline_response200.InlineResponse200']:
            """
            Post multiple FDC IDs and get food details.
            """
            endpoint = "foods"
            data = body.model_dump(by_alias=True)
            
            try:
                response = await self.auth_client.make_post_request(endpoint, data)
                logging.info(f"POST {endpoint}: Received response")
            except Exception as e:
                logging.error(f"POST {endpoint}: Error - {str(e)}")
                raise

            return [inline_response200.InlineResponse200(**item) for item in response]

    async def post_foods_list(self, body: 'FoodListCriteria') -> List['abridged_food_item.AbridgedFoodItem']:
        """
        Post criteria to get a paginated list of foods in the abridged format.
        """
        if body.page_size <= 0 or body.page_number <= 0:
            logging.error(f"POST foods/list: Invalid pagination: page_size={body.page_size}, page_number={body.page_number}")
            raise ValueError("page_size and page_number must be greater than 0.")

        endpoint = "foods/list"
        data = body.model_dump()
        logging.info(f"POST {endpoint}: Requesting with params: {data}")

        try:
            response = await self.auth_client.make_post_request(endpoint, data)
            logging.info(f"POST {endpoint}: Received response")
        except Exception as e:
            logging.error(f"POST {endpoint}: Error - {str(e)}")
            raise

        return [abridged_food_item.AbridgedFoodItem(**item) for item in response]

    async def post_foods_search(self, body: 'FoodSearchCriteria') -> 'SearchResult':
        """
        Post search criteria and get matching food results.
        """
        if not body.query:
            logging.error("POST foods/search: Missing query parameter")
            raise ValueError("query must not be empty.")
        if body.page_size <= 0 or body.page_number <= 0:
            logging.error(f"POST foods/search: Invalid pagination: page_size={body.page_size}, page_number={body.page_number}")
            raise ValueError("page_size and page_number must be greater than 0.")

        endpoint = "foods/search"
        data = body.model_dump()
        logging.info(f"POST {endpoint}: Requesting with params: {data}")

        try:
            response = await self.auth_client.make_post_request(endpoint, data)
            logging.info(f"POST {endpoint}: Received response")
        except Exception as e:
            logging.error(f"POST {endpoint}: Error - {str(e)}")
            raise

        return SearchResult(**response)