[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/gen-index

# functions/gen-index

## Type Aliases

### GenIndexConfig

> **GenIndexConfig** = `DeepReadonly`\<\{ `exclude?`: readonly `string`[] \| (`args`) => `boolean`; `exportStatementExtension?`: `` `.${string}` `` \| `"none"`; `formatCommand?`: `string`; `indexFileExtension?`: `` `.${string}` ``; `silent?`: `boolean`; `targetDirectory`: `string` \| readonly `string`[]; `targetExtensions?`: readonly `` `.${string}` ``[]; \}\>

Defined in: [src/functions/gen-index.mts:7](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/gen-index.mts#L7)

Configuration for index file generation.

## Functions

### genIndex()

> **genIndex**(`config`): `Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `unknown`\>\>

Defined in: [src/functions/gen-index.mts:74](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/gen-index.mts#L74)

Generates index.ts files recursively in `config.targetDirectory`.

#### Parameters

##### config

Configuration for index file generation

###### exclude?

readonly `string`[] \| (`args`) => `boolean`

Glob patterns of files or predicate function to exclude from exports
(default: excludes `'**/*.{test,spec}.?(c|m)[jt]s?(x)'` and
`'**/*.d.?(c|m)ts'`)

###### exportStatementExtension?

`` `.${string}` `` \| `"none"`

File extension to use in export statements (default: '.js')

###### formatCommand?

`string`

Command to run for formatting generated files (optional)

###### indexFileExtension?

`` `.${string}` ``

File extension of index files to generate (default: '.ts')

###### silent?

`boolean`

Whether to suppress output during execution (default: false)

###### targetDirectory

`string` \| readonly `string`[]

Target directories to generate index files for (string or array of strings)

###### targetExtensions?

readonly `` `.${string}` ``[]

File extensions of source files to export (default: ['.ts', '.tsx'])

#### Returns

`Promise`\<[`Result`](../node-global.md#result)\<`undefined`, `unknown`\>\>

#### Throws

Error if any step fails.
