from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, Union, Tuple, Dict

from pydantic import StrictStr, StrictInt, StrictFloat, StrictBool, Field
from app.api.services.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.schemas.spoonacular.autocomplete_product_search200_response import AutocompleteProductSearch200Response
from app.api.schemas.spoonacular.menu_item import MenuItem
from app.api.schemas.spoonacular.search_menu_items200_response import SearchMenuItems200Response

router = APIRouter()


# Get Menu Item Information
@router.get("/{id}", response_model=MenuItem)
async def get_menu_item_information(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_menu_item_information(id=id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Menu Item Nutrition by ID Image
@router.get("/{id}/nutrition-image")
async def menu_item_nutrition_by_id_image(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.menu_item_nutrition_by_id_image(id=id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# Autocomplete Menu Item Search
@router.get("/autocomplete", response_model=AutocompleteProductSearch200Response)
async def autocomplete_menu_item_search(
    query: StrictStr,
    number: Optional[int] = Query(10, ge=1, le=25, description="The number of results to return (between 1 and 25)."),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.autocomplete_menu_item_search(query=query, number=number)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Menu Item Information
@router.get("/{id}", response_model=MenuItem)
async def get_menu_item_information(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_menu_item_information(id=id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Menu Item Nutrition by ID Image
@router.get("/{id}/nutrition-image")
async def menu_item_nutrition_by_id_image(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.menu_item_nutrition_by_id_image(id=id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Menu Item Nutrition Label Image
@router.get("/{id}/nutrition-label-image")
async def menu_item_nutrition_label_image(
    id: StrictInt,
    show_optional_nutrients: Optional[StrictBool] = Query(None),
    show_zero_values: Optional[StrictBool] = Query(None),
    show_ingredients: Optional[StrictBool] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.menu_item_nutrition_label_image(
            id=id,
            show_optional_nutrients=show_optional_nutrients,
            show_zero_values=show_zero_values,
            show_ingredients=show_ingredients
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Menu Item Nutrition Label Widget
@router.get("/{id}/nutrition-label-widget")
async def menu_item_nutrition_label_widget(
    id: StrictInt,
    default_css: Optional[StrictBool] = Query(None),
    show_optional_nutrients: Optional[StrictBool] = Query(None),
    show_zero_values: Optional[StrictBool] = Query(None),
    show_ingredients: Optional[StrictBool] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.menu_item_nutrition_label_widget(
            id=id,
            default_css=default_css,
            show_optional_nutrients=show_optional_nutrients,
            show_zero_values=show_zero_values,
            show_ingredients=show_ingredients
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search Menu Items
@router.get("/search", response_model=SearchMenuItems200Response)
async def search_menu_items(
    query: StrictStr,
    min_calories: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_calories: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_carbs: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_carbs: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_protein: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_protein: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_fat: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_fat: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    add_menu_item_information: Optional[StrictBool] = Query(None),
    offset: Optional[int] = Query(0, ge=0, le=900),
    number: Optional[int] = Query(10, ge=1, le=100, description="The maximum number of items to return (between 1 and 100). Defaults to 10."),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.search_menu_items(
            query=query,
            min_calories=min_calories,
            max_calories=max_calories,
            min_carbs=min_carbs,
            max_carbs=max_carbs,
            min_protein=min_protein,
            max_protein=max_protein,
            min_fat=min_fat,
            max_fat=max_fat,
            add_menu_item_information=add_menu_item_information,
            offset=offset,
            number=number
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Visualize Menu Item Nutrition by ID
@router.get("/{id}/nutrition-widget")
async def visualize_menu_item_nutrition_by_id(
    id: StrictInt,
    default_css: Optional[StrictBool] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.visualize_menu_item_nutrition_by_id(id=id, default_css=default_css)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
