[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/assert-repo-is-dirty

# functions/assert-repo-is-dirty

## Functions

### assertRepoIsClean()

> **assertRepoIsClean**(`options?`): `Promise`\<`void`\>

Defined in: [src/functions/assert-repo-is-dirty.mts:20](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-repo-is-dirty.mts#L20)

Checks if the repository is dirty and exits with code 1 if it is.
Shows git status and diff output before exiting.

#### Parameters

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`void`\>

---

### repoIsDirty()

> **repoIsDirty**(`options?`): `Promise`\<`boolean`\>

Defined in: [src/functions/assert-repo-is-dirty.mts:9](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-repo-is-dirty.mts#L9)

Checks if the repository has uncommitted changes.

#### Parameters

##### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

#### Returns

`Promise`\<`boolean`\>

True if the repo is dirty, false otherwise.

#### Throws

Error if git command fails.
