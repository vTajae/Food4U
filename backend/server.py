from fastapi import FastAPI, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import user_routes
from app.config.database import async_database_session
from app.api.routers import ai_routes
from app.api.routers import fdc_routes
from app.api.routers import spoon_routes
from app.api.dependencies.rate_limit_dep import rate_limit_middleware


origins = ["http://localhost:3000", "https://localhost:3001"]

# Define your async context manager for lifespan events


@asynccontextmanager
async def lifespan(app: FastAPI):

    await async_database_session.init()
    await async_database_session.create_all()

    yield  # This yield separates startup and shutdown actions

    # Perform shutdown actions
    await async_database_session.close()  # Close database connection

# Create your FastAPI app using the lifespan context manager
app = FastAPI(lifespan=lifespan)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"]  # Allows all headers
)

# Apply the rate limiter as middleware
@app.middleware("http")
async def rate_limit_middleware_handler(request: Request, call_next):
    await rate_limit_middleware(request)  # Apply rate limiter to the request
    response = await call_next(request)
    return response

# app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(fdc_routes.router)
app.include_router(spoon_routes.router)

# app.include_router(ai_routes.router)






