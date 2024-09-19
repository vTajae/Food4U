from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import user_routes, fdc_routes, spoon_routes
from app.config.database import async_database_session
from app.api.dependencies.rate_limit_dep import rate_limit_middleware


origins = ["http://localhost:3000", "https://localhost:3001"]

# Define your async context manager for lifespan events
async def lifespan(app: FastAPI):
    await async_database_session.init()  # Initialize DB session
    await async_database_session.create_all()  # Create tables
    yield  # Startup actions done, separate from shutdown
    await async_database_session.close()  # Close DB connection

# Create your FastAPI app using the lifespan context manager
app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"]  # Allows all headers
)

# Middleware to apply rate limiter
@app.middleware("http")
async def rate_limit_middleware_handler(request: Request, call_next):
    await rate_limit_middleware(request)  # Apply rate limiter to the request
    response = await call_next(request)
    return response

# Registering all routes
app.include_router(user_routes.router)
app.include_router(fdc_routes.router)
app.include_router(spoon_routes.router)

