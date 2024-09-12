from typing import List, Optional

from typing import List, Optional

from app.api.clients.FDC_auth import FDC_AuthClient
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
        params = {"format": format, "nutrients": nutrients or []}
        response = await self.auth_client.make_get_request(endpoint, params)
        return inline_response200(**response)

    async def get_foods(self, fdc_ids: List[str], format: Optional[str] = None, nutrients: Optional[List[int]] = None) -> List[inline_response200.InlineResponse200]:
        """
        Retrieve multiple food items by FDC IDs using a GET request.
        """
        if not fdc_ids:
            raise ValueError("fdc_ids must not be empty.")

        endpoint = "foods"
        params = {"fdcIds": ",".join(fdc_ids), "format": format, "nutrients": nutrients or []}
        response = await self.auth_client.make_get_request(endpoint, params)
        return [inline_response200.InlineResponse200(**item) for item in response]


    async def get_foods_list(
        self, data_type: Optional[List[str]] = None, page_size: int = 50, page_number: int = 1,
        sort_by: Optional[str] = None, sort_order: Optional[str] = None
    ) -> List[abridged_food_item.AbridgedFoodItem]:
        """
        Retrieve a paginated list of foods in the abridged format.
        """
        if page_size <= 0 or page_number <= 0:
            raise ValueError("page_size and page_number must be greater than 0.")
        
        endpoint = "foods/list"
        
        params = {
        "dataType": "Branded",
        "pageSize": 50,
        "pageNumber": 1,
        "api_key": self.auth_client.api_key  # Ensure you're passing the API key here
    }
        # Only add data_type if it's not empty
        if data_type:
            params["dataType"] = ",".join(data_type)  # Convert list to comma-separated string
        
        # Only add sort_by and sort_order if they're provided
        if sort_by:
            params["sortBy"] = sort_by
        if sort_order:
            params["sortOrder"] = sort_order
            
            
        # Make the request
        response = await self.auth_client.make_get_request(endpoint, params)
        print(response, "response")
        
        return [abridged_food_item.AbridgedFoodItem(**item) for item in response]



    async def search_foods(
        self, query: str, data_type: Optional[List[str]] = None, page_size: int = 50, page_number: int = 1,
        sort_by: Optional[str] = None, sort_order: Optional[str] = None, brand_owner: Optional[str] = None
    ) -> SearchResult:
        """
        Search foods by a query.
        """
        if not query:
            raise ValueError("query must not be empty.")
        if page_size <= 0 or page_number <= 0:
            raise ValueError("page_size and page_number must be greater than 0.")

        endpoint = "foods/search"
        params = {
            "query": query,
            "dataType": data_type or [],
            "pageSize": page_size,
            "pageNumber": page_number,
            "sortBy": sort_by,
            "sortOrder": sort_order,
            "brandOwner": brand_owner
        }
        response = await self.auth_client.make_get_request(endpoint, params)
        return SearchResult(**response)

    async def post_foods(self, body: FoodsCriteria) -> List[inline_response200.InlineResponse200]:
        """
        Post multiple FDC IDs and get food details.
        """
        endpoint = "foods"
        data = body.model_dump()  # Convert the Pydantic model to a dictionary
        response = await self.auth_client.make_post_request(endpoint, data)
        return [inline_response200.InlineResponse200(**item) for item in response]

    async def post_foods_list(self, body: FoodListCriteria) -> List[abridged_food_item.AbridgedFoodItem]:
        """
        Post criteria to get a paginated list of foods in the abridged format.
        """
        if body.page_size <= 0 or body.page_number <= 0:
            raise ValueError("page_size and page_number must be greater than 0.")

        endpoint = "foods/list"
        data = body.model_dump()
        response = await self.auth_client.make_post_request(endpoint, data)
        return [abridged_food_item.AbridgedFoodItem(**item) for item in response]

    async def post_foods_search(self, body: FoodSearchCriteria) -> SearchResult:
        """
        Post search criteria and get matching food results.
        """
        if not body.query:
            raise ValueError("query must not be empty.")
        if body.page_size <= 0 or body.page_number <= 0:
            raise ValueError("page_size and page_number must be greater than 0.")

        endpoint = "foods/search"
        data = body.model_dump()
        response = await self.auth_client.make_post_request(endpoint, data)
        return SearchResult(**response)
