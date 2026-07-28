# eslint-plugin-ts-type-forge

## 0.2.0

### Minor Changes

- b49a8c8: Add `eslint-plugin-ts-type-forge`, an ESLint plugin whose rules steer type
  declarations toward ts-type-forge idioms.

    Its first rule, `prefer-non-empty-array`, reports the hand-rolled
    `readonly [V, ...V[]]` tuple spelling and auto-fixes it to `NonEmptyArray<V>`.
