from fastapi import APIRouter, HTTPException, Depends, Path, Query, Response
from typing import Any, Dict, Optional, List, Union, Tuple
from pydantic import StrictStr, StrictInt, StrictFloat, StrictBool, Field

from app.api.services.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.schemas.spoonacular.analyze_a_recipe_search_query200_response import AnalyzeARecipeSearchQuery200Response
from app.api.schemas.spoonacular.analyze_recipe_instructions200_response import AnalyzeRecipeInstructions200Response
from app.api.schemas.spoonacular.autocomplete_recipe_search200_response_inner import AutocompleteRecipeSearch200ResponseInner
from app.api.schemas.spoonacular.classify_cuisine200_response import ClassifyCuisine200Response
from app.api.schemas.spoonacular.compute_glycemic_load200_response import ComputeGlycemicLoad200Response
from app.api.schemas.spoonacular.compute_glycemic_load_request import ComputeGlycemicLoadRequest
from app.api.schemas.spoonacular.convert_amounts200_response import ConvertAmounts200Response
from app.api.schemas.spoonacular.create_recipe_card200_response import CreateRecipeCard200Response
from app.api.schemas.spoonacular.get_analyzed_recipe_instructions200_response_inner import GetAnalyzedRecipeInstructions200ResponseInner
from app.api.schemas.spoonacular.get_random_recipes200_response import GetRandomRecipes200Response
from app.api.schemas.spoonacular.get_recipe_equipment_by_id200_response import GetRecipeEquipmentByID200Response
from app.api.schemas.spoonacular.get_recipe_ingredients_by_id200_response import GetRecipeIngredientsByID200Response
from app.api.schemas.spoonacular.get_recipe_nutrition_widget_by_id200_response import GetRecipeNutritionWidgetByID200Response
from app.api.schemas.spoonacular.get_recipe_price_breakdown_by_id200_response import GetRecipePriceBreakdownByID200Response
from app.api.schemas.spoonacular.get_similar_recipes200_response_inner import GetSimilarRecipes200ResponseInner
from app.api.schemas.spoonacular.guess_nutrition_by_dish_name200_response import GuessNutritionByDishName200Response
from app.api.schemas.spoonacular.ingredient_information import IngredientInformation
from app.api.schemas.spoonacular.taste_information import TasteInformation
from app.api.schemas.spoonacular.recipe_information import RecipeInformation
from app.api.schemas.spoonacular.search_recipes200_response import SearchRecipes200Response
from app.api.schemas.spoonacular.quick_answer200_response import QuickAnswer200Response
from app.api.schemas.spoonacular.search_recipes_by_ingredients200_response_inner import SearchRecipesByIngredients200ResponseInner
from app.api.schemas.spoonacular.search_recipes_by_nutrients200_response_inner import SearchRecipesByNutrients200ResponseInner
from app.api.schemas.spoonacular.summarize_recipe200_response import SummarizeRecipe200Response

router = APIRouter()

# Analyze Recipe Search Query
@router.get("/analyze", response_model=AnalyzeARecipeSearchQuery200Response)
async def analyze_a_recipe_search_query(
    q: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.analyze_a_recipe_search_query(q=q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Compute Glycemic Load
@router.post("/compute-glycemic-load", response_model=ComputeGlycemicLoad200Response)
async def compute_glycemic_load(
    compute_glycemic_load_request: ComputeGlycemicLoadRequest,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.compute_glycemic_load(compute_glycemic_load_request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Convert Ingredient Amounts
@router.get("/convert-amounts", response_model=ConvertAmounts200Response)
async def convert_amounts(
    ingredient_name: StrictStr,
    source_amount: Union[StrictFloat, StrictInt],
    source_unit: StrictStr,
    target_unit: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.convert_amounts(
            ingredient_name=ingredient_name,
            source_amount=source_amount,
            source_unit=source_unit,
            target_unit=target_unit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create Recipe Card
@router.post("/create-recipe-card", response_model=CreateRecipeCard200Response)
async def create_recipe_card(
    title: StrictStr,
    ingredients: StrictStr,
    instructions: StrictStr,
    ready_in_minutes: Union[StrictFloat, StrictInt],
    servings: Union[StrictFloat, StrictInt],
    mask: StrictStr,
    background_image: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.create_recipe_card(
            title=title, ingredients=ingredients, instructions=instructions,
            ready_in_minutes=ready_in_minutes, servings=servings,
            mask=mask, background_image=background_image
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Extract Recipe from Website
@router.get("/extract", response_model=RecipeInformation)
async def extract_recipe_from_website(
    url: StrictStr,
    force_extraction: Optional[StrictBool] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.extract_recipe_from_website(
            url=url, force_extraction=force_extraction
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get Recipe Information by ID
@router.get("/{id}", response_model=RecipeInformation)
async def get_recipe_information(
    id: StrictInt,
    include_nutrition: Optional[StrictBool] = None,
    add_wine_pairing: Optional[StrictBool] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_recipe_information(
            id=id, include_nutrition=include_nutrition, add_wine_pairing=add_wine_pairing
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get Recipe Ingredients by ID
@router.get("/ingredients/{id}", response_model=GetRecipeIngredientsByID200Response)
async def get_recipe_ingredients_by_id(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_recipe_ingredients_by_id(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Recipe Equipment by ID
@router.get("/{id}/equipment", response_model=GetRecipeEquipmentByID200Response)
async def get_recipe_equipment_by_id(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_recipe_equipment_by_id(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get Recipe Nutrition Widget by ID
@router.get("/nutrition-widget/{id}", response_model=GetRecipeNutritionWidgetByID200Response)
async def get_recipe_nutrition_widget_by_id(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_recipe_nutrition_widget_by_id(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get Recipe Price Breakdown by ID
@router.get("/price-breakdown/{id}", response_model=GetRecipePriceBreakdownByID200Response)
async def get_recipe_price_breakdown_by_id(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_recipe_price_breakdown_by_id(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get Recipe Taste by ID
@router.get("/taste/{id}", response_model=TasteInformation)
async def get_recipe_taste_by_id(
    id: StrictInt,
    normalize: Optional[StrictBool] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_recipe_taste_by_id(id=id, normalize=normalize)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get Similar Recipes
@router.get("/{id}/similar", response_model=List[GetSimilarRecipes200ResponseInner])
async def get_similar_recipes(
    id: StrictInt = Path(..., description="The id of the source recipe for which similar recipes should be found."),  # Use Path for path params
    number: Optional[int] = Query(10, ge=1, le=100, description="The maximum number of items to return (between 1 and 100). Defaults to 10."),
    service: Spoon_Service = Depends(get_spoon_service)
):
    """
    Find recipes which are similar to the given one.

    :param id: The id of the source recipe for which similar recipes should be found.
    :param number: The maximum number of items to return.
    """
    try:
        return await service.get_similar_recipes(id=id, number=number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Guess Nutrition by Dish Name
@router.get("/nutrition/guess", response_model=GuessNutritionByDishName200Response)
async def guess_nutrition_by_dish_name(
    title: StrictStr = Query(..., description="The title of the dish."),
    service: Spoon_Service = Depends(get_spoon_service)
):
    """
    Estimate the macronutrients of a dish based on its title.

    :param title: The title of the dish.
    """
    try:
        return await service.guess_nutrition_by_dish_name(title=title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Parse Ingredients
@router.post("/ingredients/parse", response_model=List[IngredientInformation])
async def parse_ingredients(
    ingredient_list: StrictStr = Query(..., description="The ingredient list of the recipe, one ingredient per line."),
    servings: Union[StrictFloat, StrictInt] = Query(..., description="The number of servings that you can make from the ingredients."),
    language: Optional[StrictStr] = Query(None, description="The language of the input. Either 'en' or 'de'."),
    include_nutrition: Optional[StrictBool] = Query(None, description="Whether nutrition data should be added to correctly parsed ingredients."),
    service: Spoon_Service = Depends(get_spoon_service)
):
    """
    Extract ingredients from plain text.

    :param ingredient_list: The ingredient list of the recipe, one ingredient per line.
    :param servings: The number of servings that you can make from the ingredients.
    :param language: The language of the input ('en' or 'de').
    :param include_nutrition: Whether nutrition data should be added to correctly parsed ingredients.
    """
    try:
        return await service.parse_ingredients(
            ingredient_list=ingredient_list,
            servings=servings,
            language=language,
            include_nutrition=include_nutrition
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price-breakdown-by-id-image")
async def price_breakdown_by_id_image(
    id: StrictInt = Query(..., description="The recipe id."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,
    request_auth: Optional[Dict[StrictStr, Any]] = None,
    content_type: Optional[StrictStr] = None,
    headers: Optional[Dict[StrictStr, Any]] = None,
    host_index: StrictInt = Query(0, ge=0, le=0),
    service: Spoon_Service = Depends(get_spoon_service)
) -> Response:
    """
    Visualize a recipe's price breakdown as an image.
    """
    try:
        image_data = await service.get_price_breakdown_by_id_image(id=id)
        return Response(content=image_data, media_type="image/png")  # or "image/jpeg" depending on the image type
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quick-answer", response_model=QuickAnswer200Response)
async def quick_answer(
    q: StrictStr = Query(..., description="The nutrition-related question."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,
    request_auth: Optional[Dict[StrictStr, Any]] = None,
    content_type: Optional[StrictStr] = None,
    headers: Optional[Dict[StrictStr, Any]] = None,
    host_index: StrictInt = Query(0, ge=0, le=0),
    service: Spoon_Service = Depends(get_spoon_service)
) -> QuickAnswer200Response:
    """
    Answer a nutrition-related natural language question.
    """
    try:
        return await service.get_quick_answer(q=q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recipe-nutrition-label-widget", response_model=str)
async def recipe_nutrition_label_widget(
    id: StrictInt = Query(..., description="The recipe id."),
    default_css: Optional[StrictBool] = Query(None, description="Whether the default CSS should be added to the response."),
    show_optional_nutrients: Optional[StrictBool] = Query(None, description="Whether to show optional nutrients."),
    show_zero_values: Optional[StrictBool] = Query(None, description="Whether to show zero values."),
    show_ingredients: Optional[StrictBool] = Query(None, description="Whether to show a list of ingredients."),
    request_timeout: Optional[
        Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]
    ] = None,
    request_auth: Optional[Dict[StrictStr, Any]] = None,
    content_type: Optional[StrictStr] = None,
    headers: Optional[Dict[StrictStr, Any]] = None,
    host_index: StrictInt = Query(0, ge=0, le=0)
) -> str:
    """
    Get a recipe's nutrition label as an HTML widget.
    """
    # Add your logic to generate the widget (HTML string)
    return "<div>Nutrition Label Widget</div>"

@router.get("/search-recipes", response_model=SearchRecipes200Response)
async def search_recipes(
    query: StrictStr = Query(..., description="The (natural language) search query."),
    cuisine: Optional[StrictStr] = Query(None, description="The cuisine(s) of the recipes."),
    exclude_cuisine: Optional[StrictStr] = Query(None, description="The cuisine(s) the recipes must not match."),
    diet: Optional[StrictStr] = Query(None, description="The diet for which the recipes must be suitable."),
    intolerances: Optional[StrictStr] = Query(None, description="A comma-separated list of intolerances."),
    equipment: Optional[StrictStr] = Query(None, description="The equipment required."),
    include_ingredients: Optional[StrictStr] = Query(None, description="A comma-separated list of ingredients."),
    exclude_ingredients: Optional[StrictStr] = Query(None, description="A comma-separated list of ingredients or ingredient types."),
    type: Optional[StrictStr] = Query(None, description="The type of recipe."),
    instructions_required: Optional[StrictBool] = Query(None, description="Whether the recipes must have instructions."),
    fill_ingredients: Optional[StrictBool] = Query(None, description="Add information about the ingredients."),
    add_recipe_information: Optional[StrictBool] = Query(None, description="Get more information about the recipes."),
    add_recipe_nutrition: Optional[StrictBool] = Query(None, description="Get nutritional information about the recipes."),
    max_ready_time: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum time in minutes."),
    min_servings: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The minimum amount of servings."),
    max_servings: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum amount of servings."),
    ignore_pantry: Optional[StrictBool] = Query(None, description="Ignore typical pantry items."),
    sort: Optional[StrictStr] = Query(None, description="The sorting strategy."),
    sort_direction: Optional[StrictStr] = Query(None, description="Sort direction, 'asc' or 'desc'."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,  # Renamed from _request_timeout
    request_auth: Optional[Dict[StrictStr, Any]] = None,  # Renamed from _request_auth
    content_type: Optional[StrictStr] = None,  # Renamed from _content_type
    headers: Optional[Dict[StrictStr, Any]] = None,  # Renamed from _headers
    host_index: StrictInt = Query(0, ge=0, le=0),
    service: Spoon_Service = Depends(get_spoon_service)
) -> SearchRecipes200Response:
    """
    Search through hundreds of thousands of recipes using advanced filtering and ranking.
    """
    try:
        return await service.search_recipes(
            query=query,
            cuisine=cuisine,
            exclude_cuisine=exclude_cuisine,
            diet=diet,
            intolerances=intolerances,
            equipment=equipment,
            include_ingredients=include_ingredients,
            exclude_ingredients=exclude_ingredients,
            type=type,
            instructions_required=instructions_required,
            fill_ingredients=fill_ingredients,
            add_recipe_information=add_recipe_information,
            add_recipe_nutrition=add_recipe_nutrition,
            max_ready_time=max_ready_time,
            min_servings=min_servings,
            max_servings=max_servings,
            ignore_pantry=ignore_pantry,
            sort=sort,
            sort_direction=sort_direction,
            request_timeout=request_timeout,  # Updated reference
            request_auth=request_auth,  # Updated reference
            headers=headers  # Updated reference
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search-recipes-by-ingredients", response_model=List[SearchRecipesByIngredients200ResponseInner])
async def search_recipes_by_ingredients(
    ingredients: StrictStr = Query(..., description="A comma-separated list of ingredients that the recipes should contain."),
    number: Optional[int] = Query(10, le=100, ge=1, description="The maximum number of items to return."),
    ranking: Optional[StrictInt] = Query(None, description="Maximize used ingredients (1) or minimize missing ingredients (2)."),
    ignore_pantry: Optional[StrictBool] = Query(None, description="Whether to ignore typical pantry items."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,  # Renamed from _request_timeout
    request_auth: Optional[Dict[StrictStr, Any]] = None,  # Renamed from _request_auth
    content_type: Optional[StrictStr] = None,  # Renamed from _content_type
    headers: Optional[Dict[StrictStr, Any]] = None,  # Renamed from _headers
    host_index: StrictInt = Query(0, ge=0, le=0),
    service: Spoon_Service = Depends(get_spoon_service)
) -> List[SearchRecipesByIngredients200ResponseInner]:
    """
    Find recipes based on ingredients you have.
    """
    try:
        return await service.search_recipes_by_ingredients(
            ingredients=ingredients,
            number=number,
            ranking=ranking,
            ignore_pantry=ignore_pantry
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search-recipes-by-nutrients", response_model=List[SearchRecipesByNutrients200ResponseInner])
async def search_recipes_by_nutrients(
    min_carbs: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The minimum amount of carbohydrates."),
    max_carbs: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum amount of carbohydrates."),
    min_protein: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The minimum amount of protein."),
    max_protein: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum amount of protein."),
    min_calories: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The minimum amount of calories."),
    max_calories: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum amount of calories."),
    min_fat: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The minimum amount of fat."),
    max_fat: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum amount of fat."),
    min_alcohol: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The minimum amount of alcohol."),
    max_alcohol: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum amount of alcohol."),
    min_caffeine: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The minimum amount of caffeine."),
    max_caffeine: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="The maximum amount of caffeine."),
    offset: Optional[int] = Query(0, ge=0, le=900, description="The number of results to skip."),
    number: Optional[int] = Query(10, ge=1, le=100, description="The maximum number of items to return."),
    random: Optional[StrictBool] = Query(None, description="If true, random set of recipes is returned."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,  # Renamed from _request_timeout
    service: Spoon_Service = Depends(get_spoon_service)
) -> List[SearchRecipesByNutrients200ResponseInner]:
    """
    Find a set of recipes that adhere to the given nutritional limits.
    """
    try:
        return await service.search_recipes_by_nutrients(
            min_carbs=min_carbs,
            max_carbs=max_carbs,
            min_protein=min_protein,
            max_protein=max_protein,
            min_calories=min_calories,
            max_calories=max_calories,
            min_fat=min_fat,
            max_fat=max_fat,
            min_alcohol=min_alcohol,
            max_alcohol=max_alcohol,
            min_caffeine=min_caffeine,
            max_caffeine=max_caffeine,
            offset=offset,
            number=number,
            random=random
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summarize-recipe", response_model=SummarizeRecipe200Response)
async def summarize_recipe(
    id: StrictInt = Query(..., description="The recipe id."),
    _request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,
    service: Spoon_Service = Depends(get_spoon_service)
) -> SummarizeRecipe200Response:
    """
    Automatically generate a short description summarizing key information about the recipe.
    """
    try:
        return await service.summarize_recipe(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visualize-equipment", response_model=str)
async def visualize_equipment(
    instructions: StrictStr = Query(..., description="The recipe's instructions."),
    view: Optional[StrictStr] = Query(None, description="How to visualize the ingredients: 'grid' or 'list'."),
    default_css: Optional[StrictBool] = Query(None, description="Whether the default CSS should be added."),
    show_backlink: Optional[StrictBool] = Query(None, description="Whether to show a backlink."),
    _request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,
    service: Spoon_Service = Depends(get_spoon_service)
) -> str:
    """
    Visualize the equipment used to make a recipe.
    """
    try:
        return await service.visualize_equipment(
            instructions=instructions, 
            view=view, 
            default_css=default_css, 
            show_backlink=show_backlink
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Autocomplete Recipe Search
@router.get("/autocomplete", response_model=List[AutocompleteRecipeSearch200ResponseInner])
async def autocomplete_recipe_search(
    query: StrictStr,
    number: Optional[int] = Query(10, ge=1, le=100),  # Correct usage of Query
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.autocomplete_recipe_search(query=query, number=number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analyze Recipe Search Query
@router.get("/analyze", response_model=AnalyzeARecipeSearchQuery200Response)
async def analyze_a_recipe_search_query(
    q: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.analyze_a_recipe_search_query(q=q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analyze Recipe Instructions
@router.post("/analyze-instructions", response_model=AnalyzeRecipeInstructions200Response)
async def analyze_recipe_instructions(
    instructions: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.analyze_recipe_instructions(instructions=instructions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Classify Cuisine
@router.post("/classify-cuisine", response_model=ClassifyCuisine200Response)
async def classify_cuisine(
    title: StrictStr,
    ingredient_list: StrictStr,
    language: Optional[StrictStr] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.classify_cuisine(title=title, ingredient_list=ingredient_list, language=language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Visualize Price Breakdown
@router.get("/visualize-price-breakdown", response_model=str)
async def visualize_price_breakdown(
    ingredient_list: StrictStr = Query(..., description="The ingredient list of the recipe, one ingredient per line."),
    servings: Union[StrictFloat, StrictInt] = Query(..., description="The number of servings."),
    language: Optional[StrictStr] = Query(None, description="The language of the input, 'en' or 'de'."),
    mode: Optional[Union[StrictFloat, StrictInt]] = Query(None, description="Mode: 1 = compact, 2 = full."),
    default_css: Optional[StrictBool] = Query(None, description="Whether the default CSS should be added."),
    show_backlink: Optional[StrictBool] = Query(None, description="Whether to show a backlink."),
    service: Spoon_Service = Depends(get_spoon_service)
) -> str:
    try:
        return await service.visualize_price_breakdown(
            ingredient_list=ingredient_list, 
            servings=servings, 
            language=language, 
            mode=mode, 
            default_css=default_css, 
            show_backlink=show_backlink
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Visualize Recipe Equipment by ID
@router.get("/visualize-recipe-equipment-by-id", response_model=str)
async def visualize_recipe_equipment_by_id(
    id: StrictInt = Query(..., description="The recipe id."),
    default_css: Optional[StrictBool] = Query(None, description="Whether the default CSS should be added."),
    service: Spoon_Service = Depends(get_spoon_service)
) -> str:
    try:
        return await service.visualize_recipe_equipment_by_id(id=id, default_css=default_css)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Visualize Recipe Ingredients by ID
@router.get("/visualize-recipe-ingredients-by-id", response_model=str)
async def visualize_recipe_ingredients_by_id(
    id: StrictInt = Query(..., description="The recipe id."),
    default_css: Optional[StrictBool] = Query(None, description="Whether the default CSS should be added."),
    measure: Optional[StrictStr] = Query(None, description="The measure system to use: 'us' or 'metric'."),
    service: Spoon_Service = Depends(get_spoon_service)
) -> str:
    try:
        return await service.visualize_recipe_ingredients_by_id(id=id, default_css=default_css, measure=measure)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Visualize Recipe Nutrition
@router.get("/visualize-recipe-nutrition", response_model=str)
async def visualize_recipe_nutrition(
    ingredient_list: StrictStr = Query(..., description="The ingredient list of the recipe, one ingredient per line."),
    servings: Union[StrictFloat, StrictInt] = Query(..., description="The number of servings."),
    language: Optional[StrictStr] = Query(None, description="The language of the input. Either 'en' or 'de'."),
    default_css: Optional[StrictBool] = Query(None, description="Whether the default CSS should be added to the response."),
    show_backlink: Optional[StrictBool] = Query(None, description="Whether to show a backlink to spoonacular."),
    service: Spoon_Service = Depends(get_spoon_service)
) -> str:
    try:
        return await service.visualize_recipe_nutrition(
            ingredient_list=ingredient_list,
            servings=servings,
            language=language,
            default_css=default_css,
            show_backlink=show_backlink
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Visualize Recipe Nutrition by ID
@router.get("/visualize-recipe-nutrition-by-id", response_model=str)
async def visualize_recipe_nutrition_by_id(
    id: StrictInt = Query(..., description="The recipe id."),
    default_css: Optional[StrictBool] = Query(None, description="Whether the default CSS should be added to the response."),
    service: Spoon_Service = Depends(get_spoon_service)
) -> str:
    try:
        return await service.visualize_recipe_nutrition_by_id(id=id, default_css=default_css)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Visualize Recipe Taste
@router.get("/visualize-recipe-taste", response_model=str)
async def visualize_recipe_taste(
    ingredient_list: StrictStr = Query(..., description="The ingredient list of the recipe, one ingredient per line."),
    language: Optional[StrictStr] = Query(None, description="The language of the input. Either 'en' or 'de'."),
    normalize: Optional[StrictBool] = Query(None, description="Normalize to the strongest taste."),
    rgb: Optional[StrictStr] = Query(None, description="Red, green, blue values for the chart color."),
    service: Spoon_Service = Depends(get_spoon_service)
) -> str:
    try:
        return await service.visualize_recipe_taste(
            ingredient_list=ingredient_list,
            language=language,
            normalize=normalize,
            rgb=rgb
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Recipe Nutrition by ID as Image
@router.get("/recipe-nutrition-by-id-image")
async def recipe_nutrition_by_id_image(
    id: StrictInt = Query(..., description="The recipe id."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,
    request_auth: Optional[Dict[StrictStr, Any]] = None,
    content_type: Optional[StrictStr] = None,
    headers: Optional[Dict[StrictStr, Any]] = None,
    host_index: StrictInt = Query(0, ge=0, le=0),
    service: Spoon_Service = Depends(get_spoon_service)
) -> Response:
    """
    Visualize a recipe's nutritional information as an image.
    """
    try:
        image_data = await service.get_recipe_nutrition_by_id_image(id=id)
        return Response(content=image_data, media_type="image/png")  # Adjust `media_type` as needed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Recipe Nutrition Label as Image
@router.get("/recipe-nutrition-label-image")
async def recipe_nutrition_label_image(
    id: StrictInt = Query(..., description="The recipe id."),
    show_optional_nutrients: Optional[bool] = Query(None, description="Whether to show optional nutrients."),
    show_zero_values: Optional[bool] = Query(None, description="Whether to show zero values."),
    show_ingredients: Optional[bool] = Query(None, description="Whether to show a list of ingredients."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,
    request_auth: Optional[Dict[StrictStr, Any]] = None,
    content_type: Optional[StrictStr] = None,
    headers: Optional[Dict[StrictStr, Any]] = None,
    host_index: StrictInt = Query(0, ge=0, le=0),
    service: Spoon_Service = Depends(get_spoon_service)
) -> Response:
    """
    Get a recipe's nutrition label as an image.
    """
    try:
        image_data = await service.get_recipe_nutrition_label_image(
            id=id, 
            show_optional_nutrients=show_optional_nutrients, 
            show_zero_values=show_zero_values, 
            show_ingredients=show_ingredients
        )
        return Response(content=image_data, media_type="image/png")  # Adjust `media_type` as needed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Recipe Taste by ID as Image
@router.get("/recipe-taste-by-id-image")
async def recipe_taste_by_id_image(
    id: StrictInt = Query(..., description="The recipe id."),
    normalize: Optional[StrictBool] = Query(None, description="Normalize to the strongest taste."),
    rgb: Optional[StrictStr] = Query(None, description="Red, green, blue values for the chart color."),
    request_timeout: Optional[Union[StrictFloat, Tuple[StrictFloat, StrictFloat]]] = None,
    request_auth: Optional[Dict[StrictStr, Any]] = None,
    content_type: Optional[StrictStr] = None,
    headers: Optional[Dict[StrictStr, Any]] = None,
    host_index: StrictInt = Query(0, ge=0, le=0),
    service: Spoon_Service = Depends(get_spoon_service)
) -> Response:
    """
    Get a recipe's taste as an image.
    """
    try:
        image_data = await service.get_recipe_taste_by_id_image(
            id=id, 
            normalize=normalize, 
            rgb=rgb
        )
        return Response(content=image_data, media_type="image/png")  # Adjust `media_type` as needed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
