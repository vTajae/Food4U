"""Real FastAPI dependency graphs, with only the database and AI I/O faked."""
import importlib
import sys
from types import ModuleType, SimpleNamespace

import jwt
import pytest
from fastapi import Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.api.dependencies import auth_dep, food4u_dep, user_dep
from app.config.database import async_database_session


class RecordingSession:
    def __init__(self, events):
        self.events = events
        self.closed = False
        self.close_count = 0

    async def __aenter__(self):
        self.events.append((self, "open"))
        return self

    async def __aexit__(self, *exc):
        self.closed = True
        self.close_count += 1
        self.events.append((self, "close"))

    async def execute(self, statement):
        assert not self.closed, "repository used a session closed before the route"
        self.events.append((self, "repo-call"))
        return SimpleNamespace(scalars=lambda: SimpleNamespace(
            first=lambda: SimpleNamespace(id=1, public_id="session-test")))


@pytest.fixture
def sessions(monkeypatch):
    events, created = [], []

    def factory():
        session = RecordingSession(events)
        created.append(session)
        return session

    monkeypatch.setattr(async_database_session, "session_factory", factory)
    return created, events


@pytest.fixture
def suggestion_factory(monkeypatch):
    # Stub optional AI configuration/I/O, not the real dependency or either SQL
    # repository. These tests target session lifetime, not config validation.
    for name in ("GOOGLE_GEMINI_API_KEY", "QDRANT_URL", "QDRANT_API_KEY",
                 "GOOGLE_DRIVE_FOLDER_ID", "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64"):
        monkeypatch.setenv(name, "session-test-only")
    config = ModuleType("app.config.gemini_config")
    config.GeminiConfig = SimpleNamespace(
        GOOGLE_SERVICE_ACCOUNT_JSON={}, QDRANT_URL="http://localhost",
        get_drive_credentials=lambda: object(),
    )
    monkeypatch.setitem(sys.modules, config.__name__, config)
    ai = ModuleType("app.api.repo.ai_repo")
    ai.AIRepository = lambda: object()
    monkeypatch.setitem(sys.modules, ai.__name__, ai)
    modules = ("app.api.routers.suggestion_routes",
               "app.api.services.food4u.suggestion_service")
    for name in modules:
        monkeypatch.delitem(sys.modules, name, raising=False)
    module = importlib.import_module(modules[0])
    yield module.get_suggestion_service
    for name in modules:
        sys.modules.pop(name, None)


def repositories(service):
    return [getattr(service, name) for name in
            ("repo", "profile_repo", "meal_repo", "user_repo", "auth_repo")
            if hasattr(service, name)]


async def use_repositories(services):
    databases = []
    for service in services:
        for repo in repositories(service):
            assert isinstance(repo.db, RecordingSession), "repo received a context manager, not a session"
            # Exercise the repository's SQL boundary while the route is running.
            await repo.db.execute("route-probe")
            databases.append(repo.db)
    return databases


def assert_closed_after_route(sessions):
    created, events = sessions
    assert len(created) == 1, "one shared dependency session per request"
    session = created[0]
    assert session.close_count == 1
    assert events[0] == (session, "open")
    assert events[-1] == (session, "close")
    assert all(event == "repo-call" for _, event in events[1:-1])


@pytest.mark.parametrize("name", ["profile", "medical", "preference", "goals", "suggestion"])
def test_service_session_lives_until_request_ends(name, sessions, suggestion_factory):
    factory = (suggestion_factory if name == "suggestion" else
               getattr(food4u_dep, f"get_{name}_service"))
    app = FastAPI()

    @app.get("/probe")
    async def probe(service=Depends(factory)):
        await use_repositories([service])
        return {"ok": True}

    with TestClient(app) as client:
        assert client.get("/probe").json() == {"ok": True}
    assert_closed_after_route(sessions)


@pytest.mark.parametrize("fail", [False, True])
def test_all_services_and_authenticated_user_share_one_request_session(
        fail, sessions, suggestion_factory):
    app = FastAPI()

    @app.get("/probe")
    async def probe(
        user=Depends(auth_dep.get_current_user),
        user_service=Depends(user_dep.get_user_service),
        profile=Depends(food4u_dep.get_profile_service),
        medical=Depends(food4u_dep.get_medical_service),
        preference=Depends(food4u_dep.get_preference_service),
        goals=Depends(food4u_dep.get_goals_service),
        suggestion=Depends(suggestion_factory),
    ):
        assert user.public_id == "session-test"
        databases = await use_repositories(
            [user_service, profile, medical, preference, goals, suggestion])
        assert len(databases) == 8
        assert all(db is databases[0] for db in databases)
        if fail:
            raise HTTPException(409, "test route failure")
        return {"ok": True}

    token = jwt.encode({"user_id": "session-test"}, auth_dep.USER_JWT_SECRET_KEY,
                       algorithm=auth_dep.USER_JWT_ALGORITHM)
    with TestClient(app) as client:
        response = client.get("/probe", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == (409 if fail else 200)
    assert_closed_after_route(sessions)
