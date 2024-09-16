from fastapi import APIRouter, Body, Depends, HTTPException
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
from app.api.models.spoonacular.analyze_recipe_request import AnalyzeRecipeRequest

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
    mask: Optional[str] = None,
    background_image: Optional[str] = None,
    background_color: Optional[str] = None,
    font_color: Optional[str] = None,
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






# Route to search restaurants
@router.get("/food/restaurants/search")
async def search_restaurants(
    query: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    distance: Optional[float] = None,
    budget: Optional[float] = None,
    cuisine: Optional[str] = None,
    min_rating: Optional[float] = None,
    is_open: Optional[bool] = None,
    sort: Optional[str] = None,
    page: Optional[int] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.search_restaurants(
            query=query, lat=lat, lng=lng, distance=distance, budget=budget,
            cuisine=cuisine, min_rating=min_rating, is_open=is_open, sort=sort, page=page
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
