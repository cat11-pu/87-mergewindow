# mergewindow

浏览器单页工作台（原生 ES 模块，零依赖）。

## 起服务看页面

    python3 -m http.server 8000

浏览器打开 http://127.0.0.1:8000/ ，改样例点运行看结果。

## 合并与结算规则

- `merge(ranges)`：按起点升序（同起点按编号）排序后单次扫描；
  相邻（端点相接）的并入当前区间，被并入的编号记入 `dropped`；
  真重叠记入 `conflicts`（错误码 `E_OVERLAP`），`reject` 策略下拒绝新区间并封存当前区间。
- `settle(ranges, policy, budget)`：先合并，合并后区间数超过预算时按长度从大到小保留，
  其余记入 `dropped`，预算不够时 `over_budget` 为真。
- 不变量：保留的区间互不重叠且按起点升序；保留数加预算丢弃数等于合并后的区间数。

## 测试

    node tests/run.js

## 场景自检

    node check_sample.js
