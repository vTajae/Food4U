from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import user_routes, fdc_routes, spoon_routes, suggestion_routes
from app.config.database import async_database_session
from app.api.dependencies.user_dep import get_user_service





origins = ["https://food4u.pages.dev/"]

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



@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Use the session correctly via async_database_session.get_session()
    async with async_database_session.get_session() as db:
        user_service = await get_user_service(db)  # Inject the db session into UserService
        await user_service.rate_limiter(request)  # Call the rate limiter logic

        # Call the next middleware or route
        response = await call_next(request)

    return response


# Registering all routes
app.include_router(user_routes.router)
app.include_router(fdc_routes.router)
app.include_router(spoon_routes.router)
app.include_router(suggestion_routes.router)





