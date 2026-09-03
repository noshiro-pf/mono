---
'eslint-plugin-ts-fortress': minor
---

Add `prefer-schema-over-guard-chain`, in `recommended` at `error`: report a hand-written chain of type guards on one value once it is long enough to be a schema.

```ts
// reported at the default threshold of 5
isRecord(project) &&
    hasKey(project, 'name') &&
    isString(project.name) &&
    hasKey(project, 'path') &&
    isString(project.path);
```

The length is the least of it. What the chain cannot do is say what was wrong: it returns `false`, so a caller filtering on it drops the value silently, with nothing left of which field was missing or what type it turned out to be. The shape is declared and checked in the same breath, so it cannot be named, reused, or read on its own — where `t.record({ name: t.string(), path: t.string() })` can be, and `validate` returns structured `ValidationError`s ready for `validationErrorsToMessages`.

The rule reports; there is no fix. Writing the schema is the work, and it is not mechanical: the chain says what the value must _have_, never what it _is_, so an optional member, a union and a member that is simply never checked are indistinguishable from the guards alone.

Counted within one `&&` chain — or one `||` chain of negated guards, the early-return spelling of the same check — grouped by the identifier the guards' first argument is rooted at, so guards on two different values do not add up. A whole function body is deliberately not the unit: the same value checked once per field across a `fill`-style function is a series of defaults rather than a shape check.

Two options: `threshold` (default `5`) and `guards` (default: the `ts-data-forge` narrowing helpers), both documented in the README along with the distribution the default threshold was chosen from.
