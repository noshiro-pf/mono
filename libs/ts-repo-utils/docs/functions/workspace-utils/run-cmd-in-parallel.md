[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / functions/workspace-utils/run-cmd-in-parallel

# functions/workspace-utils/run-cmd-in-parallel

## Functions

### runCmdInParallelAcrossWorkspaces()

> **runCmdInParallelAcrossWorkspaces**(`options`): `Promise`\<`void`\>

Defined in: [src/functions/workspace-utils/run-cmd-in-parallel.mts:17](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/workspace-utils/run-cmd-in-parallel.mts#L17)

Executes a npm script command across all workspace packages in parallel.

#### Parameters

##### options

`Readonly`\<\{ `cmd`: `string`; `concurrency?`: `number`; `filterWorkspacePattern?`: (`packageName`) => `boolean`; `rootPackageJsonDir`: `string`; \}\>

Configuration options for the parallel execution

#### Returns

`Promise`\<`void`\>

A promise that resolves when all packages have completed execution
