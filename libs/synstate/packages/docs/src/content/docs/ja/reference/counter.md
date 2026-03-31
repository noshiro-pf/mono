---
prev: false
next: false
title: counter
---

<!-- jsdoc-description -->

指定された間隔でインクリメントされる数値を発行する Observable を作成します。
サブスクリプション直後に 0 を発行し、その後一定間隔で 1, 2, 3, ... と発行します。

<!-- /jsdoc-description -->

## 使用例

```tsx
//  Timeline:
//
//  Time(s)   0     1     2     3     4     5
//  tick$     0     1     2     3     4     5     ...
//
//  Explanation:
//  - counter emits incrementing numbers at specified intervals
//  - Starts at 0 and continues indefinitely
//  - Useful for periodic tasks or animations

const tick$ = counter(100);

const valueHistory: number[] = [];

const subscription = tick$.subscribe((count) => {
    valueHistory.push(count);
});

await new Promise((resolve) => {
    setTimeout(resolve, 350);
});

subscription.unsubscribe();

assert.isTrue(Arr.isArrayAtLeastLength(valueHistory, 3));

assert.deepStrictEqual(valueHistory[0], 0);

assert.deepStrictEqual(valueHistory[1], 1);

assert.deepStrictEqual(valueHistory[2], 2);
```
