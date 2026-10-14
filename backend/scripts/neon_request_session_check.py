"""Opt-in branch-only HTTP leak regression; no public diagnostic endpoint.

Uses the real ASGI app, routes, middleware, repositories and Neon pool. Each
request gets a distinct client address to test concurrency without changing or
bypassing the production rate limiter. Tokens represent just two new users.
"""
import asyncio
import gc
import json
import logging
import os
import ssl
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import asyncpg
from pathlib import Path
import sys
from uuid import uuid4

import httpx
import jwt
from dotenv import dotenv_values
from sqlalchemy.engine import make_url

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


async def main():
    url = os.environ["DATABASE_URL"]
    host = os.environ["NEON_TEST_POOLER_HOST"]
    production = dotenv_values(Path(__file__).resolve().parents[2] / ".env.local")["DATABASE_URL"]
    assert make_url(url).host == host and "-pooler" in host
    production_host = make_url(production).host.replace("-pooler", "")
    assert host.endswith(".neon.tech") and host.replace("-pooler", "") != production_host
    direct = urlsplit(os.environ["DATABASE_URL_UNPOOLED"])
    assert direct.hostname == os.environ["NEON_READ_HOST"]
    assert "-pooler" not in direct.hostname
    assert direct.hostname == host.replace("-pooler", "")
    assert direct.hostname != production_host
    expected = os.environ["NEON_LEAK_EXPECT"]
    assert expected in ("red", "green")

    # The guard above runs before importing any application database code.
    from server import app, lifespan
    from app.config.database import async_database_session as database

    class LeakCounter(logging.Handler):
        count = 0

        def emit(self, record):
            if "non-checked-in connection" in record.getMessage():
                self.count += 1

    counter = LeakCounter()
    logger = logging.getLogger("sqlalchemy.pool")
    logger.addHandler(counter)
    lifecycle = lifespan(app)
    await lifecycle.__anext__()
    public_ids = [str(uuid4()), str(uuid4())]
    tokens = [jwt.encode({"user_id": public_id}, os.environ["USER_JWT_SECRET_KEY"],
                         algorithm="HS256") for public_id in public_ids]
    payload = {"submission": [
        {"questionId": 5, "queryKey": "cuisines", "answers": [{"name": "Italian"}]},
        {"questionId": 5555, "queryKey": "diets", "answers": [{"name": "Vegetarian"}]},
        {"questionId": 1, "queryKey": "conditions", "answers": [
            {"name": "Allergic rhinitis, unspecified", "code": "J30.9"}]},
        {"questionId": 555, "queryKey": "price", "answers": [{"value": "12.50"}]},
    ]}
    last_diets = [None, None]
    sequence = 0
    statuses = []

    async def request(method, path, user, body=None):
        nonlocal sequence
        sequence += 1
        transport = httpx.ASGITransport(app=app, client=(f"004-{expected}-{sequence}", 12345))
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1") as client:
            response = await client.request(method, path, json=body,
                                            headers={"Authorization": f"Bearer {tokens[user]}"})
        statuses.append(response.status_code)
        assert response.status_code == 200, f"{method} {path}: {response.status_code}"
        if path == "/profile":
            assert response.json()["public_id"] == public_ids[user]
        if path == "/user/profile":
            data = response.json()
            assert [diet["diet_type"]["diet_name"] for diet in data["diets"]] == [last_diets[user]]
            assert any(item["icd_details"]["code"] == "J30.9" for item in data["medical_history"])

    try:
        # Both identities exist before concurrent traffic. Repeated POSTs below
        # verify the actual idempotent profile/onboarding flow, not a SQL mock.
        for user in range(2):
            await request("POST", "/profile", user)
        for iteration in range(20):
            user = iteration % 2
            diet = ("Vegetarian", "Vegan")[(iteration // 2 + user) % 2]
            payload["submission"][1]["answers"][0]["name"] = diet
            last_diets[user] = diet
            await request("POST", "/profile", user)
            await request("POST", "/welcome", user, payload)
            await request("GET", "/user/profile", user)
            # Deterministic GC exposes any unreachable, unclosed sessions while
            # the loop is still alive, rather than after interpreter shutdown.
            gc.collect()
            await asyncio.sleep(0)
        # Twenty concurrent real HTTP reads of the two persisted profiles.
        await asyncio.gather(*(request("GET", "/user/profile", i % 2) for i in range(20)))
        gc.collect()
        await asyncio.sleep(0.2)
        checkedout = database.engine.pool.checkedout()
        # Independent, read-only direct SQL proves set replacement, rather than
        # relying solely on the HTTP response shape. Direct host is owned by the
        # guarded runner and must match exactly; production is denied here too.
        query = [(k, v) for k, v in parse_qsl(direct.query)
                 if k not in ("sslmode", "channel_binding")]
        dsn = urlunsplit(direct._replace(query=urlencode(query)))
        connection = await asyncpg.connect(dsn, ssl=ssl.create_default_context())
        sql_diets = []
        try:
            async with connection.transaction(readonly=True):
                for user, public_id in enumerate(public_ids):
                    rows = await connection.fetch(
                        "SELECT d.diet_name FROM profile p "
                        "JOIN profile_diet pd ON pd.profile_id=p.id "
                        "JOIN diet_type d ON d.id=pd.diet_type_id "
                        "WHERE p.public_id=$1 ORDER BY d.diet_name", public_id)
                    names = [row["diet_name"] for row in rows]
                    assert names == [last_diets[user]], "exactly one final diet row required"
                    sql_diets.append({"public_id": public_id, "diet_names": names,
                                      "profile_diet_rows": len(rows)})
        finally:
            await connection.close()
        result = {"expected": expected, "public_ids": public_ids,
                  "sequential_rounds": 20, "concurrent_requests": 20,
                  "last_submitted_diets": last_diets, "read_only_sql": sql_diets,
                  "responses": len(statuses), "all_200": all(s == 200 for s in statuses),
                  "non_checked_in_warnings": counter.count,
                  "checkedout_before_shutdown": checkedout}
        print("REQUEST_SESSION_CHECK", json.dumps(result), flush=True)
        assert counter.count == 0, "non-checked-in pooled connections were garbage-collected"
        assert checkedout == 0, "pooled connections remain checked out before shutdown"
    finally:
        try:
            await lifecycle.__anext__()
        except StopAsyncIteration:
            pass
        logger.removeHandler(counter)


if __name__ == "__main__":
    asyncio.run(main())
