---
'eslint-plugin-ts-data-forge': minor
---

Add `prefer-arr-generate`, enabled by the `recommended` config, which rewrites the filter-and-map idiom `xs.flatMap((x) => (cond ? [f(x)] : []))` into a `for…of` loop in `Arr.generate` that yields `f(x)` when `cond` holds. A block-bodied callback whose only `return` is its last statement is rewritten too, with the statements before it moved into the loop. When the empty array is the consequent (`cond ? [] : [f(x)]`), the condition is negated the short way, with `negationOf` from `eslint-rule-forge`: `x !== undefined && x !== ''` rather than `!(x === undefined || x === '')`.

The rule is type-aware and only reports an array or tuple receiver. It offers a suggestion instead of a fix when:

- the result is used as a mutable array;
- a parameter type annotation, a return type on the callback or a type wrapper on the conditional would be dropped;
- the receiver relies on a narrowing that does not reach into the generator function;
- the receiver is a `filter()` call;
- a comment would be lost.
