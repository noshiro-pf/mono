[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / functions/workspace-utils/get-workspace-packages

# functions/workspace-utils/get-workspace-packages

## Functions

### getWorkspacePackages()

> **getWorkspacePackages**(`rootPackageJsonDir`): `Promise`\<readonly `Readonly`\<\{ `dependencies`: `ReadonlyRecord`\<`string`, `string`\>; `name`: `string`; `packageJson`: `JsonValue`; `path`: `string`; \}\>[]\>

Defined in: [src/functions/workspace-utils/get-workspace-packages.mts:23](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/workspace-utils/get-workspace-packages.mts#L23)

Retrieves all workspace packages from a monorepo based on the workspace
patterns defined in the root package.json file.

#### Parameters

##### rootPackageJsonDir

`string`

The directory containing the root package.json
file

#### Returns

`Promise`\<readonly `Readonly`\<\{ `dependencies`: `ReadonlyRecord`\<`string`, `string`\>; `name`: `string`; `packageJson`: `JsonValue`; `path`: `string`; \}\>[]\>

A promise that resolves to an array of Package objects containing
package metadata
