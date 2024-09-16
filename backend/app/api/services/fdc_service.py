import logging
from typing import List, Optional

from typing import List, Optional

from app.api.client.fdc_cli import FDC_AuthClient
from app.api.models.foodDataCentral import abridged_food_item, inline_response200
from app.api.models.foodDataCentral.food_list_criteria import FoodListCriteria
from app.api.models.foodDataCentral.food_search_criteria import FoodSearchCriteria
from app.api.models.foodDataCentral.foods_criteria import FoodsCriteria
from app.api.models.foodDataCentral.search_result import SearchResult


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
        self, fdc_ids: List[str] = None, format: Optional[str] = "full",
        nutrients: Optional[List[int]] = None
    ) -> List[abridged_food_item.AbridgedFoodItem]:
        """
        Retrieve a list of food items by FDC IDs, with optional format and nutrients.
        """
        endpoint = "foods"

        # Check if fdc_ids is provided
        if not fdc_ids:
            raise ValueError("fdc_ids must not be empty.")

        # Prepare request parameters
        params = {
            # Convert list of FDC IDs to comma-separated string
            "fdcIds": ",".join(fdc_ids),
            "format": format  # Optional format, default is 'abridged'
        }

        # Add nutrients if provided
        if nutrients and len(nutrients) > 0:
            # Comma-separated list of nutrient IDs
            params["nutrients"] = ",".join(map(str, nutrients))

        # Debugging log to check the request params
        logging.info(f"Requesting endpoint {endpoint} with params: {params}")

        # Make GET request to the API
        response = await self.auth_client.make_get_request(endpoint, params)

        # Check for non-200 response
        if response.status_code != 200:
            logging.error(
                f"Failed to retrieve food items. Status code: {response.status_code}, Response: {response.text}")
            response.raise_for_status()

        # Return the parsed response
        return [abridged_food_item.AbridgedFoodItem(**item) for item in response.json()]

    async def search_foods(
            self, query: str, data_type: Optional[List[str]] = None, page_size: int = 50, page_number: int = 1,
            sort_by: Optional[str] = None, sort_order: Optional[str] = "asc", brand_owner: Optional[str] = None
        ) -> SearchResult:
            """
            Search foods by a query.
            """
            if not query:
                raise ValueError("Query must not be empty.")
            if page_size <= 0 or page_number <= 0:
                raise ValueError("page_size and page_number must be greater than 0.")

            endpoint = "foods/search"
            
            # Prepare query parameters, only include non-empty and non-None values
            params = {
                "query": query,
                "pageSize": page_size,
                "pageNumber": page_number,
                "sortOrder": sort_order  # 'asc' by default
            }

            # Add optional parameters only if they have values
            if data_type:
                params["dataType"] = ",".join(data_type)
            if sort_by:
                params["sortBy"] = sort_by
            if brand_owner:
                params["brandOwner"] = brand_owner

            # Debugging: log the final query parameters
            logging.info(f"Requesting {endpoint} with params: {params}")
            
            # Make the GET request
            response = await self.auth_client.make_get_request(endpoint, params)
            
            # print(response.json())
            
            # Parse and return the response
            return SearchResult(**response.json())


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