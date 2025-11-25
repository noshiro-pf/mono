[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/format

# functions/format

## Functions

### formatDiffFrom()

> **formatDiffFrom**(`base`, `options?`): `Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/format.mts:336](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L336)

Format only files that differ from the specified base branch or commit

#### Parameters

##### base

`string`

Base branch name or commit hash to compare against (defaults to
  'main')

##### options?

`Readonly`\<\{ `ignore?`: `false` \| (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `includeModified?`: `boolean`; `includeStaged?`: `boolean`; `includeUntracked?`: `boolean`; `silent?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

***

### formatFiles()

> **formatFiles**(`files`, `options?`): `Promise`\<[`Result`](../node-global.md#result)\<`undefined`, readonly `unknown`[]\>\>

Defined in: [src/functions/format.mts:18](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L18)

Format a list of files using Prettier

#### Parameters

##### files

readonly `string`[]

Array of file paths to format

##### options?

`Readonly`\<\{ `ignore?`: `false` \| (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<[`Result`](../node-global.md#result)\<`undefined`, readonly `unknown`[]\>\>

***

### formatFilesGlob()

> **formatFilesGlob**(`pathGlob`, `options?`): `Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `unknown`\>\>

Defined in: [src/functions/format.mts:200](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L200)

Format files matching the given glob pattern using Prettier

#### Parameters

##### pathGlob

`string`

Glob pattern to match files

##### options?

`Readonly`\<\{ `ignore?`: `false` \| (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `unknown`\>\>

***

### formatUncommittedFiles()

> **formatUncommittedFiles**(`options?`): `Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/format.mts:245](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L245)

Format only files that have been changed (git status)

#### Parameters

##### options?

`Readonly`\<\{ `ignore?`: `false` \| (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `modified?`: `boolean`; `silent?`: `boolean`; `staged?`: `boolean`; `untracked?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>
