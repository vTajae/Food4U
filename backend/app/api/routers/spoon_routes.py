from fastapi import APIRouter, Body, Depends, HTTPException, Query
from typing import List, Optional

from pydantic import BaseModel

from app.api.services.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service

from app.api.routers.spoonacular.ingredients_api import router as ingredients_router
from app.api.routers.spoonacular.meal_planning_api import router as meal_planning_router
from app.api.routers.spoonacular.menu_items_api import router as menu_items_router
from app.api.routers.spoonacular.misc_api import router as misc_router
from app.api.routers.spoonacular.products_api import router as products_router
from app.api.routers.spoonacular.recipes_api import router as recipes_router
from app.api.schemas.spoonacular.analyze_recipe_request import AnalyzeRecipeRequest
from app.api.schemas.food4u.restaurant import SearchRestaurantsRequest
from app.api.schemas.spoonacular.search_restaurants200_response import SearchRestaurants200Response

router = APIRouter()

# Include the individual routers under the same master router
router.include_router(ingredients_router, prefix="/ingredients")
router.include_router(meal_planning_router, prefix="/meal-planning")
router.include_router(menu_items_router, prefix="/menu-items")
router.include_router(misc_router, prefix="/misc")
router.include_router(products_router, prefix="/products")
router.include_router(recipes_router, prefix="/recipes")



# Route to generate a recipe card
@router.get("/recipes/{recipe_id}/card")
async def create_recipe_card(
    recipe_id: int,
    mask: Optional[str] = Query(default=None),
    background_image: Optional[str] = Query(default=None),
    background_color: Optional[str] = Query(default=None),
    font_color: Optional[str] = Query(default=None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.create_recipe_card(
            recipe_id, mask=mask, background_image=background_image,
            background_color=background_color, font_color=font_color
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Route to analyze a recipe
@router.post("/recipes/analyze")
async def analyze_recipe(
    analyze_recipe_request: AnalyzeRecipeRequest = Body(...),  # Use Body to grab the JSON payload
    language: Optional[str] = "en",
    include_nutrition: Optional[bool] = False,
    include_taste: Optional[bool] = False,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.analyze_recipe(
            analyze_recipe_request.model_dump(),
            language=language,
            include_nutrition=include_nutrition,
            include_taste=include_taste
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@router.get("/food/restaurants/search", response_model=SearchRestaurants200Response)
async def search_restaurants(
    lat: float = Query(..., description="Latitude is required"),
    lng: float = Query(..., description="Longitude is required"),
    query: Optional[str] = Query(default=None),
    distance: Optional[float] = Query(default=None),
    budget: Optional[float] = Query(default=None),
    cuisine: Optional[str] = Query(default=None),
    min_rating: Optional[float] = Query(default=None),
    is_open: Optional[bool] = Query(default=None),
    sort: Optional[str] = Query(default=None),
    page: Optional[int] = Query(default=None),
    service: Spoon_Service = Depends(get_spoon_service),
) -> SearchRestaurants200Response:
    try:
        result = await service.search_restaurants(
            query, lat, lng, distance, budget, cuisine, min_rating, is_open, sort, page
        )
        
        # You can directly return the result, assuming it's correctly structured
        return SearchRestaurants200Response(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
