[**eslint-config-typed**](../../../README.md)

***

[eslint-config-typed](../../../README.md) / plugins/total-functions/rules/common

# plugins/total-functions/rules/common

## Type Aliases

### TypePair

> **TypePair** = `Readonly`\<\{ `destinationType`: `Type`; `sourceType`: `Type`; \}\>

Defined in: [src/plugins/total-functions/rules/common.mts:24](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/common.mts#L24)

## Variables

### createRule()

> `const` **createRule**: \<`Options`, `MessageIds`\>(`__namedParameters`) => `RuleModule`\<`MessageIds`, `Options`, `unknown`\>

Defined in: [src/plugins/total-functions/rules/common.mts:9](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/common.mts#L9)

#### Type Parameters

##### Options

`Options` *extends* readonly `unknown`[]

##### MessageIds

`MessageIds` *extends* `string`

#### Parameters

##### \_\_namedParameters

`Readonly`\<`RuleWithMetaAndName`\<`Options`, `MessageIds`, `PluginDocs`\>\>

#### Returns

`RuleModule`\<`MessageIds`, `Options`, `unknown`\>

## Functions

### assignableTypePairs()

> **assignableTypePairs**(`rawDestinationType`, `rawSourceType`, `checker`): readonly `Readonly`\<\{ `destinationType`: `Type`; `sourceType`: `Type`; \}\>[]

Defined in: [src/plugins/total-functions/rules/common.mts:33](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/common.mts#L33)

Breaks the supplied types into their union type parts and returns an array of
pairs of constituent types that are assignable.

#### Parameters

##### rawDestinationType

`Type`

##### rawSourceType

`Type`

##### checker

`TypeChecker`

#### Returns

readonly `Readonly`\<\{ `destinationType`: `Type`; `sourceType`: `Type`; \}\>[]

***

### isLiteral()

> **isLiteral**(`sourceNode`): `boolean`

Defined in: [src/plugins/total-functions/rules/common.mts:60](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/common.mts#L60)

True if this expression is a literal, false otherwise.

#### Parameters

##### sourceNode

`Expression` | `undefined`

#### Returns

`boolean`

***

### typeSymbolName()

> **typeSymbolName**(`type`): `string` \| `undefined`

Defined in: [src/plugins/total-functions/rules/common.mts:13](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/common.mts#L13)

#### Parameters

##### type

`Type`

#### Returns

`string` \| `undefined`
