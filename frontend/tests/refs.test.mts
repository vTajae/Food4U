import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

// Replace the framework session boundary only; exercise the real handler,
// RefService and ClinicalService with network fixtures at the fetch boundary.
const session = { data: { auth: true, token: "refs-test-token" } };
Object.assign(globalThis, { refsTestSession: session });
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "~/lib/session") return {
      url: "data:text/javascript,export async function getSession() { return globalThis.refsTestSession; }",
      shortCircuit: true,
    };
    return nextResolve(specifier, context);
  },
});
const { GET } = await import("../app/api/refs/route.ts");
hooks.deregister();

async function request(type: string, query: string | undefined, auth = true) {
  const calls: { url: URL; headers: Headers }[] = [];
  const original = globalThis.fetch;
  session.data.auth = auth;
  globalThis.fetch = (async (input, init) => {
    const url = new URL(String(input));
    calls.push({ url, headers: new Headers(init?.headers) });
    if (url.origin === "http://127.0.0.1:8765" && url.pathname === "/refs") {
      return Response.json([
        { diet_name: "Vegetarian", description: "No meat" },
        { diet_name: "Vegan", description: "Plant based" },
      ]);
    }
    assert.equal(url.origin, "https://clinicaltables.nlm.nih.gov", "no unexpected egress");
    return Response.json([1, ["test-condition"], { icd10cm: [[{
      code: "J30.9", name: "Allergic rhinitis, unspecified",
    }]] }, [["Allergic rhinitis"]]]);
  }) as typeof fetch;
  try {
    const params = new URLSearchParams({ type });
    if (query !== undefined) params.set("query", query);
    const response = await GET(new Request(`http://localhost/api/refs?${params}`));
    return { status: response.status, body: await response.json(), calls };
  } finally {
    globalThis.fetch = original;
    session.data.auth = true;
  }
}

for (const query of ["", undefined, "   "]) {
  test(`authenticated cuisines browse all 27 without network, query=${JSON.stringify(query)}`, async () => {
    const { status, body, calls } = await request("cuisines", query);
    assert.equal(status, 200);
    assert.equal(body.suggestions.length, 27);
    assert.ok(body.suggestions.some((item: { name: string }) => item.name === "Italian"));
    assert.deepEqual(calls, []);
  });
}

test("typing filters cuisines without waking the diet backend", async () => {
  const { body, calls } = await request("cuisines", "iTaL");
  assert.deepEqual(body, { suggestions: [{ name: "Italian" }] });
  assert.deepEqual(calls, []);
});

for (const query of ["", undefined]) {
  test(`diets browse the authenticated backend list, query=${JSON.stringify(query)}`, async () => {
    const { body, calls } = await request("diets", query);
    assert.deepEqual(body.suggestions.map((item: { name: string }) => item.name), ["Vegetarian", "Vegan"]);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url.searchParams.get("queryKey"), "diets");
    assert.equal(calls[0].headers.get("authorization"), "Bearer refs-test-token");
  });
}

test("typing filters the backend diet list", async () => {
  const { body } = await request("diets", "vega");
  assert.deepEqual(body.suggestions.map((item: { name: string }) => item.name), ["Vegan"]);
});

for (const [type, code, officialName, count] of [
  ["icd10cm", "E11.9", "Type 2 diabetes mellitus without complications", 9],
  ["conditions", "Z91.010", "Allergy to peanuts", 7],
] as const) {
  for (const query of ["", undefined]) {
    test(`${type} browses verified official-name/code metadata without network, query=${JSON.stringify(query)}`, async () => {
      const { body, calls } = await request(type, query);
      assert.equal(body.suggestions.length, count);
      assert.ok(body.suggestions.some((item: { code: string; name: string }) => item.code === code && item.name === officialName));
      assert.ok(body.suggestions.every((item: { code: string; name: string }) => item.code && item.name));
      assert.ok(body.suggestions.every((item: { code: string }) => item.code !== "E66.9"));
      assert.deepEqual(calls, []);
    });
  }
  test(`${type} typing keeps NLM search and official metadata`, async () => {
    const { body, calls } = await request(type, "allergy");
    assert.deepEqual(body, { suggestions: [{ code: "J30.9", name: "Allergic rhinitis, unspecified" }] });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url.pathname, "/api/conditions/v3/search");
    assert.equal(calls[0].url.searchParams.get("terms"), "allergy");
  });
}

for (const type of ["cuisines", "diets", "icd10cm", "conditions"]) {
  for (const query of ["", undefined, "allergy"]) {
    test(`anonymous ${type} is 401 even while browsing, query=${JSON.stringify(query)}`, async () => {
      const { status, body, calls } = await request(type, query, false);
      assert.equal(status, 401);
      assert.deepEqual(body, { suggestions: [], message: "Please log in." });
      assert.deepEqual(calls, []);
    });
  }
}
