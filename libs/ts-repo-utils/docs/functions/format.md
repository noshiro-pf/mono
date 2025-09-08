[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/format

# functions/format

## Functions

### formatDiffFrom()

> **formatDiffFrom**(`base`, `options?`): `Promise`\<`Result`\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/format.mts:285](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L285)

Format only files that differ from the specified base branch or commit

#### Parameters

##### base

`string`

Base branch name or commit hash to compare against (defaults to
  'main')

##### options?

`Readonly`\<\{ `includeModified?`: `boolean`; `includeStaged?`: `boolean`; `includeUntracked?`: `boolean`; `silent?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<`Result`\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

***

### formatFiles()

> **formatFiles**(`files`, `options?`): `Promise`\<`Result`\<`undefined`, readonly `unknown`[]\>\>

Defined in: [src/functions/format.mts:17](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L17)

Format a list of files using Prettier

#### Parameters

##### files

readonly `string`[]

Array of file paths to format

##### options?

`Readonly`\<\{ `ignore?`: (`filePath`) => `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<`undefined`, readonly `unknown`[]\>\>

***

### formatFilesGlob()

> **formatFilesGlob**(`pathGlob`, `options?`): `Promise`\<`Result`\<`undefined`, `unknown`\>\>

Defined in: [src/functions/format.mts:171](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L171)

Format files matching the given glob pattern using Prettier

#### Parameters

##### pathGlob

`string`

Glob pattern to match files

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<`undefined`, `unknown`\>\>

***

### formatUncommittedFiles()

> **formatUncommittedFiles**(`options?`): `Promise`\<`Result`\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/format.mts:205](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L205)

Format only files that have been changed (git status)

#### Parameters

##### options?

`Readonly`\<\{ `modified?`: `boolean`; `silent?`: `boolean`; `staged?`: `boolean`; `untracked?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<`Result`\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>
