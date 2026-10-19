---
'eslint-rule-forge': minor
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

The rules of `eslint-plugin-ts-data-forge` and `eslint-plugin-ts-std-forge` now leave alone the functions Playwright and Puppeteer run in the page: those passed to `evaluate`, `evaluateAll`, `evaluateHandle`, `waitForFunction`, `addInitScript`, `evaluateOnNewDocument`, `$eval` and `$$eval`. Such a function is serialized and run where nothing the test file imports exists, so a fix that called `Arr`, `isNonNullObject` or another library function there broke the test at runtime. The arguments passed along with the function run in the test and are still checked. `eslint-rule-forge` exports what does it: `isInBrowserEvaluatedFunction`, and `skipBrowserEvaluatedFunctions`, which wraps a rule so that its listeners never see a node inside such a function.
