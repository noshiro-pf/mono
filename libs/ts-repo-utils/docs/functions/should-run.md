[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/should-run

# functions/should-run

## Functions

### checkShouldRunTypeChecks()

> **checkShouldRunTypeChecks**(`options?`): `Promise`\<`void`\>

Defined in: [src/functions/should-run.mts:59](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/should-run.mts#L59)

Checks if TypeScript type checks should run based on the diff from a base
branch. Skips type checks if all changed files match the ignored patterns.

This function is typically used in CI/CD pipelines to determine whether
expensive type checking operations should be performed. If all changed files
are documentation, configuration, or other non-TypeScript files, type checks
can be safely skipped to improve build performance.

#### Parameters

##### options?

`Readonly`\<\{ `baseBranch?`: `string`; `pathsIgnore?`: readonly `string`[]; \}\>

Configuration options

#### Returns

`Promise`\<`void`\>

A promise that resolves when the check is complete. The function
  will set the GITHUB_OUTPUT environment variable with `should_run=true` or
  `should_run=false` if running in GitHub Actions environment.

#### Examples

```typescript
  // Use default settings (compare against origin/main, ignore docs/md/txt files)
  await checkShouldRunTypeChecks();

  // Custom ignore patterns
  await checkShouldRunTypeChecks({
    pathsIgnore: ['.eslintrc.json', 'docs/', '**.md', 'scripts/'],
  });

  // Custom base branch
  await checkShouldRunTypeChecks({
    baseBranch: 'origin/develop',
  });
  ```;

GitHub Actions usage
  ```yaml
  - name: Check if type checks should run
  id: check_diff
  run: npx check-should-run-type-checks

  - name: Run type checks
  if: steps.check_diff.outputs.should_run == 'true'
  run: npm run type-check
  ```
