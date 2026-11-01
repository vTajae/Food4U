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
    if not parts.hostname or parts.hostname != os.environ["NEON_READ_HOST"] or "-pooler" in parts.hostname:
        raise SystemExit("explicit direct read-back host required")
    query = [(key, value) for key, value in parse_qsl(parts.query) if key not in ("sslmode", "channel_binding")]
    url = urlunsplit(parts._replace(query=urlencode(query)))
    assert os.environ["NEON_PUBLIC_ID_PREFIX"] and os.environ["NEON_READ_HOST"]
    connection = await asyncpg.connect(url, ssl=ssl.create_default_context())
    try:
        async with connection.transaction(readonly=True):
            tables = await connection.fetch("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
            print("NEON_TABLES", json.dumps([row["tablename"] for row in tables]))
            prefix = os.environ["NEON_PUBLIC_ID_PREFIX"]
            assert len(prefix) == 8
            profiles = await connection.fetch("SELECT id, public_id FROM profile WHERE public_id LIKE $1", prefix + "%")
            assert len(profiles) == 1
            profile = profiles[0]
            attributes = await connection.fetch("SELECT attribute_category, attribute_name, attribute_value FROM profile_attribute WHERE profile_id=$1 ORDER BY id", profile["id"])
            history = await connection.fetch("SELECT h.icd_code, c.description FROM patient_medical_history h JOIN icd_codes c ON c.code=h.icd_code WHERE h.profile_id=$1 ORDER BY h.id", profile["id"])
            assert any(row["attribute_category"] == "cuisine" and row["attribute_name"] == "Italian" and row["attribute_value"] == "like" for row in attributes)
            assert any(row["attribute_category"] == "budget" and row["attribute_name"] == "per_meal" and row["attribute_value"] == "12.50" for row in attributes)
            assert any(row["icd_code"] == "J30.9" and row["description"] == "Allergic rhinitis, unspecified" for row in history)
            diets = await connection.fetch("SELECT d.diet_name FROM profile_diet p JOIN diet_type d ON d.id=p.diet_type_id WHERE p.profile_id=$1 ORDER BY d.diet_name", profile["id"])
            assert [row["diet_name"] for row in diets] == ["Vegetarian"]
            diet_count = await connection.fetchval("SELECT count(*) FROM diet_type")
            assert diet_count == 11
            print("NEON_SQL_READBACK", json.dumps({"public_id_prefix": profile["public_id"][:8], "internal_id_present": True, "diets": [dict(row) for row in diets], "diet_type_count": diet_count, "attributes": [dict(row) for row in attributes], "medical_history": [dict(row) for row in history]}))
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
