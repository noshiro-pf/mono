[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/gen-index

# functions/gen-index

## Type Aliases

### GenIndexConfig

> **GenIndexConfig** = `DeepReadonly`\<\{ `excludePatterns?`: readonly `string`[]; `exportExtension?`: `` `.${string}` `` \| `"none"`; `formatCommand?`: `string`; `indexExtension?`: `` `.${string}` ``; `silent?`: `boolean`; `sourceExtensions?`: readonly `` `.${string}` ``[]; `targetDirectory`: `string` \| readonly `string`[]; \}\>

Defined in: [src/functions/gen-index.mts:7](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/gen-index.mts#L7)

Configuration for index file generation.

## Functions

### genIndex()

> **genIndex**(`config`): `Promise`\<`void`\>

Defined in: [src/functions/gen-index.mts:49](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/gen-index.mts#L49)

Generates index.ts files recursively in `config.targetDirectory`.

#### Parameters

##### config

Configuration for index file generation

###### excludePatterns?

readonly `string`[]

Glob patterns of files to exclude from exports (default: excludes
`'**/*.{test,spec}.?(c|m)[jt]s?(x)'`)

###### exportExtension?

`` `.${string}` `` \| `"none"`

File extension to use in export statements (default: '.js')

###### formatCommand?

`string`

Command to run for formatting generated files (default: 'npm run fmt')

###### indexExtension?

`` `.${string}` ``

File extension of index files to generate (default: '.ts')

###### silent?

`boolean`

Whether to suppress output during execution (default: false)

###### sourceExtensions?

readonly `` `.${string}` ``[]

File extensions of source files to export (default: ['.ts', '.tsx'])

###### targetDirectory

`string` \| readonly `string`[]

Target directories to generate index files for (string or array of strings)

#### Returns

`Promise`\<`void`\>

#### Throws

Error if any step fails.
