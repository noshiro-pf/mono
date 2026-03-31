---
prev: false
next: false
title: fromPromise
---

<!-- jsdoc-description -->

Creates an observable from a Promise.
Emits Result.ok when the promise resolves, or Result.err when it rejects.

<!-- /jsdoc-description -->

## Example

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
