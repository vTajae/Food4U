import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import asynccontextmanager
import uvicorn
from app.api.routers import user_routes, ai_routes
from app.config.database import async_database_session

# Fetch CORS origins from environment variables or provide defaults
DEFAULT_ORIGINS = ["http://localhost:3000", "https://localhost:3001"]
origins = os.getenv("CORS_ORIGINS", ",".join(DEFAULT_ORIGINS)).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Async context manager for lifespan events (startup and shutdown).
    Handles database initialization and cleanup.
    """
    # Startup actions: Initialize the database session and create tables
    await async_database_session.init()
    await async_database_session.create_all()

    yield  # Control passes to the running application

    # Shutdown actions: Close the database session
    await async_database_session.close()


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    Sets up lifespan events, middleware, and routes.
    """
    app = FastAPI(lifespan=lifespan)

    # Configure CORS with dynamic origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,  # CORS origins
        allow_credentials=True,
        allow_methods=["*"],  # Allow all HTTP methods
        allow_headers=["*"],  # Allow all headers
    )

    # Include routes for different API modules
    app.include_router(user_routes.router)
    app.include_router(ai_routes.router)

    return app


if __name__ == "__main__":
    # Get the PORT from the environment or default to 8000 for local development
    port = int(os.getenv("PORT", 8000))

    # Create the FastAPI app
    app = create_app()

    # Run the Uvicorn server with the app, specifying the host and port
    uvicorn.run(app, host="0.0.0.0", port=port)
