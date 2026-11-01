from typing import Optional
from fastapi import Depends
from sqlalchemy import insert, select, join
from sqlalchemy.ext.asyncio import AsyncSession


class GoalRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


        # Goals Methods
    async def add_user_goal(self, profile_id: str, goal: str):
        # Add a user goal to the database
        pass