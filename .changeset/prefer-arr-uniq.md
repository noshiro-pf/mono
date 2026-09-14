---
'eslint-plugin-ts-data-forge': minor
---

Add the `prefer-arr-uniq` rule, which replaces `Array.from(new Set(xs))` and
`[...new Set(xs)]` with `Arr.uniq(xs)`. `Arr.uniq` is implemented as exactly that
expression, so the behavior is unchanged, and its return type is stronger: a
non-empty tuple yields a non-empty array.

The rule is type-aware. It reports only when `xs` is an array or tuple of
primitives, since `Arr.uniq` does not accept anything else, and it leaves alone a
`Set` bound to a variable, `Array.from(set, fn)`, `new Set<T>(xs)`, and a shadowed
`Array` or `Set`. Because `Arr.uniq` returns a readonly array, the rewrite is
applied automatically only when nothing nearby needs a mutable one; when the
result is sorted or pushed to in place, has an element assigned, or is passed
where a mutable array is expected, it is offered as a suggestion instead.

The rule is part of the `recommended` config.
