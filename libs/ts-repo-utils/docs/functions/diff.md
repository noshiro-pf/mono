[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/diff

# functions/diff

## Functions

### getDiffFrom()

> **getDiffFrom**(`base`, `options?`): `Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/diff.mts:72](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/diff.mts#L72)

Get files that differ from the specified base branch or commit. Runs `git
diff --name-only <base> [--diff-filter=d]`

#### Parameters

##### base

`string`

##### options?

`Readonly`\<\{ `excludeDeleted?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

***

### getModifiedFiles()

> **getModifiedFiles**(`options?`): `Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/diff.mts:30](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/diff.mts#L30)

Get untracked files from the working tree (files not added to git). Runs `git
git diff --staged --name-only [--diff-filter=d]`

#### Parameters

##### options?

`Readonly`\<\{ `excludeDeleted?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

***

### getStagedFiles()

> **getStagedFiles**(`options?`): `Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/diff.mts:51](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/diff.mts#L51)

Get files that are staged for commit (files added with git add). Runs `git
diff --staged --name-only [--diff-filter=d]`

#### Parameters

##### options?

`Readonly`\<\{ `excludeDeleted?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

***

### getUntrackedFiles()

> **getUntrackedFiles**(`options?`): `Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>

Defined in: [src/functions/diff.mts:9](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/diff.mts#L9)

Get untracked files from the working tree (files not added to git). Runs `git
ls-files --others --exclude-standard [--deleted]`

#### Parameters

##### options?

`Readonly`\<\{ `excludeDeleted?`: `boolean`; `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`Result`\<readonly `string`[], `ExecException` \| `Readonly`\<\{ `message`: `string`; \}\>\>\>
