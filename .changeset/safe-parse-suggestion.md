---
'eslint-rule-forge': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`prefer-num-safe-parse-int` and `prefer-num-safe-parse-float` (eslint-plugin-ts-data-forge), `prefer-safe-number-parse-integer` and `prefer-safe-number-parse` (eslint-plugin-ts-std-forge), and the `createPreferSafeParseInt` / `createPreferSafeParseFloat` factories they are built from (eslint-rule-forge) now offer their rewrite as a suggestion instead of applying it with `--fix`. The replacement parses some strings differently from the original: `parseInt('1e3')` is 1 and the rewrite 1000, `parseFloat('12px')` is 12 and the rewrite NaN, and `Number('')` is 0 and the rewrite NaN. The report is unchanged, and its message now says so. A lint run that relied on `--fix` to clear these reports now leaves them: apply the suggestion where the input allows it, or keep the original call with a disable comment that says why.
