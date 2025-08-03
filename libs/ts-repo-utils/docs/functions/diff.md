[**ts-repo-utils**](../README.md)

---

[ts-repo-utils](../README.md) / functions/diff

# functions/diff

## Functions

### getDiffFrom()

> **getDiffFrom**(`base`, `options?`): `Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/diff.mts:44](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/diff.mts#L44)

Get files that differ from the specified base branch or commit

#### Parameters

##### base

`string`

##### options?

`Readonly`\<\{ `excludeDeleted?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

---

### getUntrackedFiles()

> **getUntrackedFiles**(`options?`): `Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/diff.mts:6](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/diff.mts#L6)

Get files that have been changed (git status).

#### Parameters

##### options?

`Readonly`\<\{ `excludeDeleted?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>
