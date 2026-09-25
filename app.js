// app.js：渲染结果
import { merge } from "./merge.js";
import { settle } from "./conflict.js";

export function render(spec) {
  const ranges = spec.ranges || [];
  const policy = spec.policy || "reject";
  const base = merge(ranges, policy);
  const done = settle(ranges, policy, spec.budget);
  const again = merge(base.intervals, policy);
  return { merged: base.merged, kept: done.kept, conflicts: done.conflicts,
           dropped: done.dropped, budget_used: done.used,
           idempotent: JSON.stringify(again.merged) === JSON.stringify(base.merged) };
}
