[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / functions/workspace-utils/run-cmd-in-stages

# functions/workspace-utils/run-cmd-in-stages

## Functions

### runCmdInStagesAcrossWorkspaces()

> **runCmdInStagesAcrossWorkspaces**(`options`): `Promise`\<`void`\>

Defined in: [src/functions/workspace-utils/run-cmd-in-stages.mts:17](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/workspace-utils/run-cmd-in-stages.mts#L17)

Executes a npm script command across all workspace packages in dependency order stages.
Packages are grouped into stages where each stage contains packages whose
dependencies have been completed in previous stages.

#### Parameters

##### options

`Readonly`\<\{ `cmd`: `string`; `concurrency?`: `number`; `filterWorkspacePattern?`: (`packageName`) => `boolean`; `rootPackageJsonDir`: `string`; \}\>

Configuration options for the staged execution

#### Returns

`Promise`\<`void`\>

A promise that resolves when all stages have completed execution
