// conflict.js：冲突结算与预算裁剪。
//  - 先调用 merge 合并；reject 策略下真重叠已被拒绝（进 dropped），冲突视为已结清；
//  - 合并后区间数超过预算时，按长度从大到小保留，其余记入 dropped；
//  - 预算不够时 over_budget 置真，显式告知。
import { merge } from "./merge.js";

function compareRanges(a, b) {
  if (a.start !== b.start) return a.start - b.start;
  const ai = String(a.id);
  const bi = String(b.id);
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

export function settle(ranges, policy = "reject", budget) {
  const base = merge(ranges, policy);
  const intervals = base.intervals;

  let kept = intervals;
  let budgetDropped = [];
  let overBudget = false;
  if (Number.isFinite(budget) && intervals.length > budget) {
    overBudget = true;
    const ranked = [...intervals].sort((a, b) => {
      const byLength = (b.end - b.start) - (a.end - a.start);
      return byLength !== 0 ? byLength : compareRanges(a, b);
    });
    const keepIds = new Set(ranked.slice(0, budget).map((iv) => iv.id));
    kept = intervals.filter((iv) => keepIds.has(iv.id));
    budgetDropped = intervals.filter((iv) => !keepIds.has(iv.id)).map((iv) => iv.id);
  }

  const result = {
    kept: kept.map((iv) => iv.id),
    conflicts: policy === "reject" ? [] : base.conflicts,
    dropped: [...base.dropped, ...budgetDropped],
    used: kept.length,
    over_budget: overBudget,
  };
  if (base.conflicts.length) result.code = "E_OVERLAP";
  return result;
}
