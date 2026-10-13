import asyncio
import os
from pathlib import Path
import ssl
import subprocess
import sys

import pytest

from app.config.database import AsyncDatabaseSession


@pytest.mark.parametrize("scheme", ["postgresql", "postgresql+asyncpg"])
def test_neon_url_builds_asyncpg_engine_with_verified_tls(scheme):
    database = AsyncDatabaseSession(
        f"{scheme}://u:p@ep-example-pooler.neon.tech/neondb"
        "?sslmode=require&channel_binding=require"
    )
    asyncio.run(database.init())
    args, kwargs = database.engine.dialect.create_connect_args(database.engine.url)
    assert database.engine.url.drivername == "postgresql+asyncpg"
    assert "sslmode" not in kwargs
    assert "channel_binding" not in kwargs
    # The public engine connect seam merges connect_args with dialect kwargs.
    captured = {}
    def capture(*args, **kwargs):
        captured.update(kwargs)
        raise RuntimeError("connection captured")
    database.engine.sync_engine.dialect.connect = capture
    async def connect():
        with pytest.raises(RuntimeError, match="connection captured"):
            async with database.engine.connect():
                pass
    asyncio.run(connect())
    assert captured["ssl"].check_hostname is True
    assert captured["ssl"].verify_mode == ssl.CERT_REQUIRED
    asyncio.run(database.close())


def test_plain_asyncpg_url_keeps_database_and_query():
    database = AsyncDatabaseSession("postgresql+asyncpg://u:p@localhost:5432/test?timeout=10")
    asyncio.run(database.init())
    assert database.engine.url.database == "test"
    assert database.engine.url.query["timeout"] == "10"
    asyncio.run(database.close())


@pytest.mark.parametrize("override", [False, True])
def test_root_env_fallback_preserves_process_database_url(override):
    root = Path(__file__).resolve().parents[2]
    if not (root / ".env.local").exists():
        pytest.skip("local Neon env file is not present")
    env = os.environ.copy()
    env.pop("DATABASE_URL", None)
    if override:
        env["DATABASE_URL"] = "postgresql+asyncpg://u:p@localhost/test"
    code = """
from pathlib import Path
from dotenv import dotenv_values
import os
expected = os.environ.get('DATABASE_URL') or dotenv_values(Path.cwd().parent / '.env.local')['DATABASE_URL']
from app.config.database import DATABASE_URL
assert DATABASE_URL == expected, 'database env precedence mismatch'
"""
    result = subprocess.run([sys.executable, "-c", code], cwd=root / "backend", env=env,
                            capture_output=True, text=True, timeout=30)
    assert result.returncode == 0, "database env precedence subprocess failed"
