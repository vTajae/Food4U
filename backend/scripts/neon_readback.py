"""Read-only branch SQL proof. Credentials supplied only via process environment."""
import asyncio
import json
import os
import ssl

import asyncpg


async def main():
    url = os.environ["DATABASE_URL_UNPOOLED"]
    # asyncpg's native DSN understands sslmode, but not channel_binding.
    from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
    parts = urlsplit(url)
    assert parts.hostname == os.environ["NEON_READ_HOST"]
    assert "-pooler" not in parts.hostname
    query = [(key, value) for key, value in parse_qsl(parts.query) if key not in ("sslmode", "channel_binding")]
    url = urlunsplit(parts._replace(query=urlencode(query)))
    connection = await asyncpg.connect(url, ssl=ssl.create_default_context())
    try:
        async with connection.transaction(readonly=True):
            tables = await connection.fetch("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
            print("NEON_TABLES", json.dumps([row["tablename"] for row in tables]))
            prefix = os.environ.get("NEON_PUBLIC_ID_PREFIX")
            if prefix:
                assert len(prefix) == 8
                profiles = await connection.fetch("SELECT id, public_id FROM profile WHERE public_id LIKE $1", prefix + "%")
                assert len(profiles) == 1
                profile = profiles[0]
                attributes = await connection.fetch("SELECT attribute_category, attribute_name, attribute_value FROM profile_attribute WHERE profile_id=$1 ORDER BY id", profile["id"])
                history = await connection.fetch("SELECT h.icd_code, c.description FROM patient_medical_history h JOIN icd_codes c ON c.code=h.icd_code WHERE h.profile_id=$1 ORDER BY h.id", profile["id"])
                assert any(row["attribute_category"] == "cuisine" and row["attribute_name"] == "Italian" for row in attributes)
                assert history
                print("NEON_SQL_READBACK", json.dumps({"public_id_prefix": profile["public_id"][:8], "internal_id_present": True, "attributes": [dict(row) for row in attributes], "medical_history": [dict(row) for row in history]}))
            else:
                # Production proof must show absence of test/user rows.
                assert await connection.fetchval("SELECT count(*) FROM profile") == 0
                assert await connection.fetchval("SELECT count(*) FROM profile_attribute") == 0
                assert await connection.fetchval("SELECT count(*) FROM rate_limits") == 0
                print("PRODUCTION_USER_ROWS=0 PRODUCTION_ATTRIBUTE_ROWS=0 PRODUCTION_RATE_LIMIT_ROWS=0")
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
