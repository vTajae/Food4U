from fastapi import APIRouter
from backend.app.api.services.ai_service import AIService

router = APIRouter()

# Initialize the AI service
ai_service = AIService()

@router.get("/ai")
async def dashboard():
    # Call the service method to get the summary
    summary = ai_service.get_summary()
    return {"message": summary}
