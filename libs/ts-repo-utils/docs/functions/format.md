[**ts-repo-utils**](../README.md)

---

[ts-repo-utils](../README.md) / functions/format

# functions/format

## Functions

### formatDiffFrom()

> **formatDiffFrom**(`base`, `options?`): `Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/format.mts:309](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L309)

Format only files that differ from the specified base branch or commit

#### Parameters

##### base

`string`

Base branch name or commit hash to compare against (defaults to
'main')

##### options?

`Readonly`\<\{ `ignore?`: (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `includeModified?`: `boolean`; `includeStaged?`: `boolean`; `includeUntracked?`: `boolean`; `silent?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

---

### formatFiles()

> **formatFiles**(`files`, `options?`): `Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, readonly `unknown`[]\>\>

Defined in: [src/functions/format.mts:17](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L17)

Format a list of files using Prettier

#### Parameters

##### files

readonly `string`[]

Array of file paths to format

##### options?

`Readonly`\<\{ `ignore?`: (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, readonly `unknown`[]\>\>

---

### formatFilesGlob()

> **formatFilesGlob**(`pathGlob`, `options?`): `Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `unknown`\>\>

Defined in: [src/functions/format.mts:181](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L181)

Format files matching the given glob pattern using Prettier

#### Parameters

##### pathGlob

`string`

Glob pattern to match files

##### options?

`Readonly`\<\{ `ignore?`: (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `unknown`\>\>

---

### formatUncommittedFiles()

> **formatUncommittedFiles**(`options?`): `Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/format.mts:221](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L221)

Format only files that have been changed (git status)

#### Parameters

##### options?

`Readonly`\<\{ `ignore?`: (`filePath`) => `boolean`; `ignoreUnknown?`: `boolean`; `modified?`: `boolean`; `silent?`: `boolean`; `staged?`: `boolean`; `untracked?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `ExecException` \| readonly `unknown`[] \| `Readonly`\<\{ `message`: `string`; \}\>\>\>
