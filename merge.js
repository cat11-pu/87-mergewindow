// merge.js：排序并合并区间。
// 规则：
//  - 按起点升序排序，同起点按编号升序；
//  - 相邻（端点相接）的区间并入当前区间，被并入的编号记入 dropped；
//  - 真重叠（起点落在当前区间内部）按策略处理并记入 conflicts（E_OVERLAP）：
//    reject 时拒绝新区间（记入 dropped）并封存当前区间，不再向后延伸；
//  - 其余策略下真重叠只记入 conflicts，并把新区间并入当前区间。
// 单次排序 + 单次扫描，十万区间也不会两两比较。

function compareRanges(a, b) {
  if (a.start !== b.start) return a.start - b.start;
  const ai = String(a.id);
  const bi = String(b.id);
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

export function merge(ranges, policy = "reject") {
  const sorted = [...ranges].sort(compareRanges);
  const intervals = [];
  const conflicts = [];
  const dropped = [];
  let current = null;

  function finalize() {
    if (current) {
      intervals.push(current);
      current = null;
    }
  }

  for (const range of sorted) {
    if (!current) {
      const last = intervals[intervals.length - 1];
      if (last && range.start < last.end) {
        // 与已封存的区间真重叠：同样按策略拒绝，保证输出互不重叠。
        conflicts.push({ code: "E_OVERLAP", ids: [last.id, range.id] });
        dropped.push(range.id);
        continue;
      }
      current = { id: range.id, start: range.start, end: range.end };
      continue;
    }
    if (range.start < current.end) {
      // 真重叠：报冲突，reject 时拒绝新区间并封存当前区间。
      conflicts.push({ code: "E_OVERLAP", ids: [current.id, range.id] });
      if (policy === "reject") {
        dropped.push(range.id);
        finalize();
      } else if (range.end > current.end) {
        current.end = range.end;
      }
      continue;
    }
    if (range.start === current.end) {
      // 相邻：并入当前区间，被并入的编号记入 dropped。
      if (range.end > current.end) current.end = range.end;
      dropped.push(range.id);
      continue;
    }
    finalize();
    current = { id: range.id, start: range.start, end: range.end };
  }
  finalize();

  return { merged: intervals.map((iv) => iv.id), conflicts, dropped, intervals };
}
