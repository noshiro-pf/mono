# eslint-plugin-ts-fortress

## 0.2.0

### Minor Changes

- f2da41d: Add `eslint-plugin-ts-fortress`, an ESLint plugin whose rules steer schema
  definitions toward ts-fortress idioms.

    Its first rule, `prefer-non-empty-array`, reports `minLengthArray(1, …)` and
    auto-fixes it to the equivalent `nonEmptyArray(…)`.
