import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Node cannot load CSS; only stub this exact stylesheet for component rendering.
const cssUrl = new URL("../app/globals.css", import.meta.url).href;
registerHooks({
  load(url, context, nextLoad) {
    if (url === cssUrl) return { format: "module", source: "export {};", shortCircuit: true };
    return nextLoad(url, context);
  },
});

function findButton(node: ReactNode): ReactElement<{ onClick: () => void }> | undefined {
  if (Array.isArray(node)) return node.map(findButton).find(Boolean);
  if (!isValidElement<{ children?: ReactNode; onClick?: () => void }>(node)) return;
  if (node.type === "button") return node as ReactElement<{ onClick: () => void }>;
  if (typeof node.type === "function") {
    return findButton((node.type as (props: unknown) => ReactNode)(node.props));
  }
  return findButton(node.props.children);
}

for (const [name, path] of [["route error", "../app/error.tsx"], ["global error", "../app/global-error.tsx"]]) {
  test(`${name} is branded, private and delegates recovery to reset`, async () => {
    const { default: Component } = await import(path);
    const error = Object.assign(new Error("private medical diagnosis and internal stack"), { digest: "private-digest" });
    let resets = 0;
    const props = { error, reset: () => { resets += 1; } };
    const html = renderToStaticMarkup(createElement(Component, props));
    assert.match(html, /Food4U/);
    assert.match(html, /Something went wrong/);
    assert.match(html, /Try again/);
    assert.match(html, /href="\/"/);
    assert.match(html, /Go home/);
    assert.doesNotMatch(html, /private medical|internal stack|private-digest/);
    if (name === "global error") {
      assert.match(html, /<html lang="en"/);
      assert.match(html, /<body/);
    }
    const button = findButton(Component(props));
    assert.ok(button, "a real recovery button is rendered");
    button.props.onClick();
    assert.equal(resets, 1);
  });
}
