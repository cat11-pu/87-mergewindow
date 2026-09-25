import assert from "node:assert";
import { merge } from "../merge.js";
import { settle } from "../conflict.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const ranges = [{ id: "r0", start: 0, end: 5 }, { id: "r1", start: 5, end: 9 }];

check("merge returns merged list", () => {
  assert.ok(Array.isArray(merge(ranges).merged));
});

check("merge reports conflicts", () => {
  assert.ok(Array.isArray(merge(ranges).conflicts));
});

check("settle reports kept", () => {
  assert.ok(Array.isArray(settle(ranges, "reject", 4).kept));
});

check("settle reports used", () => {
  assert.strictEqual(typeof settle(ranges, "reject", 4).used, "number");
});

check("render exposes dropped", () => {
  assert.ok(Array.isArray(render({ ranges: ranges, policy: "reject", budget: 4 }).dropped));
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
