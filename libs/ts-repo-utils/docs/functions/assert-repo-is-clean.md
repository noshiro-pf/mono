[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/assert-repo-is-clean

# functions/assert-repo-is-clean

## Functions

### assertRepoIsClean()

> **assertRepoIsClean**(`options?`): `Promise`\<`void`\>

Defined in: [src/functions/assert-repo-is-clean.mts:26](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-repo-is-clean.mts#L26)

Checks if the repository is clean and exits with code 1 if it is dirty. Shows
git status and diff output before exiting.

#### Parameters

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`void`\>

***

### repoIsDirty()

> **repoIsDirty**(`options?`): `Promise`\<`boolean`\>

Defined in: [src/functions/assert-repo-is-clean.mts:10](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-repo-is-clean.mts#L10)

Checks if the repository has uncommitted changes.

#### Parameters

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`boolean`\>

True if the repo is dirty, false otherwise.

#### Throws

Error if git command fails.
