// conflict.js：冲突结算与预算裁剪。
// 先按起点升序（同起点按编号）排序；区间数超过预算时按长度从大到小保留
// （等长按编号升序），其余显式记入 dropped；随后对保留集合扫一遍真重叠，
// reject 策略下报 E_OVERLAP。全程两次排序，无两两比较。
function byStartThenId(a, b) {
  if (a.start !== b.start) return a.start - b.start;
  const ai = String(a.id);
  const bi = String(b.id);
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

function byLengthDescThenId(a, b) {
  const la = a.end - a.start;
  const lb = b.end - b.start;
  if (la !== lb) return lb - la;
  const ai = String(a.id);
  const bi = String(b.id);
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

export function settle(ranges, policy, budget) {
  const sorted = [...ranges].sort(byStartThenId);
  let kept = sorted;
  let dropped = [];
  if (typeof budget === "number" && sorted.length > budget) {
    const chosen = new Set([...sorted].sort(byLengthDescThenId).slice(0, budget));
    kept = sorted.filter((range) => chosen.has(range));
    dropped = sorted.filter((range) => !chosen.has(range)).map((range) => range.id);
  }
  const conflicts = [];
  for (let i = 1; i < kept.length; i += 1) {
    if (kept[i].start < kept[i - 1].end) conflicts.push(kept[i].id);
  }
  const result = { kept: kept.map((range) => range.id), conflicts, dropped, used: kept.length };
  if (conflicts.length && policy === "reject") result.code = "E_OVERLAP";
  return result;
}
