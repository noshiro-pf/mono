[**ts-repo-utils**](../../README.md)

***

[ts-repo-utils](../../README.md) / functions/workspace-utils/run-cmd-in-stages

# functions/workspace-utils/run-cmd-in-stages

## Functions

### runCmdInStagesAcrossWorkspaces()

> **runCmdInStagesAcrossWorkspaces**(`options`): `Promise`\<`void`\>

Defined in: [src/functions/workspace-utils/run-cmd-in-stages.mts:24](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/workspace-utils/run-cmd-in-stages.mts#L24)

Executes a npm script command across all workspace packages in dependency
order stages. Packages are grouped into stages where each stage contains
packages whose dependencies have been completed in previous stages. Uses
fail-fast behavior - stops execution immediately when any package fails.

#### Parameters

##### options

`Readonly`\<\{ `cmd`: `string`; `concurrency?`: `number`; `filterWorkspacePattern?`: (`packageName`) => `boolean`; `rootPackageJsonDir`: `string`; \}\>

Configuration options for the staged execution

#### Returns

`Promise`\<`void`\>

A promise that resolves when all stages have completed execution
  successfully, or rejects immediately on first failure
