---
prev: false
next: false
title: fromSubscribable
---

<!-- jsdoc-description -->

Converts any subscribable object into a SynState Observable.
Works with objects that have a subscribe(onNext, onError, onComplete) method.

<!-- /jsdoc-description -->

## Example

```tsx
//  Explanation:
//  - fromSubscribable converts any subscribable object into a SynState Observable
//  - Works with objects that have a subscribe(onNext, onError, onComplete) method
//  - Wraps values in Result type for error handling
//  - Useful for integrating with other reactive libraries or custom subscribables

// Example: Converting a custom subscribable
const customSubscribable = {
    subscribe: (
        onNext: (value: number) => void,
        _onError?: (error: unknown) => void,
        onComplete?: () => void,
    ) => {
        setTimeout(() => {
            onNext(1);

            onNext(2);

            onNext(3);

            onComplete?.();
        }, 0);

        return { unsubscribe: () => {} };
    },
} as const;

const observable$ = fromSubscribable<number>(customSubscribable);

const valueHistory: number[] = [];

await new Promise<void>((resolve) => {
    observable$.subscribe(
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

assert.deepStrictEqual(valueHistory, [1, 2, 3]);
```
