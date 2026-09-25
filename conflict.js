// conflict.js：冲突与预算（基线：不判冲突、不裁预算）
export function settle(ranges, policy, budget) {
  return { kept: ranges.map((range) => range.id), conflicts: [], dropped: [], used: ranges.length };
}
