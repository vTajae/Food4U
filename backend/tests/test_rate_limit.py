"""Exercise the production middleware/service; only database I/O is faked."""
from datetime import datetime, timezone
from types import SimpleNamespace

import jwt
import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import QueuePool

import server
from app.api.dependencies import auth_dep, user_dep
from app.api.services import user_service
from app.config.database import async_database_session
from test_request_sessions import RecordingSession


@pytest.fixture
def limited_app(monkeypatch):
    # Hold the clock still: these are six requests in one window, not a timing test.
    now = datetime.now(timezone.utc)
    monkeypatch.setattr(user_service, "datetime", SimpleNamespace(now=lambda tz: now))
    counts, created = {}, []
    # A real SQLAlchemy pool with a no-I/O driver pins resource lifetime in unit
    # tests. Real asyncpg checkout counts are also checked in child acceptance.
    pool = QueuePool(lambda: SimpleNamespace(rollback=lambda: None, close=lambda: None))

    class RateSession(RecordingSession):
        async def __aenter__(self):
            self.connection = pool.connect()
            return await super().__aenter__()

        async def __aexit__(self, *exc):
            await super().__aexit__(*exc)
            self.connection.close()

        async def execute(self, statement):
            assert not self.closed
            if isinstance(statement, str) and statement == "route-probe":
                return None
            values = statement.compile().params
            identifier = values["identifier"]
            count = counts.get(identifier, 0) + 1
            counts[identifier] = count
            return SimpleNamespace(fetchone=lambda: SimpleNamespace(
                request_count=count, last_request=now))

        async def commit(self):
            pass

    def factory():
        session = RateSession([])
        created.append(session)
        return session

    monkeypatch.setattr(async_database_session, "session_factory", factory)
    app = FastAPI()
    app.middleware("http")(server.rate_limit_middleware)

    @app.get("/probe")
    async def probe():
        return {"ok": True}

    @app.get("/session")
    async def session_probe(db=Depends(user_dep.get_db_session)):
        assert created[-2].closed, "limiter session must close before route starts"
        await db.execute("route-probe")
        assert pool.checkedout() == 1
        return {"checkedout": pool.checkedout()}

    with TestClient(app) as client:
        yield client, counts
    assert pool.checkedout() == 0
    assert all(session.closed for session in created)
    pool.dispose()


def bearer(identity, **claims):
    token = jwt.encode({"user_id": identity, **claims}, auth_dep.USER_JWT_SECRET_KEY,
                       algorithm=auth_dep.USER_JWT_ALGORITHM)
    return {"Authorization": "Bearer " + token}


def test_six_requests_return_json_429_without_escaping_exception(limited_app):
    client, _ = limited_app
    responses = [client.get("/probe", headers=bearer("alice")) for _ in range(6)]
    assert [r.status_code for r in responses] == [200] * 5 + [429]
    assert responses[-1].json() == {"detail": "Too many requests"}
    assert int(responses[-1].headers["Retry-After"]) == user_service.RATE_LIMIT_WINDOW


def test_two_valid_identities_at_same_host_get_separate_budgets(limited_app):
    client, counts = limited_app
    for _ in range(5):
        for identity in ("alice", "bob"):
            assert client.get("/probe", headers=bearer(identity)).status_code == 200
    assert sorted(counts.values()) == [5, 5]
    for identity in ("alice", "bob"):
        assert client.get("/probe", headers=bearer(identity)).status_code == 429


@pytest.mark.parametrize("kind", ["forged", "expired", "missing-claim", "bool-claim", "malformed", "absent"])
def test_invalid_bearers_share_host_fallback_not_claim_buckets(limited_app, kind):
    client, counts = limited_app
    responses = []
    for i in range(6):
        if kind == "forged":
            token = jwt.encode({"user_id": f"forged-{i}"}, "not-the-valid-signing-key-123456789", algorithm="HS256")
            headers = {"Authorization": "Bearer " + token}
        elif kind == "expired":
            headers = bearer(f"expired-{i}", exp=1)
        elif kind == "missing-claim":
            token = jwt.encode({}, auth_dep.USER_JWT_SECRET_KEY, algorithm=auth_dep.USER_JWT_ALGORITHM)
            headers = {"Authorization": "Bearer " + token}
        elif kind == "bool-claim":
            headers = bearer(True)
        elif kind == "malformed":
            headers = {"Authorization": f"Basic arbitrary-{i}"}
        else:
            headers = {}
        responses.append(client.get("/probe", headers=headers))
    assert [r.status_code for r in responses] == [200] * 5 + [429]
    assert len(counts) == 1


def test_authenticated_id_cannot_collide_with_host_bucket(limited_app):
    client, counts = limited_app
    for _ in range(5):
        assert client.get("/probe").status_code == 200
    assert client.get("/probe", headers=bearer("testclient")).status_code == 200
    assert len(counts) == 2


def test_legacy_and_normalized_public_ids_follow_auth_contract(limited_app):
    client, counts = limited_app
    for identity in (7, "legacy-7", " legacy-7 ", 7, "legacy-7"):
        assert client.get("/probe", headers=bearer(identity)).status_code == 200
    assert len(counts) == 1
    assert client.get("/probe", headers=bearer(7)).status_code == 429


def test_limiter_session_returned_before_route_pool_checkout(limited_app):
    client, _ = limited_app
    response = client.get("/session", headers=bearer("alice"))
    assert response.status_code == 200
    assert response.json() == {"checkedout": 1}
