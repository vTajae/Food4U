from typing import List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Query

from app.api.services.fdc.fdc_service import FDC_Service
from app.api.dependencies.fdc_dep import get_fdc_service
from app.api.schemas.foodDataCentral.foods_criteria import FoodsCriteria
from app.api.schemas.foodDataCentral.inline_response200 import InlineResponse200
from app.api.schemas.foodDataCentral.food_list_criteria import FoodListCriteria
from app.api.schemas.foodDataCentral.food_search_criteria import FoodSearchCriteria
from app.api.schemas.foodDataCentral.abridged_food_item import AbridgedFoodItem
from app.api.schemas.foodDataCentral.search_result import SearchResult



router = APIRouter()




@router.get("/fdc/v1/food/{fdc_id}")
async def get_food(
    fdc_id: str, 
    format: Optional[str] = Query(default="full"), 
    nutrients: Optional[List[int]] = Query(default=None), 
    fdc_service: FDC_Service = Depends(get_fdc_service)
):
    """
    Fetch a single food item by FDC ID.
    """
    return await fdc_service.get_food(fdc_id, format, nutrients)


@router.get("/fdc/v1/foods")
async def get_foods(
    fdcIds: List[str] = Query(default=[]),  # List of FDC IDs, passed as repeating params
    format: Optional[str] = Query(default="full"),  # Default is 'full'
    nutrients: Optional[List[int]] = Query(default=None),  # List of nutrient IDs (fix)
    fdc_service: FDC_Service = Depends(get_fdc_service)  # Inject the service
):
    """
    Fetch multiple food items by FDC IDs, format, and optional nutrients.
    """
    return await fdc_service.get_foods(fdcIds, format, nutrients)


@router.get("/fdc/v1/foods/list")
async def get_foods_list(
    data_type: Optional[List[str]] = Query(default=None, description="Filter by data type", example=["Foundation", "SR Legacy"]), 
    page_size: Optional[int] = Query(default=50, gt=0, le=200, description="Max number of results per page", example=25), 
    page_number: Optional[int] = Query(default=1, gt=0, description="Page number to retrieve", example=2), 
    sort_by: Optional[str] = Query(default=None, description="Field to sort by", enum=["dataType.keyword", "lowercaseDescription.keyword", "fdcId", "publishedDate"]), 
    sort_order: Optional[str] = Query(default="asc", description="Sort order", enum=["asc", "desc"]), 
    fdc_service: FDC_Service = Depends(get_fdc_service)
) -> List[AbridgedFoodItem]:
    """
    Fetch a paginated list of foods in the abridged format.
    """
    try:
        # Call the service to fetch the food list
        result = await fdc_service.get_foods_list(
            dataType=data_type, 
            pageSize=page_size, 
            pageNumber=page_number, 
            sortBy=sort_by, 
            sortOrder=sort_order
        )
        
        # Return the result, properly mapping it to AbridgedFoodItem instances
        return [AbridgedFoodItem(**item) for item in result if isinstance(item, dict)]
    except ValueError as e:
        # Handle expected errors, like invalid parameters (400 Bad Request)
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        # Catch unexpected errors (500 Internal Server Error)
        raise HTTPException(status_code=500, detail="Internal Server Error: " + str(e))



@router.get("/fdc/v1/foods/search")
async def search_foods(
    query: str = Query(..., description="Search keywords. Example: 'cheddar cheese'"),  # Required
    data_type: Optional[List[str]] = Query(None, description="Optional data type filters", example=["Foundation", "SR Legacy"]),
    page_size: Optional[int] = Query(50, gt=0, le=200, description="Maximum results per page", example=25),
    page_number: Optional[int] = Query(1, gt=0, description="Page number to retrieve", example=2),
    sort_by: Optional[str] = Query(None, description="Field to sort by", example="dataType.keyword"),
    sort_order: Optional[str] = Query("asc", description="Sort order", enum=["asc", "desc"], example="asc"),
    brand_owner: Optional[str] = Query(None, description="Filter results by brand owner", example="Kar Nut Products Company"),
    fdc_service: FDC_Service = Depends(get_fdc_service)
) -> SearchResult:
    """
    Search foods by query with optional filters for data type, brand owner, and pagination/sorting.
    """
    try:
        # Call the service to search for foods
        result = await fdc_service.search_foods(
            query=query,
            data_type=data_type,
            page_size=page_size,
            page_number=page_number,
            sort_by=sort_by,
            sort_order=sort_order,
            brand_owner=brand_owner
        )
        return result  # Should be of type SearchResult

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error: " + str(e))


@router.post("/fdc/v1/foods")
async def post_foods(
    body: FoodsCriteria = Body(...),  # Use Body to grab the JSON payload
    fdc_service: FDC_Service = Depends(get_fdc_service)
):
    """
    Post FDC IDs to retrieve food details.
    """
    return await fdc_service.post_foods(body)


@router.post("/fdc/v1/foods/list")
async def post_foods_list(
    body: FoodListCriteria = Body(...),  # Use Body to grab the JSON payload
    fdc_service: FDC_Service = Depends(get_fdc_service)
):
    """
    Post criteria to retrieve a paginated list of foods.
    """
    return await fdc_service.post_foods_list(body)


@router.post("/fdc/v1/foods/search")
async def post_foods_search(
    body: FoodSearchCriteria = Body(...),  # Use Body to grab the JSON payload
    fdc_service: FDC_Service = Depends(get_fdc_service)
):
    """
    Post search criteria to retrieve matching food results.
    """
    return await fdc_service.post_foods_search(body)
