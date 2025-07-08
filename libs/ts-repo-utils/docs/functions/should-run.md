[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/should-run

# functions/should-run

## Functions

### checkShouldRunTypeChecks()

> **checkShouldRunTypeChecks**(): `Promise`\<`void`\>

Defined in: [src/functions/should-run.mts:19](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/should-run.mts#L19)

Checks if TypeScript type checks should run based on the diff from origin/main.
Skips type checks if all changed files are documentation files, spell check config,
or other non-TypeScript files that don't affect type checking.

Ignored file patterns:

- '.cspell.json'
- '\*\*.md'
- '\*\*.txt'
- 'docs/\*\*'

#### Returns

`Promise`\<`void`\>

A promise that resolves when the check is complete. Sets GITHUB_OUTPUT
environment variable with should_run=true/false if running in GitHub Actions.
