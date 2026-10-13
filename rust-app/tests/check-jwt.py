"""Verify an actual Rust-minted local fixture using the backend's installed PyJWT."""

import json
import sys
import time
from pathlib import Path

import jwt

fixture = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
claims = jwt.decode(
    fixture["token"],
    "food4u-rust-spike-fake-jwt-secret-32bytes",
    algorithms=["HS256"],
)
assert claims["user_id"] == fixture["public_id"]
assert isinstance(claims["exp"], int)
assert 1800 <= claims["exp"] - fixture["issued_before"] <= 1805
assert 0 < claims["exp"] - time.time() <= 1805
print(json.dumps({
    "result": "PASS",
    "verifier": "backend venv PyJWT jwt.decode, HS256",
    "public_id": claims["user_id"],
    "expires_after_fixture_seconds": claims["exp"] - fixture["issued_before"],
}))
