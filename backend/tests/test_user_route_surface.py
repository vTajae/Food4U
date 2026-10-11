"""The backend consumes public-id JWTs; login/refresh belong to the frontend."""

from fastapi import FastAPI

from app.api.routers import user_routes


def test_user_router_excludes_dead_auth_and_keeps_profile_routes():
    app = FastAPI()
    app.include_router(user_routes.router)
    # New FastAPI versions retain included routers rather than copying routes.
    # This fixture includes one router without a prefix or nested inclusions.
    app_routes = []
    for route in app.routes:
        included_router = getattr(route, "original_router", None)
        app_routes.extend(included_router.routes if included_router else [route])
    routes = {
        (method, route.path)
        for route in app_routes
        for method in getattr(route, "methods", ())
    }

    assert ("POST", "/login") not in routes
    assert ("GET", "/refresh") not in routes
    assert {
        ("POST", "/profile"),
        ("GET", "/profile"),
        ("GET", "/user/profile"),
        ("POST", "/user/medical"),
        ("POST", "/welcome"),
        ("GET", "/refs"),
        ("POST", "/diet-types/"),
        ("GET", "/diet-types/"),
        ("GET", "/dashboard"),
    } <= routes
    assert next(
        route for route in app_routes
        if getattr(route, "path", None) == "/profile" and "GET" in route.methods
    ).deprecated is True

    paths = app.openapi()["paths"]
    assert "/login" not in paths
    assert "/refresh" not in paths
