[**eslint-config-typed**](../README.md)

---

[eslint-config-typed](../README.md) / configs/jest

# configs/jest

## Functions

### eslintFlatConfigForJest()

> **eslintFlatConfigForJest**(`files?`): `object`

Defined in: [src/configs/jest.mts:5](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/configs/jest.mts#L5)

#### Parameters

##### files?

readonly `string`[]

#### Returns

##### basePath?

> `readonly` `optional` **basePath**: `string`

The base path for files and ignores.

Note that this is not permitted inside an `extends` array.

Since ESLint 9.30.0

##### files?

> `readonly` `optional` **files**: readonly (`string` \| readonly `string`[])[]

An array of glob patterns indicating the files that the configuration object should apply to.
If not specified, the configuration object applies to all files matched by any other configuration object.

##### ignores?

> `readonly` `optional` **ignores**: readonly `string`[]

An array of glob patterns indicating the files that the configuration object should not apply to.
If not specified, the configuration object applies to all files matched by files.

##### language?

> `readonly` `optional` **language**: `string`

Language specifier in the form `namespace/language-name` where `namespace` is a plugin name set in the `plugins` field.

##### languageOptions?

> `readonly` `optional` **languageOptions**: `object`

An object containing settings related to how JavaScript is configured for linting.

###### languageOptions.ecmaVersion?

> `readonly` `optional` **ecmaVersion**: `EcmaVersion`

The version of ECMAScript to support.
May be any year (i.e., `2022`) or version (i.e., `5`).
Set to `"latest"` for the most recent supported version.

###### Default

```ts
'latest';
```

###### languageOptions.globals?

> `readonly` `optional` **globals**: `object`

An object specifying additional objects that should be added to the global scope during linting.

###### Index Signature

\[`key`: `string`\]: `GlobalVariableOption`

###### languageOptions.parser?

> `readonly` `optional` **parser**: \{ `meta?`: \{ `name?`: `string`; `version?`: `string`; \}; `parseForESLint`: \{ `ast`: `unknown`; `scopeManager?`: `unknown`; `services?`: `unknown`; `visitorKeys?`: `unknown`; \}; \} \| \{ `meta?`: \{ `name?`: `string`; `version?`: `string`; \}; `parse`: `unknown`; \}

An object containing a `parse()` method or a `parseForESLint()` method.

###### Type Declaration

\{ `meta?`: \{ `name?`: `string`; `version?`: `string`; \}; `parseForESLint`: \{ `ast`: `unknown`; `scopeManager?`: `unknown`; `services?`: `unknown`; `visitorKeys?`: `unknown`; \}; \}

\{ `meta?`: \{ `name?`: `string`; `version?`: `string`; \}; `parse`: `unknown`; \}

###### Default

```
// https://github.com/eslint/espree
require('espree')
```

###### languageOptions.parserOptions?

> `readonly` `optional` **parserOptions**: `object`

An object specifying additional options that are passed directly to the parser.
The available options are parser-dependent.

###### Index Signature

\[`key`: `string`\]: `unknown`

###### languageOptions.parserOptions.cacheLifetime?

> `readonly` `optional` **cacheLifetime**: `object`

###### languageOptions.parserOptions.cacheLifetime.glob?

> `readonly` `optional` **glob**: `CacheDurationSeconds`

###### languageOptions.parserOptions.debugLevel?

> `readonly` `optional` **debugLevel**: `boolean` \| readonly (`"eslint"` \| `"typescript"` \| `"typescript-eslint"`)[]

###### languageOptions.parserOptions.ecmaFeatures?

> `readonly` `optional` **ecmaFeatures**: `object`

###### Index Signature

\[`key`: `string`\]: `unknown`

###### languageOptions.parserOptions.ecmaFeatures.globalReturn?

> `readonly` `optional` **globalReturn**: `boolean`

###### languageOptions.parserOptions.ecmaFeatures.jsx?

> `readonly` `optional` **jsx**: `boolean`

###### languageOptions.parserOptions.ecmaVersion?

> `readonly` `optional` **ecmaVersion**: `EcmaVersion`

###### languageOptions.parserOptions.emitDecoratorMetadata?

> `readonly` `optional` **emitDecoratorMetadata**: `boolean`

###### languageOptions.parserOptions.errorOnTypeScriptSyntacticAndSemanticIssues?

> `readonly` `optional` **errorOnTypeScriptSyntacticAndSemanticIssues**: `boolean`

###### languageOptions.parserOptions.errorOnUnknownASTType?

> `readonly` `optional` **errorOnUnknownASTType**: `boolean`

###### languageOptions.parserOptions.experimentalDecorators?

> `readonly` `optional` **experimentalDecorators**: `boolean`

###### languageOptions.parserOptions.extraFileExtensions?

> `readonly` `optional` **extraFileExtensions**: readonly `string`[]

###### languageOptions.parserOptions.filePath?

> `readonly` `optional` **filePath**: `string`

###### languageOptions.parserOptions.isolatedDeclarations?

> `readonly` `optional` **isolatedDeclarations**: `boolean`

###### languageOptions.parserOptions.jsDocParsingMode?

> `readonly` `optional` **jsDocParsingMode**: `JSDocParsingMode`

###### languageOptions.parserOptions.jsxFragmentName?

> `readonly` `optional` **jsxFragmentName**: `null` \| `string`

###### languageOptions.parserOptions.jsxPragma?

> `readonly` `optional` **jsxPragma**: `null` \| `string`

###### languageOptions.parserOptions.lib?

> `readonly` `optional` **lib**: readonly `Lib`[]

###### languageOptions.parserOptions.programs?

> `readonly` `optional` **programs**: `null` \| readonly `object`[]

###### languageOptions.parserOptions.project?

> `readonly` `optional` **project**: `null` \| `string` \| `boolean` \| readonly `string`[]

###### languageOptions.parserOptions.projectFolderIgnoreList?

> `readonly` `optional` **projectFolderIgnoreList**: readonly `string`[]

###### languageOptions.parserOptions.projectService?

> `readonly` `optional` **projectService**: `boolean` \| \{ `allowDefaultProject?`: readonly `string`[]; `defaultProject?`: `string`; `loadTypeScriptPlugins?`: `boolean`; `maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING?`: `number`; \}

###### Type Declaration

`boolean`

\{ `allowDefaultProject?`: readonly `string`[]; `defaultProject?`: `string`; `loadTypeScriptPlugins?`: `boolean`; `maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING?`: `number`; \}

###### languageOptions.parserOptions.range?

> `readonly` `optional` **range**: `boolean`

###### languageOptions.parserOptions.sourceType?

> `readonly` `optional` **sourceType**: `SourceType`

###### languageOptions.parserOptions.tokens?

> `readonly` `optional` **tokens**: `boolean`

###### languageOptions.parserOptions.tsconfigRootDir?

> `readonly` `optional` **tsconfigRootDir**: `string`

###### languageOptions.parserOptions.warnOnUnsupportedTypeScriptVersion?

> `readonly` `optional` **warnOnUnsupportedTypeScriptVersion**: `boolean`

###### languageOptions.sourceType?

> `readonly` `optional` **sourceType**: `SourceType`

The type of JavaScript source code.
Possible values are `"script"` for traditional script files, `"module"` for ECMAScript modules (ESM), and `"commonjs"` for CommonJS files.

###### Default

```
// for `.js` and `.mjs` files
"module"
// for `.cjs` files
"commonjs"
```

##### linterOptions?

> `readonly` `optional` **linterOptions**: `object`

An object containing settings related to the linting process.

###### linterOptions.noInlineConfig?

> `readonly` `optional` **noInlineConfig**: `boolean`

A Boolean value indicating if inline configuration is allowed.

###### linterOptions.reportUnusedDisableDirectives?

> `readonly` `optional` **reportUnusedDisableDirectives**: `boolean` \| `Severity` \| `SeverityString`

A severity string indicating if and how unused disable and enable
directives should be tracked and reported. For legacy compatibility, `true`
is equivalent to `"warn"` and `false` is equivalent to `"off"`.

###### Default

```ts
'warn';
```

###### linterOptions.reportUnusedInlineConfigs?

> `readonly` `optional` **reportUnusedInlineConfigs**: `Severity` \| `SeverityString`

A severity string indicating if and how unused inline directives
should be tracked and reported.

since ESLint 9.19.0

###### Default

```ts
'off';
```

##### name?

> `readonly` `optional` **name**: `string`

An string to identify the configuration object. Used in error messages and inspection tools.

##### plugins?

> `readonly` `optional` **plugins**: `object`

An object containing a name-value mapping of plugin names to plugin objects.
When `files` is specified, these plugins are only available to the matching files.

###### Index Signature

\[`key`: `string`\]: `object`

##### processor?

> `readonly` `optional` **processor**: `string` \| \{ `meta?`: \{ `name?`: `string`; `version?`: `string`; \}; `postprocess?`: (`messagesList`, `filename`) => `any`; `preprocess?`: (`text`, `filename`) => `any`; `supportsAutofix?`: `boolean`; \}

Either an object containing `preprocess()` and `postprocess()` methods or
a string indicating the name of a processor inside of a plugin
(i.e., `"pluginName/processorName"`).

###### Type Declaration

`string`

\{ `meta?`: \{ `name?`: `string`; `version?`: `string`; \}; `postprocess?`: (`messagesList`, `filename`) => `any`; `preprocess?`: (`text`, `filename`) => `any`; `supportsAutofix?`: `boolean`; \}

##### rules?

> `readonly` `optional` **rules**: `object`

An object containing the configured rules.
When `files` or `ignores` are specified, these rule configurations are only available to the matching files.

###### Index Signature

\[`key`: `string`\]: `undefined` \| `RuleLevel` \| readonly \[`RuleLevel`, `unknown`\]

##### settings?

> `readonly` `optional` **settings**: `object`

An object containing name-value pairs of information that should be available to all rules.

###### Index Signature

\[`key`: `string`\]: `unknown`
