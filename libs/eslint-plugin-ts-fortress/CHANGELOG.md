# eslint-plugin-ts-fortress

## 1.0.0

### Major Changes

- 8d8ad2e: Upgrade to `ts-data-forge` 14 and `ts-type-forge` 9.

    Both are dependencies whose types appear in this package's public
    signatures, so consumers that also depend on them directly have to upgrade in
    step. Internally this means the length-constrained guards are now called
    length-first (`Arr.isFixedLengthTuple(1, xs)`), matching ts-data-forge 14.

    BREAKING CHANGE: requires `ts-data-forge` >= 14 and `ts-type-forge` >= 9.

## 0.4.0

### Minor Changes

- f7ecaee: Ship a `recommended` config preset. `eslintPluginTsFortress.configs.recommended`
  is a flat-config object that registers the plugin and enables every rule at
  `error`, so consuming projects can start from:

    ```ts
    export default [eslintPluginTsFortress.configs.recommended];
    ```

    The preset registers the exported plugin object itself, so listing the plugin in
    your own `plugins` record alongside the preset does not trigger ESLint's
    `Cannot redefine plugin` error.

    Also exports the `ESLintFlatConfig` type alongside the existing `ESLintPlugin`.

## 0.3.0

### Minor Changes

- ef6f011: **`prefer-non-empty-array` is replaced by
  `prefer-canonical-length-constrained-type`**, which normalizes every
  length-constrained array combinator whose bounds are degenerate, not just
  `minLengthArray(1, …)`.

    | ❌ written as                 | ✅ canonical form        |
    | :---------------------------- | :----------------------- |
    | `minLengthArray(1, x)`        | `nonEmptyArray(x)`       |
    | `minLengthTuple(0, x)`        | `array(x)`               |
    | `maxLengthTuple(0, x)`        | `fixedLengthTuple(0, x)` |
    | `boundedLengthTuple(n, n, x)` | `fixedLengthTuple(n, x)` |
    | `boundedLengthTuple(0, n, x)` | `maxLengthTuple(n, x)`   |

    Every rewrite is type-identical (verified against the ts-type-forge
    definitions) and preserves the accepted values, the `defaultValue`, and the
    options object; only the default `typeName` — and the `details.kind` of the
    length error derived from it — changes to the one that names the constraint
    being checked. The branded `*Array` family is deliberately left alone, because
    `BoundedLengthArray<Min, Max, A>` intersects both bounds' brands and
    `FixedLengthArray<N, A>` adds an exact tuple for `N <= 10`, so the analogous
    rewrites would widen or narrow the type.

    The autofix also resolves the target name through scope analysis instead of
    scanning the top-level statements, so a binding that merely shadows the
    ts-fortress one around the call site now blocks the fix as well.

    BREAKING CHANGE: the rule name `ts-fortress/prefer-non-empty-array` no longer
    exists. Replace it with
    `ts-fortress/prefer-canonical-length-constrained-type` in your flat config;
    everything the old rule reported is still reported by the new one.

## 0.2.0

### Minor Changes

- f2da41d: Add `eslint-plugin-ts-fortress`, an ESLint plugin whose rules steer schema
  definitions toward ts-fortress idioms.

    Its first rule, `prefer-non-empty-array`, reports `minLengthArray(1, …)` and
    auto-fixes it to the equivalent `nonEmptyArray(…)`.
