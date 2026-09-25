// merge.js：合并（基线：原样拼接、不排序）
export function merge(ranges) {
  return { merged: ranges.map((range) => range.id), conflicts: [], dropped: [] };
}
