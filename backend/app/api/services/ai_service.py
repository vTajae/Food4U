from app.api.repo.ai_repo import AIRepository

class AIService:
    def __init__(self):
        # Initialize the repository
        self.repository = AIRepository()

    def get_summary(self):
        # Query the repository to summarize the content of the document directory
        response = self.repository.query("Summarize the content of the document in the directory")
        return response.response

    async def invalidate_refresh_token(self, token: str):
        # Token invalidation logic (placeholder for actual token handling)
        return {"message": "Token invalidated"}
