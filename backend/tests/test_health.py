"""Health requests must not acquire a database session after startup."""
import pytest
from fastapi.testclient import TestClient

import server


@pytest.fixture
def unavailable_database(monkeypatch):
    calls = []

    def factory():
        calls.append(True)
        raise RuntimeError("Database must not be used by health requests")

    monkeypatch.setattr(server.async_database_session, "session_factory", factory)
    # Deliberately do not enter TestClient's lifespan: startup is allowed to
    # initialize Neon; this contract covers requests on an already started app.
    client = TestClient(server.app, raise_server_exceptions=False)
    try:
        yield client, calls
    finally:
        client.close()


@pytest.mark.parametrize("path", ["/health", "/health?probe=wake"])
def test_health_returns_ok_without_opening_database(unavailable_database, path):
    client, calls = unavailable_database
    response = client.get(path)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert calls == []


@pytest.mark.parametrize("path", ["/health/", "/health-extra", "/dashboard"])
def test_only_exact_health_path_bypasses_database(unavailable_database, path):
    client, calls = unavailable_database
    response = client.get(path, follow_redirects=False)
    assert response.status_code == 500
    assert calls == [True]
