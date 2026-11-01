import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormProvider, useFormContext } from "../components/form/context.tsx";

Object.assign(globalThis, { React });
test("intake renders a safe first step before browser storage hydration", () => {
  function Step() { return React.createElement("h1", null, `Step ${useFormContext().state.currentStep + 1}`); }
  const html = renderToStaticMarkup(React.createElement(FormProvider, {
    identity: "11111111-1111-4111-8111-111111111111", children: React.createElement(Step),
  }));
  assert.match(html, /Step 1/);
});
