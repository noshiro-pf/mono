[**ts-repo-utils**](../../README.md)

---

[ts-repo-utils](../../README.md) / functions/workspace-utils/execute-parallel

# functions/workspace-utils/execute-parallel

## Functions

### executeParallel()

> **executeParallel**(`packages`, `scriptName`, `concurrency`): `Promise`\<readonly `Result`\<`Readonly`\<\{ `code?`: `number`; `skipped?`: `boolean`; \}\>, `Error`\>[]\>

Defined in: [src/functions/workspace-utils/execute-parallel.mts:25](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/workspace-utils/execute-parallel.mts#L25)

Executes a npm script across multiple packages in parallel with a concurrency
limit.

#### Parameters

##### packages

readonly `Readonly`\<\{ `dependencies`: `ReadonlyRecord`\<`string`, `string`\>; `name`: `string`; `packageJson`: `JsonValue`; `path`: `string`; \}\>[]

Array of Package objects to execute the script in

##### scriptName

`string`

The name of the npm script to execute

##### concurrency

`number` = `3`

Maximum number of packages to process simultaneously
(default: 3)

#### Returns

`Promise`\<readonly `Result`\<`Readonly`\<\{ `code?`: `number`; `skipped?`: `boolean`; \}\>, `Error`\>[]\>

A promise that resolves to an array of execution results

---

### executeStages()

> **executeStages**(`packages`, `scriptName`, `concurrency`): `Promise`\<`void`\>

Defined in: [src/functions/workspace-utils/execute-parallel.mts:77](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/workspace-utils/execute-parallel.mts#L77)

Executes a npm script across packages in dependency order stages. Packages
are grouped into stages where each stage contains packages whose dependencies
have been completed in previous stages.

#### Parameters

##### packages

readonly `Readonly`\<\{ `dependencies`: `ReadonlyRecord`\<`string`, `string`\>; `name`: `string`; `packageJson`: `JsonValue`; `path`: `string`; \}\>[]

Array of Package objects to execute the script in

##### scriptName

`string`

The name of the npm script to execute

##### concurrency

`number` = `3`

Maximum number of packages to process simultaneously
within each stage (default: 3)

#### Returns

`Promise`\<`void`\>

A promise that resolves when all stages are complete
