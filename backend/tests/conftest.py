"""
Test bootstrap.

Importing `app.api.routers.user_routes` drags in the suggestion/AI stack
(Gemini, LlamaIndex, Qdrant, Google API client) at import time. None of it is
needed to test the identity boundary, so those modules are stubbed here before
anything from `app` is imported.
"""
import os
import sys
import types
from unittest.mock import MagicMock

os.environ.setdefault("USER_JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("USER_JWT_ALGORITHM", "HS256")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://u:p@localhost:5432/test")
# AI config classes read these at import time; values are irrelevant for these tests.
for _k, _v in {
    "REQUEST_TIMEOUT": "30", "MAX_RETRIES": "1", "TEMPERATURE": "0", "MAX_TOKENS": "1",
    "TOP_P": "1", "TOP_K": "1", "CHUNK_SIZE": "1", "CHUNK_OVERLAP": "0", "EMBED_BATCH_SIZE": "1",
    "GEMINI_API_KEY": "x", "GOOGLE_API_KEY": "x", "OPENAI_API_KEY": "x", "QDRANT_URL": "http://localhost",
    "QDRANT_API_KEY": "x", "COLLECTION_NAME": "x", "MODEL_NAME": "x", "EMBED_MODEL": "x",
    "GOOGLE_GEMINI_API_KEY": "x", "GOOGLE_DRIVE_FOLDER_ID": "x", "EMBEDDING_MODEL_NAME": "x",
    "LLM_MODEL": "x", "OPENAI_ORG_ID": "x", "FDC_API_KEY": "x", "SPOONACULAR_API_KEY": "x",
}.items():
    os.environ.setdefault(_k, _v)

_STUBS = [
    "googleapiclient",
    "googleapiclient.discovery",
    "googleapiclient.http",
    "llama_cloud",
    "llama_index",
    "llama_index.core",
    "llama_index.embeddings",
    "llama_index.embeddings.gemini",
    "llama_index.vector_stores",
    "llama_index.vector_stores.qdrant",
    "qdrant_client",
    "google",
    "google.generativeai",
    "google.oauth2",
]


class _Stub(types.ModuleType):
    def __getattr__(self, name):  # any attribute resolves to a mock
        return MagicMock(name=f"{self.__name__}.{name}")


for _name in _STUBS:
    if _name not in sys.modules:
        sys.modules[_name] = _Stub(_name)

# One cut replaces the whole AI chain: suggestion_service only needs the name
# AIRepository from this module, and no test here exercises suggestions.
if "app.api.repo.ai_repo" not in sys.modules:
    sys.modules["app.api.repo.ai_repo"] = _Stub("app.api.repo.ai_repo")
