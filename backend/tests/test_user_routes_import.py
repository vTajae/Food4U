"""Identity imports must work without the optional AI stack or test stubs."""

import os
from pathlib import Path
import subprocess
import sys
import textwrap


def test_user_routes_import_does_not_load_ai_packages():
    # A fresh interpreter prevents pytest collection order, cached imports and
    # conftest from hiding the import boundary. No AI credentials are needed.
    env = os.environ.copy()
    for key in (
        "GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY",
        "OPENAI_API_KEY", "QDRANT_API_KEY",
    ):
        env[key] = ""
    result = subprocess.run(
        [sys.executable, "-c", textwrap.dedent("""
            import sys
            import app.api.routers.user_routes

            ai_packages = ("google", "llama_index", "qdrant_client", "googleapiclient")
            loaded = [
                name for name in sys.modules
                if any(name == root or name.startswith(root + ".") for root in ai_packages)
            ]
            assert not loaded, f"Identity import loaded AI packages: {loaded}"
            assert "app.api.repo.ai_repo" not in sys.modules
            assert "app.api.services.food4u.suggestion_service" not in sys.modules
            assert "app.config.gemini_config" not in sys.modules
            assert "app.config.llama_config" not in sys.modules
        """)],
        cwd=Path(__file__).resolve().parents[1],
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, result.stdout + result.stderr
