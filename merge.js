// merge.js：排序并合并区间。
// 按起点升序（同起点按编号）排序后一次扫描（整体 O(n log n)，不做两两比较）：
// 相邻（端点相接）的并进当前区间；真重叠的记入冲突并丢弃后来者，
// 当前区间随即封档，下一个区间另起一段。
function byStartThenId(a, b) {
  if (a.start !== b.start) return a.start - b.start;
  const ai = String(a.id);
  const bi = String(b.id);
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

export function merge(ranges) {
  const sorted = [...ranges].sort(byStartThenId);
  const merged = [];
  const conflicts = [];
  let current = null;
  for (const range of sorted) {
    if (!current) {
      current = { id: range.id, start: range.start, end: range.end };
    } else if (range.start > current.end) {
      merged.push(current.id);
      current = { id: range.id, start: range.start, end: range.end };
    } else if (range.start < current.end) {
      conflicts.push(range.id);
      merged.push(current.id);
      current = null;
    } else {
      current.end = Math.max(current.end, range.end);
    }
  }
  if (current) merged.push(current.id);
  return { merged, conflicts, dropped: [] };
}
