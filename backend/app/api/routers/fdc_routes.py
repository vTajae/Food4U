# app/routes/food_routes.py

from fastapi import APIRouter, Query
from typing import List

from backend.app.api.services.fdc_service import FDC_Service

router = APIRouter()

@router.get("/fdc/v1/food/{fdc_id}")
def get_food(fdc_id: str, format: str, nutrients: int):
    return FDC_Service.get_food(fdc_id, format, nutrients)

@router.get("/fdc/v1/foods")
def get_foods(fdc_ids: List[str] = Query(...), format: str = "abridged", nutrients: int = 0):
    return FDC_Service.get_foods(fdc_ids, format, nutrients)

@router.get("/fdc/v1/foods/list")
def get_foods_list(data_type: str, page_size: int, page_number: int, sort_by: str = "name", sort_order: str = "asc"):
    return FDC_Service.get_foods_list(data_type, page_size, page_number, sort_by, sort_order)

@router.get("/fdc/v1/foods/search")
def search_foods(query: str, data_type: str, page_size: int, page_number: int, sort_by: str = "name", sort_order: str = "asc", brand_owner: str = None):
    return FDC_Service.search_foods(query, data_type, page_size, page_number, sort_by, sort_order, brand_owner)

@router.post("/fdc/v1/foods")
def post_foods(fdc_ids: List[int], format: str = "abridged"):
    return FDC_Service.post_foods(fdc_ids, format)

@router.post("/fdc/v1/foods/list")
def post_foods_list(data_type: str, page_size: int, page_number: int):
    return FDC_Service.post_foods_list(data_type, page_size, page_number)

@router.post("/fdc/v1/foods/search")
def post_foods_search(query: str, page_size: int, page_number: int):
    return FDC_Service.post_foods_search(query, page_size, page_number)
