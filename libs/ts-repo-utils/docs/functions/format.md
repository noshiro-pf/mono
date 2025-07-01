[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/format

# functions/format

## Functions

### formatDiffFrom()

> **formatDiffFrom**(`base`, `options?`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:178](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L178)

Format only files that differ from the specified base branch or commit

#### Parameters

##### base

`string`

Base branch name or commit hash to compare against (defaults to 'main')

##### options?

`Readonly`\<\{ `includeUntracked?`: `boolean`; `silent?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatFiles()

> **formatFiles**(`pathGlob`, `options?`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:80](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L80)

Format files matching the given glob pattern using Prettier

#### Parameters

##### pathGlob

`string`

Glob pattern to match files

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatFilesList()

> **formatFilesList**(`files`, `options?`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:11](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L11)

Format a list of files using Prettier

#### Parameters

##### files

readonly `string`[]

Array of file paths to format

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatUntracked()

> **formatUntracked**(`options?`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:113](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L113)

Format only files that have been changed (git status)

#### Parameters

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred
