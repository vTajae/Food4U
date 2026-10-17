"""The non-AI application must not require or import the optional AI stack."""
import base64
import importlib.util
import os
from pathlib import Path
import subprocess
import sys
import textwrap

import pytest

BACKEND = Path(__file__).resolve().parents[1]
AI_REQUIRED = (
    "GOOGLE_GEMINI_API_KEY", "QDRANT_URL", "QDRANT_API_KEY",
    "GOOGLE_DRIVE_FOLDER_ID", "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64",
)
requires_google = pytest.mark.skipif(
    importlib.util.find_spec("google") is None,
    reason="Optional Google SDK absent; AI config cases run in .venv311",
)


def run_isolated(source):
    # Allowlist OS plumbing, not inherited app settings or pytest defaults.
    env = {k: v for k, v in os.environ.items()
           if k.upper() in {"SYSTEMROOT", "WINDIR", "PATH", "TEMP", "TMP",
                            "USERPROFILE", "APPDATA", "LOCALAPPDATA", "HOME"}}
    env.update(DATABASE_URL="postgresql+asyncpg://u:p@localhost:5432/test",
               USER_JWT_SECRET_KEY="test-only-secret", USER_JWT_ALGORITHM="HS256")
    result = subprocess.run(
        [sys.executable, "-c", textwrap.dedent("""
            import dotenv
            dotenv.load_dotenv = lambda *args, **kwargs: False
            import sys
            def no_network(event, args):
                if event in ('socket.connect', 'socket.getaddrinfo'):
                    raise RuntimeError('NETWORK_FORBIDDEN_IN_UNIT_TEST')
            sys.addaudithook(no_network)
        """) + textwrap.dedent(source)],
        cwd=BACKEND, env=env, capture_output=True, text=True, timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_server_import_without_ai_configuration():
    run_isolated("""
        import sys
        preloaded = set(sys.modules)
        import server
        forbidden = ('google', 'googleapiclient', 'llama_index', 'llama_cloud',
                     'qdrant_client', 'app.api.repo.ai_repo',
                     'app.api.services.food4u.suggestion_service',
                     'app.config.llama_config', 'app.config.gemini_config')
        loaded = [name for name in sys.modules.keys() - preloaded if any(
            name == root or name.startswith(root + '.') for root in forbidden)]
        assert not loaded, loaded
        server.app.openapi()  # FastAPI must also resolve lazy type annotations.
    """)


def test_suggestion_factory_without_ai_configuration():
    run_isolated("""
        import logging
        from fastapi import HTTPException
        from app.api.routers.suggestion_routes import get_suggestion_service
        class Capture(logging.Handler):
            def emit(self, record):
                messages.append(record.getMessage())
        messages = []
        logging.getLogger().addHandler(Capture())
        try:
            get_suggestion_service(object())
        except HTTPException as exc:
            assert exc.status_code == 503
            assert exc.detail == 'AI suggestions are not configured'
        else:
            raise AssertionError('unconfigured factory succeeded')
        for name in ('GOOGLE_GEMINI_API_KEY', 'QDRANT_URL', 'QDRANT_API_KEY',
                     'GOOGLE_DRIVE_FOLDER_ID', 'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'):
            assert name in ' '.join(messages)
    """)


def test_suggestion_http_guard_precedes_other_optional_clients(monkeypatch):
    import dotenv
    monkeypatch.setattr(dotenv, "load_dotenv", lambda *args, **kwargs: False)
    for key in (*AI_REQUIRED, "REQUEST_TIMEOUT", "FDC_API_KEY", "SPOONACULAR_API_KEY"):
        monkeypatch.delenv(key, raising=False)
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from app.api.routers import suggestion_routes as routes
    app = FastAPI()
    app.include_router(routes.router)
    app.dependency_overrides[routes.get_current_user] = lambda: object()
    app.dependency_overrides[routes.get_db_session] = lambda: object()
    app.dependency_overrides[routes.get_profile_service] = lambda: object()
    with TestClient(app) as client:
        response = client.post("/api/suggestion", json={})
    assert response.status_code == 503
    assert response.json() == {"detail": "AI suggestions are not configured"}


def test_request_timeout_default():
    run_isolated("""
        from app.config.llama_config import AIConfig
        assert AIConfig.REQUEST_TIMEOUT == 30.0
    """)


@requires_google
@pytest.mark.parametrize("name,value", [
    ("REQUEST_TIMEOUT", "not-a-number-canary"),
    ("REQUEST_TIMEOUT", "nan"),
    ("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64", "invalid-base64-canary"),
    *[("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64", base64.b64encode(value.encode()).decode())
      for value in ('null', '[]', '42', '"secret-canary"', '{}')],
])
def test_invalid_configuration_is_redacted_503(name, value):
    run_isolated(f"""
        import logging
        import os
        from fastapi import HTTPException
        from app.api.routers.suggestion_routes import get_suggestion_service
        for name in {AI_REQUIRED!r}:
            os.environ[name] = 'secret-canary'
        os.environ['GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'] = 'e30='
        os.environ[{name!r}] = {value!r}
        class Capture(logging.Handler):
            def emit(self, record):
                messages.append(record.getMessage())
        messages = []
        logging.getLogger().addHandler(Capture())
        try:
            get_suggestion_service(object())
        except HTTPException as exc:
            assert exc.status_code == 503
            assert exc.detail == 'AI suggestions are not configured'
        else:
            raise AssertionError('invalid config accepted')
        assert {name!r} in ' '.join(messages)
        assert 'canary' not in ' '.join(messages)
    """)


@requires_google
def test_configured_factory_keeps_service_wiring():
    # Provider I/O is mocked; real config validation and service wiring are not.
    run_isolated(f"""
        import os
        import sys
        import types
        for name in {AI_REQUIRED!r}:
            os.environ[name] = 'configured-test-only'
        os.environ['QDRANT_URL'] = 'http://127.0.0.1:9'
        os.environ['REQUEST_TIMEOUT'] = '45'
        import base64
        import json
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        info = {{'client_email': 'test@example.invalid',
                 'token_uri': 'https://example.invalid/token',
                 'private_key': key.private_bytes(serialization.Encoding.PEM,
                     serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode()}}
        os.environ['GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'] = base64.b64encode(json.dumps(info).encode()).decode()
        repo = types.ModuleType('app.api.repo.ai_repo')
        class AIRepository:
            pass
        repo.AIRepository = AIRepository
        sys.modules[repo.__name__] = repo
        from app.api.routers.suggestion_routes import get_suggestion_service
        from app.api.services.food4u.suggestion_service import SuggestionService
        from app.config.gemini_config import GeminiConfig
        from app.config.llama_config import AIConfig
        db = object()
        service = get_suggestion_service(db)
        assert isinstance(service, SuggestionService)
        assert isinstance(service.ai_repo, AIRepository)
        assert service.profile_repo.db is db
        assert service.meal_repo.db is db
        assert AIConfig.REQUEST_TIMEOUT == 45.0
        assert GeminiConfig.GOOGLE_GEMINI_API_KEY == 'configured-test-only'
    """)


@requires_google
@pytest.mark.parametrize("url", ["ftp://invalid-canary", "http://[", "http://localhost:bad"])
def test_invalid_qdrant_url_returns_503(url):
    run_isolated(f"""
        import os
        from fastapi import HTTPException
        for name in {AI_REQUIRED!r}:
            os.environ[name] = 'configured-test-only'
        os.environ['GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'] = 'e30='
        os.environ['QDRANT_URL'] = {url!r}
        from app.config.gemini_config import GeminiConfig
        GeminiConfig.get_drive_credentials = lambda: object()
        from app.api.routers.suggestion_routes import get_suggestion_service
        try:
            get_suggestion_service(object())
        except HTTPException as exc:
            assert exc.status_code == 503
            assert exc.detail == 'AI suggestions are not configured'
        else:
            raise AssertionError('invalid Qdrant URL accepted')
    """)


@requires_google
def test_runtime_repository_failures_are_not_relabelled_configuration():
    run_isolated(f"""
        import os
        import sys
        import types
        for name in {AI_REQUIRED!r}:
            os.environ[name] = 'configured-test-only'
        os.environ['QDRANT_URL'] = 'http://127.0.0.1:9'
        os.environ['GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'] = 'e30='
        from app.config.gemini_config import GeminiConfig
        GeminiConfig.get_drive_credentials = lambda: object()
        repo = types.ModuleType('app.api.repo.ai_repo')
        class AIRepository:
            def __init__(self):
                raise KeyError('runtime-bug')
        repo.AIRepository = AIRepository
        sys.modules[repo.__name__] = repo
        from app.api.routers.suggestion_routes import get_suggestion_service
        try:
            get_suggestion_service(object())
        except KeyError as exc:
            assert exc.args == ('runtime-bug',)
        else:
            raise AssertionError('runtime error masked')
    """)
