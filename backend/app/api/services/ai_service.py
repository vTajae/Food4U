import os
import jwt
import bcrypt
from typing import Optional
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv




load_dotenv()



class AI_Service:

    async def invalidate_refresh_token(self, token: str):
        return await self.auth_repo.invalidate_token(token)
        

    
