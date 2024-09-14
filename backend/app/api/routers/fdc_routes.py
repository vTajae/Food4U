from typing import List, Optional
from fastapi import APIRouter, Body, Depends, Query

from app.api.services.fdc_service import FDC_Service
from app.api.dependencies.fdc_dep import get_fdc_service
from app.api.models.foodDataCentral.foods_criteria import FoodsCriteria
from app.api.models.foodDataCentral.inline_response200 import InlineResponse200
from app.api.models.foodDataCentral.food_list_criteria import FoodListCriteria
from app.api.models.foodDataCentral.food_search_criteria import FoodSearchCriteria



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
    data_type: Optional[List[str]] = Query(default=[]), 
    page_size: Optional[int] = Query(default=50, gt=0), 
    page_number: Optional[int] = Query(default=1, gt=0), 
    sort_by: Optional[str] = Query(default=None), 
    sort_order: Optional[str] = Query(default="asc"), 
    fdc_service: FDC_Service = Depends(get_fdc_service)
):
    """
    Fetch a paginated list of foods in the abridged format.
    """
    return await fdc_service.get_foods_list(data_type, page_size, page_number, sort_by, sort_order)


@router.get("/fdc/v1/foods/search")
async def search_foods(
    query: str, 
    data_type: Optional[List[str]] = Query(default=None),  # Changed default to None
    page_size: Optional[int] = Query(default=50, gt=0), 
    page_number: Optional[int] = Query(default=1, gt=0), 
    sort_by: Optional[str] = Query(default=None), 
    sort_order: Optional[str] = Query(default="asc"), 
    brand_owner: Optional[str] = Query(default=None), 
    fdc_service: FDC_Service = Depends(get_fdc_service)
):
    """
    Search foods by query.
    """
    return await fdc_service.search_foods(query, data_type, page_size, page_number, sort_by, sort_order, brand_owner)



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
