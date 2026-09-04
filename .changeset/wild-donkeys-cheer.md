---
'eslint-plugin-ts-data-forge': minor
---

Add `prefer-arr-scan`, in `recommended` at `error`: report an accumulated value that is rebuilt from scratch for every element, and point at `Arr.scan`.

Two shapes are reported.

```ts
// (1) the prefix rebuilt per element: `slice` allocates, and the combining
//     function runs over the whole prefix again
segments.map((_, index) => resolve(...segments.slice(0, index + 1)));

// (2) the accumulator rebuilt on every step
xs.reduce<readonly number[]>((acc, x) => [...acc, (acc.at(-1) ?? 0) + x], [0]);
```

Both are what `Arr.scan` does in one pass, and `scan` puts the initial value at the head of its result — which for the first example is exactly "the root, then each ancestor below it". The complexity is the smaller half of it: what the rebuilt form loses is the name of what is being accumulated.

**(2) is fixed**; (1) is reported only. Turning `f(seed, ...xs.slice(0, i + 1))` into a `scan` is valid only if `f(seed, a, b, c) === f(f(f(seed, a), b), c)` — that the variadic callee is a left fold. That is a property of the callee, invisible in the AST and in the type: `path.resolve` and `Math.max` have it, `Array.of` and `console.log` do not, and nothing static tells them apart.

The fix recognizes both spellings of the append — `[...acc, x]` and `Arr.toPushed(acc, x)`, which `prefer-canonical-array-slicing` rewrites the first into — and is withheld unless the two forms are provably equal: a one-element initial array, exactly one value appended per step, every other mention of the accumulator being `acc.at(-1)`, and plain unannotated parameters. `Arr.last` is not among the recognized spellings, since it returns an `Optional` rather than the element.

Where type information is available and shows the accumulated value cannot be nullish, a `?? fallback` guarding `acc.at(-1)` is removed along with the read — it is dead once the previous value is passed directly, and leaving it would hand the author an unnecessary condition that no rule can fix for them.

```ts
// before
xs.reduce<readonly number[]>((acc, x) => [...acc, (acc.at(-1) ?? 0) + x], [0]);
// after
Arr.scan(xs, (acc, x) => acc + x, 0);
```
