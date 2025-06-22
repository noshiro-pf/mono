[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/format

# functions/format

## Functions

### formatDiffFrom()

> **formatDiffFrom**(`base`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:154](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L154)

Format only files that differ from the specified base branch or commit

#### Parameters

##### base

`string`

Base branch name or commit hash to compare against (defaults to 'main')

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatFiles()

> **formatFiles**(`pathGlob`): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:13](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L13)

Format files matching the given glob pattern using Prettier

#### Parameters

##### pathGlob

`string`

Glob pattern to match files

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred

---

### formatUntracked()

> **formatUntracked**(): `Promise`\<`"ok"` \| `"err"`\>

Defined in: [src/functions/format.mts:80](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/format.mts#L80)

Format only files that have been changed (git status)

#### Returns

`Promise`\<`"ok"` \| `"err"`\>

'ok' if successful, 'err' if any errors occurred
