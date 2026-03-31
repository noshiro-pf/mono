---
prev: false
next: false
title: timer
---

<!-- jsdoc-description -->

指定された遅延後に 0 を発行して完了する Observable を作成します。

<!-- /jsdoc-description -->

## 使用例

```tsx
//  Timeline:
//
//  Time(ms)  0     ...   1000
//  delayed$                X (emits and completes)
//
//  Explanation:
//  - timer emits once after the specified delay, then completes
//  - Useful for delayed actions or timeouts

const delayed$ = timer(100);

const valueHistory: number[] = [];

await new Promise<void>((resolve) => {
    delayed$.subscribe(
        () => {
            valueHistory.push(1);
        },
        () => {
            resolve();
        },
    );
});

assert.deepStrictEqual(valueHistory, [1]);
```
