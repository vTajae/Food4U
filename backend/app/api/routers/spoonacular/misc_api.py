from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, Union, Tuple, Dict

from pydantic import StrictStr, StrictInt, StrictFloat, Field
from app.api.services.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.schemas.spoonacular.detect_food_in_text200_response import DetectFoodInText200Response
from app.api.schemas.spoonacular.get_a_random_food_joke200_response import GetARandomFoodJoke200Response
from app.api.schemas.spoonacular.get_conversation_suggests200_response import GetConversationSuggests200Response
from app.api.schemas.spoonacular.image_analysis_by_url200_response import ImageAnalysisByURL200Response
from app.api.schemas.spoonacular.image_classification_by_url200_response import ImageClassificationByURL200Response
from app.api.schemas.spoonacular.search_all_food200_response import SearchAllFood200Response
from app.api.schemas.spoonacular.search_custom_foods200_response import SearchCustomFoods200Response
from app.api.schemas.spoonacular.search_food_videos200_response import SearchFoodVideos200Response
from app.api.schemas.spoonacular.search_site_content200_response import SearchSiteContent200Response
from app.api.schemas.spoonacular.talk_to_chatbot200_response import TalkToChatbot200Response

router = APIRouter()

# Detect Food in Text
@router.post("/detect-food-in-text", response_model=DetectFoodInText200Response)
async def detect_food_in_text(
    text: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.detect_food_in_text(text=text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Detect Food in Text
@router.post("/detect-food-in-text", response_model=DetectFoodInText200Response)
async def detect_food_in_text(
    text: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.detect_food_in_text(text=text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get a Random Food Joke
@router.get("/random-food-joke", response_model=GetARandomFoodJoke200Response)
async def get_a_random_food_joke(
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_a_random_food_joke()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Conversation Suggestions
@router.get("/conversation-suggests", response_model=GetConversationSuggests200Response)
async def get_conversation_suggests(
    query: StrictStr,
    number: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_conversation_suggests(query=query, number=number)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Random Food Trivia
@router.get("/random-food-trivia", response_model=GetARandomFoodJoke200Response)
async def get_random_food_trivia(
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_random_food_trivia()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Image Analysis by URL
@router.post("/image-analysis", response_model=ImageAnalysisByURL200Response)
async def image_analysis_by_url(
    image_url: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.image_analysis_by_url(image_url=image_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Image Classification by URL
@router.post("/image-classification", response_model=ImageClassificationByURL200Response)
async def image_classification_by_url(
    image_url: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.image_classification_by_url(image_url=image_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search All Food
@router.get("/search-all-food", response_model=SearchAllFood200Response)
async def search_all_food(
    query: StrictStr,
    offset: Optional[int] = Query(None, ge=0, le=900),
    number: Optional[int] = Query(10, ge=1, le=100),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.search_all_food(query=query, offset=offset, number=number)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search Custom Foods
@router.get("/search-custom-foods", response_model=SearchCustomFoods200Response)
async def search_custom_foods(
    query: StrictStr,
    username: StrictStr,
    hash: StrictStr,
    offset: Optional[int] = Query(None, ge=0, le=900),
    number: Optional[int] = Query(10, ge=1, le=100),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.search_custom_foods(
            query=query,
            username=username,
            hash=hash,
            offset=offset,
            number=number
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search Food Videos
@router.get("/search-food-videos", response_model=SearchFoodVideos200Response)
async def search_food_videos(
    query: StrictStr,
    type: Optional[StrictStr] = None,
    cuisine: Optional[StrictStr] = None,
    diet: Optional[StrictStr] = None,
    include_ingredients: Optional[StrictStr] = None,
    exclude_ingredients: Optional[StrictStr] = None,
    min_length: Optional[Union[StrictFloat, StrictInt]] = None,
    max_length: Optional[Union[StrictFloat, StrictInt]] = None,
    offset: Optional[int] = Query(None, ge=0, le=900),
    number: Optional[int] = Query(10, ge=1, le=100),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.search_food_videos(
            query=query,
            type=type,
            cuisine=cuisine,
            diet=diet,
            include_ingredients=include_ingredients,
            exclude_ingredients=exclude_ingredients,
            min_length=min_length,
            max_length=max_length,
            offset=offset,
            number=number
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search Site Content
@router.get("/search-site-content", response_model=SearchSiteContent200Response)
async def search_site_content(
    query: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.search_site_content(query=query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Talk to Chatbot
@router.post("/talk-to-chatbot", response_model=TalkToChatbot200Response)
async def talk_to_chatbot(
    text: StrictStr,
    context_id: Optional[StrictStr] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.talk_to_chatbot(text=text, context_id=context_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))