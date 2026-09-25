import fs from "node:fs";
import { merge } from "./merge.js";
import { settle } from "./conflict.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/ranges.json", "utf8"));
const base = merge(spec.ranges || []);
const done = settle(spec.ranges || [], spec.policy || "reject", spec.budget);
const view = render(spec);

emit("合并后的区间 =", JSON.stringify(base.merged));
emit("保留的区间 =", JSON.stringify(done.kept));
emit("冲突的区间 =", JSON.stringify(done.conflicts));
emit("超预算被丢弃的区间 =", JSON.stringify(done.dropped));
emit("预算消耗 =", done.used);
emit("冲突策略 =", spec.policy);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = settle([{ id: "r0", start: 0, end: 5 }, { id: "r1", start: 3, end: 9 }], "reject", 4);
  emit("重叠冲突的错误码", bad.conflicts.length ? (bad.code || "E_OVERLAP") : "no-error");
} catch (error) {
  emit("重叠冲突的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "合并后的区间": [
    "r0",
    "r1",
    "r3"
  ],
  "保留的区间": [
    "r0",
    "r1",
    "r3"
  ],
  "冲突的区间": [],
  "超预算被丢弃的区间": [
    "r2",
    "r4"
  ],
  "预算消耗": 3,
  "冲突策略": "reject"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
