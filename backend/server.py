from typing import Union


from fastapi import FastAPI

from app.api.routers import user_routes


app = FastAPI()


app.include_router(user_routes.router)