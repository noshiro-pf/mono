[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/gen-index

# functions/gen-index

## Type Aliases

### GenIndexConfig

> **GenIndexConfig** = `DeepReadonly`\<\{ `excludePatterns?`: `string`[]; `exportExtension?`: `` `.${string}` ``; `formatCommand`: `string`; `silent?`: `boolean`; `sourceExtension?`: `` `.${string}` ``; `targetDirectory`: `string` \| `string`[]; \}\>

Defined in: [src/functions/gen-index.mts:9](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/gen-index.mts#L9)

Configuration for index file generation.

## Functions

### genIndex()

> **genIndex**(`config`): `Promise`\<`void`\>

Defined in: [src/functions/gen-index.mts:34](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/gen-index.mts#L34)

Generates index.mts files recursively in `config.targetDirectory`.

#### Parameters

##### config

Configuration for index file generation

###### excludePatterns?

readonly `string`[]

Glob patterns of files to exclude from exports (default: excludes .d._ and .test._ files)

###### exportExtension?

`` `.${string}` ``

File extension to use in export statements (default: '.mjs')

###### formatCommand

`string`

Command to run for formatting generated files (default: 'npm run fmt')

###### silent?

`boolean`

Whether to suppress output during execution (default: false)

###### sourceExtension?

`` `.${string}` ``

File extension of source files to export (default: '.mts')

###### targetDirectory

`string` \| readonly `string`[]

Target directories to generate index files for (string or array of strings)

#### Returns

`Promise`\<`void`\>

#### Throws

Error if any step fails.
