# class SuggestionsService:
#     def __init__(self, repo: SuggestionsRepository):
#         self.repo = repo

#     async def post_suggestions(self, profile_id: str, suggestions: List[Suggestion]):
#         # Process general suggestions
#         for suggestion in suggestions:
#             await self.repo.add_user_suggestion(profile_id, suggestion.name)
