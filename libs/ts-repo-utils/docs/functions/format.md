[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/format

# functions/format

## Functions

### formatDiffFrom()

> **formatDiffFrom**(`base`, `options?`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:148](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L148)

Format only files that differ from the specified base branch or commit

#### Parameters

##### base

`string`

Base branch name or commit hash to compare against (defaults to 'main')

##### options?

`Readonly`\<\{ `includeUntracked?`: `boolean`; \}\>

Options for formatting

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatFiles()

> **formatFiles**(`pathGlob`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:71](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L71)

Format files matching the given glob pattern using Prettier

#### Parameters

##### pathGlob

`string`

Glob pattern to match files

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatFilesList()

> **formatFilesList**(`files`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:13](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L13)

Format a list of files using Prettier

#### Parameters

##### files

readonly `string`[]

Array of file paths to format

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatUntracked()

> **formatUntracked**(): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:96](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L96)

Format only files that have been changed (git status)

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred
