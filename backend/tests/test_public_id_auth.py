"""
Regression tests for the user-identity boundary.

The JWT's `user_id` claim is the user's stable *public id* (a string the
frontend assigns at registration), never the frontend database's integer
primary key. The backend keys `profile.public_id` on it. These tests pin that
contract at the FastAPI dependency seam without a database.

Run: backend/.venv/Scripts/python -m pytest backend/tests -q
"""
import time


import jwt  # noqa: E402
import pytest  # noqa: E402
from fastapi import Depends, FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.api.dependencies.auth_dep import get_current_user  # noqa: E402
from app.api.dependencies.user_dep import get_user_service  # noqa: E402
from app.api.models.food4u.user import Profile  # noqa: E402
from app.api.routers import user_routes  # noqa: E402


class FakeUserService:
    """Stands in for UserService: an in-memory profile table keyed by public_id."""

    def __init__(self):
        self.profiles = {}
        self.next_id = 100

    async def get_profile_by_public_id(self, public_id: str):
        return self.profiles.get(public_id)

    async def create_profile(self, public_id: str):
        if public_id in self.profiles:
            return self.profiles[public_id]
        profile = Profile(id=self.next_id, public_id=public_id)
        self.next_id += 1
        self.profiles[public_id] = profile
        return profile


def make_token(claims: dict) -> str:
    return jwt.encode({**claims, "exp": int(time.time()) + 600}, "test-secret", algorithm="HS256")


@pytest.fixture
def fake():
    return FakeUserService()


@pytest.fixture
def client(fake):
    app = FastAPI()
    app.include_router(user_routes.router)

    @app.get("/_me")
    async def me(user: Profile = Depends(get_current_user)):
        return {"id": user.id, "public_id": user.public_id}

    app.dependency_overrides[get_user_service] = lambda: fake
    return TestClient(app)


def test_token_with_public_id_resolves_the_profile(client, fake):
    fake.profiles["5f1c3a2e-0000-4000-8000-000000000001"] = Profile(
        id=7, public_id="5f1c3a2e-0000-4000-8000-000000000001"
    )
    r = client.get(
        "/_me",
        headers={"Authorization": f"Bearer {make_token({'user_id': '5f1c3a2e-0000-4000-8000-000000000001'})}"},
    )
    assert r.status_code == 200, r.text
    assert r.json() == {"id": 7, "public_id": "5f1c3a2e-0000-4000-8000-000000000001"}


def test_integer_user_id_claim_maps_to_the_backfilled_legacy_public_id(client, fake):
    """Tokens minted before public ids carried the frontend's integer PK. The
    migration backfills those rows as 'legacy-<n>', so old sessions keep working."""
    fake.profiles["legacy-1"] = Profile(id=1, public_id="legacy-1")
    r = client.get("/_me", headers={"Authorization": f"Bearer {make_token({'user_id': 1})}"})
    assert r.status_code == 200, r.text
    assert r.json() == {"id": 1, "public_id": "legacy-1"}


def test_unknown_public_id_is_403_not_500(client):
    r = client.get("/_me", headers={"Authorization": f"Bearer {make_token({'user_id': 'nobody'})}"})
    assert r.status_code == 403
    assert r.json()["detail"] == "User not found"


def test_post_profile_creates_or_returns_profile_by_public_id(client, fake):
    token = make_token({"user_id": "5f1c3a2e-0000-4000-8000-000000000002"})
    r1 = client.post("/profile", headers={"Authorization": f"Bearer {token}"})
    assert r1.status_code == 200, r1.text
    assert r1.json()["public_id"] == "5f1c3a2e-0000-4000-8000-000000000002"
    r2 = client.post("/profile", headers={"Authorization": f"Bearer {token}"})
    assert r2.json()["id"] == r1.json()["id"], "second call must return the same profile"
    assert len(fake.profiles) == 1


def test_get_profile_is_kept_for_old_clients_and_also_keys_on_public_id(client, fake):
    token = make_token({"user_id": "5f1c3a2e-0000-4000-8000-000000000003"})
    r = client.get("/profile", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    assert r.json()["public_id"] == "5f1c3a2e-0000-4000-8000-000000000003"
