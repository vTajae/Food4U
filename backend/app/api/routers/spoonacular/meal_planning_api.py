from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Union, Tuple, Dict

from pydantic import StrictStr, StrictInt, StrictFloat, Field
from app.api.services.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.schemas.spoonacular.add_meal_plan_template200_response import AddMealPlanTemplate200Response
from app.api.schemas.spoonacular.generate_meal_plan200_response import GenerateMealPlan200Response
from app.api.schemas.spoonacular.get_meal_plan_template200_response import GetMealPlanTemplate200Response
from app.api.schemas.spoonacular.get_meal_plan_templates200_response import GetMealPlanTemplates200Response
from app.api.schemas.spoonacular.get_meal_plan_week200_response import GetMealPlanWeek200Response
from app.api.schemas.spoonacular.get_shopping_list200_response import GetShoppingList200Response

router = APIRouter()

# Add Meal Plan Template
@router.post("/{username}/templates", response_model=AddMealPlanTemplate200Response)
async def add_meal_plan_template(
    username: StrictStr,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.add_meal_plan_template(username=username, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Add to Meal Plan
@router.post("/{username}/items")
async def add_to_meal_plan(
    username: StrictStr,
    hash: StrictStr,
    add_to_meal_plan_request: dict,  # Define actual model in your project
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.add_to_meal_plan(username=username, hash=hash, add_to_meal_plan_request=add_to_meal_plan_request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Generate Meal Plan
@router.get("/generate", response_model=GenerateMealPlan200Response)
async def generate_meal_plan(
    time_frame: Optional[StrictStr] = None,
    target_calories: Optional[Union[StrictFloat, StrictInt]] = None,
    diet: Optional[StrictStr] = None,
    exclude: Optional[StrictStr] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.generate_meal_plan(
            time_frame=time_frame,
            target_calories=target_calories,
            diet=diet,
            exclude=exclude
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Generate Shopping List
@router.post("/{username}/shopping-list", response_model=GetShoppingList200Response)
async def generate_shopping_list(
    username: StrictStr,
    start_date: StrictStr,
    end_date: StrictStr,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.generate_shopping_list(
            username=username,
            start_date=start_date,
            end_date=end_date,
            hash=hash
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Meal Plan Template
@router.get("/{username}/templates/{id}", response_model=GetMealPlanTemplate200Response)
async def get_meal_plan_template(
    username: StrictStr,
    id: StrictInt,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_meal_plan_template(username=username, id=id, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get All Meal Plan Templates
@router.get("/{username}/templates", response_model=GetMealPlanTemplates200Response)
async def get_meal_plan_templates(
    username: StrictStr,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_meal_plan_templates(username=username, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Meal Plan Week
@router.get("/{username}/week/{start_date}", response_model=GetMealPlanWeek200Response)
async def get_meal_plan_week(
    username: StrictStr,
    start_date: StrictStr,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_meal_plan_week(username=username, start_date=start_date, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Shopping List
@router.get("/{username}/shopping-list", response_model=GetShoppingList200Response)
async def get_shopping_list(
    username: StrictStr,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_shopping_list(username=username, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Clear Meal Plan Day
@router.delete("/{username}/day/{var_date}")
async def clear_meal_plan_day(
    username: StrictStr,
    var_date: StrictStr,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.clear_meal_plan_day(username=username, var_date=var_date, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete from Meal Plan
@router.delete("/{username}/items/{id}")
async def delete_from_meal_plan(
    username: StrictStr,
    id: StrictInt,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.delete_from_meal_plan(username=username, id=id, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete from Shopping List
@router.delete("/{username}/shopping-list/{id}")
async def delete_from_shopping_list(
    username: StrictStr,
    id: StrictInt,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.delete_from_shopping_list(username=username, id=id, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete Meal Plan Template
@router.delete("/{username}/templates/{id}")
async def delete_meal_plan_template(
    username: StrictStr,
    id: StrictInt,
    hash: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.delete_meal_plan_template(username=username, id=id, hash=hash)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

