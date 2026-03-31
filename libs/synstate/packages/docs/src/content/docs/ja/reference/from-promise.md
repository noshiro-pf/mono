---
prev: false
next: false
title: fromPromise
---

<!-- jsdoc-description -->

Promise から Observable を作成します。
Promise が解決されると Result.ok を、拒否されると Result.err を発行します。

<!-- /jsdoc-description -->

## 使用例

```tsx
//  Timeline:
//
//  promise     [pending...]  -> resolved/rejected
//  data$                        Ok(value) or Err(error)
//
//  Explanation:
//  - fromPromise converts a Promise into an observable
//  - Emits a Result type: Ok(value) on success, Err(error) on failure
//  - Completes after emitting the result
//  - Useful for integrating async operations into reactive flows

const fetchData = async (): Promise<Readonly<{ value: number }>> =>
    ({
        value: 42,
    }) as const;

const data$ = fromPromise(fetchData());

const valueHistory: Readonly<{ value: number }>[] = [];

await new Promise<void>((resolve) => {
    data$.subscribe(
        (result) => {
            if (Result.isOk(result)) {
                valueHistory.push(result.value);
            }
        },
        () => {
            resolve();
        },
    );
});

assert.deepStrictEqual(valueHistory, [{ value: 42 }]);
```
