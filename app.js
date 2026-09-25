// app.js：渲染结果
import { merge } from "./merge.js";
import { settle } from "./conflict.js";

export function render(spec) {
  const base = merge(spec.ranges || []);
  const done = settle(spec.ranges || [], spec.policy || "reject", spec.budget);
  return { merged: base.merged, kept: done.kept, conflicts: done.conflicts,
           dropped: done.dropped, budget_used: done.used, idempotent: true };
}
