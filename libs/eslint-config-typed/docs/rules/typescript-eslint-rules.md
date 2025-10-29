[**eslint-config-typed**](../README.md)

---

[eslint-config-typed](../README.md) / rules/typescript-eslint-rules

# rules/typescript-eslint-rules

## Variables

### typescriptEslintRules

> `const` **typescriptEslintRules**: `object`

Defined in: [src/rules/typescript-eslint-rules.mts:6](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/typescript-eslint-rules.mts#L6)

#### Type Declaration

##### @typescript-eslint/adjacent-overload-signatures

> `readonly` **@typescript-eslint/adjacent-overload-signatures**: `"error"` = `'error'`

##### @typescript-eslint/array-type

> `readonly` **@typescript-eslint/array-type**: readonly \[`"error"`, \{ `default`: `"array"`; `readonly`: `"array"`; \}\]

##### @typescript-eslint/await-thenable

> `readonly` **@typescript-eslint/await-thenable**: `"error"` = `'error'`

##### @typescript-eslint/ban-ts-comment

> `readonly` **@typescript-eslint/ban-ts-comment**: `1` \| `2`

##### @typescript-eslint/ban-tslint-comment

> `readonly` **@typescript-eslint/ban-tslint-comment**: `"error"` = `'error'`

##### @typescript-eslint/class-literal-property-style

> `readonly` **@typescript-eslint/class-literal-property-style**: `1` \| `2`

##### @typescript-eslint/class-methods-use-this

> `readonly` **@typescript-eslint/class-methods-use-this**: readonly \[`"error"`, \{ `enforceForClassFields`: `true`; `exceptMethods`: readonly \[\]; `ignoreClassesThatImplementAnInterface`: `false`; `ignoreOverrideMethods`: `true`; \}\]

##### @typescript-eslint/consistent-generic-constructors

> `readonly` **@typescript-eslint/consistent-generic-constructors**: `1` \| `2`

##### @typescript-eslint/consistent-indexed-object-style

> `readonly` **@typescript-eslint/consistent-indexed-object-style**: `1` \| `2`

##### @typescript-eslint/consistent-return

> `readonly` **@typescript-eslint/consistent-return**: `"off"` = `'off'`

##### @typescript-eslint/consistent-type-assertions

> `readonly` **@typescript-eslint/consistent-type-assertions**: readonly \[`"error"`, \{ `assertionStyle`: `"as"`; `objectLiteralTypeAssertions`: `"never"`; \}\]

##### @typescript-eslint/consistent-type-definitions

> `readonly` **@typescript-eslint/consistent-type-definitions**: readonly \[`"error"`, `"type"`\]

##### @typescript-eslint/consistent-type-exports

> `readonly` **@typescript-eslint/consistent-type-exports**: readonly \[`"off"`, \{ `fixMixedExportsWithInlineTypeSpecifier`: `true`; \}\]

##### @typescript-eslint/consistent-type-imports

> `readonly` **@typescript-eslint/consistent-type-imports**: readonly \[`"error"`, \{ `disallowTypeAnnotations`: `true`; `fixStyle`: `"inline-type-imports"`; `prefer`: `"type-imports"`; \}\]

##### @typescript-eslint/default-param-last

> `readonly` **@typescript-eslint/default-param-last**: `"error"` = `'error'`

##### @typescript-eslint/dot-notation

> `readonly` **@typescript-eslint/dot-notation**: readonly \[`"error"`, \{ `allowIndexSignaturePropertyAccess`: `true`; \}\]

Related to noPropertyAccessFromIndexSignature tsc option

##### @typescript-eslint/explicit-function-return-type

> `readonly` **@typescript-eslint/explicit-function-return-type**: readonly \[`"error"`, \{ `allowConciseArrowFunctionExpressionsStartingWithVoid`: `false`; `allowDirectConstAssertionInArrowFunctions`: `true`; `allowedNames`: readonly \[\]; `allowExpressions`: `true`; `allowFunctionsWithoutTypeParameters`: `false`; `allowHigherOrderFunctions`: `true`; `allowIIFEs`: `false`; `allowTypedFunctionExpressions`: `true`; \}\]

##### @typescript-eslint/explicit-member-accessibility

> `readonly` **@typescript-eslint/explicit-member-accessibility**: readonly \[`"error"`, \{ `accessibility`: `"no-public"`; \}\]

##### @typescript-eslint/explicit-module-boundary-types

> `readonly` **@typescript-eslint/explicit-module-boundary-types**: `"off"` = `'off'`

##### @typescript-eslint/init-declarations

> `readonly` **@typescript-eslint/init-declarations**: `"off"` = `'off'`

##### @typescript-eslint/max-params

> `readonly` **@typescript-eslint/max-params**: `"off"` = `'off'`

##### @typescript-eslint/member-ordering

> `readonly` **@typescript-eslint/member-ordering**: `"off"` = `'off'`

##### @typescript-eslint/method-signature-style

> `readonly` **@typescript-eslint/method-signature-style**: readonly \[`"error"`, `"property"`\]

Function members written in method notation become bivariant, reducing type
safety
https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant

##### @typescript-eslint/naming-convention

> `readonly` **@typescript-eslint/naming-convention**: `"off"` = `'off'`

##### @typescript-eslint/no-array-constructor

> `readonly` **@typescript-eslint/no-array-constructor**: `"error"` = `'error'`

##### @typescript-eslint/no-array-delete

> `readonly` **@typescript-eslint/no-array-delete**: `"error"` = `'error'`

##### @typescript-eslint/no-base-to-string

> `readonly` **@typescript-eslint/no-base-to-string**: `1` \| `2`

##### @typescript-eslint/no-confusing-non-null-assertion

> `readonly` **@typescript-eslint/no-confusing-non-null-assertion**: `"error"` = `'error'`

##### @typescript-eslint/no-confusing-void-expression

> `readonly` **@typescript-eslint/no-confusing-void-expression**: readonly \[`"error"`, \{ `ignoreArrowShorthand`: `false`; `ignoreVoidOperator`: `false`; `ignoreVoidReturningFunctions`: `false`; \}\]

##### @typescript-eslint/no-deprecated

> `readonly` **@typescript-eslint/no-deprecated**: `1` \| `2`

##### @typescript-eslint/no-dupe-class-members

> `readonly` **@typescript-eslint/no-dupe-class-members**: `"error"` = `'error'`

##### @typescript-eslint/no-duplicate-enum-values

> `readonly` **@typescript-eslint/no-duplicate-enum-values**: `"error"` = `'error'`

##### @typescript-eslint/no-duplicate-type-constituents

> `readonly` **@typescript-eslint/no-duplicate-type-constituents**: `1` \| `2`

##### @typescript-eslint/no-dynamic-delete

> `readonly` **@typescript-eslint/no-dynamic-delete**: `"error"` = `'error'`

##### @typescript-eslint/no-empty-function

> `readonly` **@typescript-eslint/no-empty-function**: `"off"` = `'off'`

##### @typescript-eslint/no-empty-interface

> `readonly` **@typescript-eslint/no-empty-interface**: `0` = `0`

##### @typescript-eslint/no-empty-object-type

> `readonly` **@typescript-eslint/no-empty-object-type**: `1` \| `2`

##### @typescript-eslint/no-explicit-any

> `readonly` **@typescript-eslint/no-explicit-any**: readonly \[`"error"`, \{ `fixToUnknown`: `false`; `ignoreRestArgs`: `false`; \}\]

##### @typescript-eslint/no-extra-non-null-assertion

> `readonly` **@typescript-eslint/no-extra-non-null-assertion**: `"error"` = `'error'`

##### @typescript-eslint/no-extraneous-class

> `readonly` **@typescript-eslint/no-extraneous-class**: `1` \| `2`

##### @typescript-eslint/no-floating-promises

> `readonly` **@typescript-eslint/no-floating-promises**: `1` \| `2`

##### @typescript-eslint/no-for-in-array

> `readonly` **@typescript-eslint/no-for-in-array**: `"error"` = `'error'`

##### @typescript-eslint/no-implied-eval

> `readonly` **@typescript-eslint/no-implied-eval**: `"error"` = `'error'`

##### @typescript-eslint/no-import-type-side-effects

> `readonly` **@typescript-eslint/no-import-type-side-effects**: `"off"` = `'off'`

##### @typescript-eslint/no-inferrable-types

> `readonly` **@typescript-eslint/no-inferrable-types**: `"off"` = `'off'`

Off to allow explicit type annotations when desired

##### @typescript-eslint/no-invalid-this

> `readonly` **@typescript-eslint/no-invalid-this**: `1` \| `2`

##### @typescript-eslint/no-invalid-void-type

> `readonly` **@typescript-eslint/no-invalid-void-type**: `1` \| `2`

##### @typescript-eslint/no-loop-func

> `readonly` **@typescript-eslint/no-loop-func**: `"error"` = `'error'`

##### @typescript-eslint/no-loss-of-precision

> `readonly` **@typescript-eslint/no-loss-of-precision**: `0` = `0`

##### @typescript-eslint/no-magic-numbers

> `readonly` **@typescript-eslint/no-magic-numbers**: `"off"` = `'off'`

##### @typescript-eslint/no-meaningless-void-operator

> `readonly` **@typescript-eslint/no-meaningless-void-operator**: `1` \| `2`

##### @typescript-eslint/no-misused-new

> `readonly` **@typescript-eslint/no-misused-new**: `"error"` = `'error'`

##### @typescript-eslint/no-misused-promises

> `readonly` **@typescript-eslint/no-misused-promises**: readonly \[`"error"`, \{ `checksConditionals`: `false`; `checksSpreads`: `true`; `checksVoidReturn`: `true`; \}\]

##### @typescript-eslint/no-misused-spread

> `readonly` **@typescript-eslint/no-misused-spread**: `1` \| `2`

##### @typescript-eslint/no-mixed-enums

> `readonly` **@typescript-eslint/no-mixed-enums**: `"error"` = `'error'`

##### @typescript-eslint/no-namespace

> `readonly` **@typescript-eslint/no-namespace**: `"off"` = `'off'`

##### @typescript-eslint/no-non-null-asserted-nullish-coalescing

> `readonly` **@typescript-eslint/no-non-null-asserted-nullish-coalescing**: `"error"` = `'error'`

##### @typescript-eslint/no-non-null-asserted-optional-chain

> `readonly` **@typescript-eslint/no-non-null-asserted-optional-chain**: `"error"` = `'error'`

##### @typescript-eslint/no-non-null-assertion

> `readonly` **@typescript-eslint/no-non-null-assertion**: `"error"` = `'error'`

##### @typescript-eslint/no-redeclare

> `readonly` **@typescript-eslint/no-redeclare**: `"off"` = `'off'`

##### @typescript-eslint/no-redundant-type-constituents

> `readonly` **@typescript-eslint/no-redundant-type-constituents**: `"error"` = `'error'`

##### @typescript-eslint/no-require-imports

> `readonly` **@typescript-eslint/no-require-imports**: `1` \| `2`

##### @typescript-eslint/no-restricted-imports

> `readonly` **@typescript-eslint/no-restricted-imports**: `"off"` = `'off'`

##### @typescript-eslint/no-restricted-types

> `readonly` **@typescript-eslint/no-restricted-types**: readonly \[`"error"`, \{ `types`: \{ `object`: \{ `fixWith`: `"UnknownRecord"`; `message`: ``"Use `UnknownRecord` instead."``; \}; \}; \}\]

##### @typescript-eslint/no-shadow

> `readonly` **@typescript-eslint/no-shadow**: readonly \[`"error"`, \{ `builtinGlobals`: `true`; `hoist`: `"all"`; `ignoreFunctionTypeParameterNameValueShadow`: `false`; `ignoreTypeValueShadow`: `false`; \}\]

##### @typescript-eslint/no-this-alias

> `readonly` **@typescript-eslint/no-this-alias**: `1` \| `2`

##### @typescript-eslint/no-type-alias

> `readonly` **@typescript-eslint/no-type-alias**: `0` = `0`

##### @typescript-eslint/no-unnecessary-boolean-literal-compare

> `readonly` **@typescript-eslint/no-unnecessary-boolean-literal-compare**: readonly \[`"error"`, \{ `allowComparingNullableBooleansToFalse`: `true`; `allowComparingNullableBooleansToTrue`: `true`; \}\]

##### @typescript-eslint/no-unnecessary-condition

> `readonly` **@typescript-eslint/no-unnecessary-condition**: readonly \[`"error"`, \{ `allowConstantLoopConditions`: `true`; \}\]

##### @typescript-eslint/no-unnecessary-parameter-property-assignment

> `readonly` **@typescript-eslint/no-unnecessary-parameter-property-assignment**: `"error"` = `'error'`

##### @typescript-eslint/no-unnecessary-qualifier

> `readonly` **@typescript-eslint/no-unnecessary-qualifier**: `"error"` = `'error'`

##### @typescript-eslint/no-unnecessary-template-expression

> `readonly` **@typescript-eslint/no-unnecessary-template-expression**: `"error"` = `'error'`

##### @typescript-eslint/no-unnecessary-type-arguments

> `readonly` **@typescript-eslint/no-unnecessary-type-arguments**: `"off"` = `'off'`

##### @typescript-eslint/no-unnecessary-type-assertion

> `readonly` **@typescript-eslint/no-unnecessary-type-assertion**: readonly \[`"error"`, \{ `checkLiteralConstAssertions`: `true`; \}\]

##### @typescript-eslint/no-unnecessary-type-constraint

> `readonly` **@typescript-eslint/no-unnecessary-type-constraint**: `"error"` = `'error'`

##### @typescript-eslint/no-unnecessary-type-conversion

> `readonly` **@typescript-eslint/no-unnecessary-type-conversion**: `"error"` = `'error'`

##### @typescript-eslint/no-unnecessary-type-parameters

> `readonly` **@typescript-eslint/no-unnecessary-type-parameters**: `"off"` = `'off'`

##### @typescript-eslint/no-unsafe-argument

> `readonly` **@typescript-eslint/no-unsafe-argument**: `"error"` = `'error'`

##### @typescript-eslint/no-unsafe-assignment

> `readonly` **@typescript-eslint/no-unsafe-assignment**: `"error"` = `'error'`

##### @typescript-eslint/no-unsafe-call

> `readonly` **@typescript-eslint/no-unsafe-call**: `"error"` = `'error'`

##### @typescript-eslint/no-unsafe-declaration-merging

> `readonly` **@typescript-eslint/no-unsafe-declaration-merging**: `"error"` = `'error'`

##### @typescript-eslint/no-unsafe-enum-comparison

> `readonly` **@typescript-eslint/no-unsafe-enum-comparison**: `"error"` = `'error'`

##### @typescript-eslint/no-unsafe-function-type

> `readonly` **@typescript-eslint/no-unsafe-function-type**: `"error"` = `'error'`

##### @typescript-eslint/no-unsafe-member-access

> `readonly` **@typescript-eslint/no-unsafe-member-access**: readonly \[`"error"`, \{ `allowOptionalChaining`: `false`; \}\]

##### @typescript-eslint/no-unsafe-return

> `readonly` **@typescript-eslint/no-unsafe-return**: `"error"` = `'error'`

##### @typescript-eslint/no-unsafe-type-assertion

> `readonly` **@typescript-eslint/no-unsafe-type-assertion**: `"off"` = `'off'`

##### @typescript-eslint/no-unsafe-unary-minus

> `readonly` **@typescript-eslint/no-unsafe-unary-minus**: `"error"` = `'error'`

##### @typescript-eslint/no-unused-expressions

> `readonly` **@typescript-eslint/no-unused-expressions**: readonly \[`"error"`, \{ `allowShortCircuit`: `false`; `allowTaggedTemplates`: `false`; `allowTernary`: `false`; `enforceForJSX`: `true`; `ignoreDirectives`: `false`; \}\]

##### @typescript-eslint/no-unused-vars

> `readonly` **@typescript-eslint/no-unused-vars**: readonly \[`"error"`, \{ `args`: `"none"`; `argsIgnorePattern`: `"^_"`; `caughtErrors`: `"all"`; `caughtErrorsIgnorePattern`: `"^_"`; `destructuredArrayIgnorePattern`: `"^_"`; `ignoreClassWithStaticInitBlock`: `false`; `ignoreRestSiblings`: `true`; `reportUsedIgnorePattern`: `true`; `vars`: `"all"`; `varsIgnorePattern`: "^jsx$\|^\_"; \}\]

##### @typescript-eslint/no-use-before-define

> `readonly` **@typescript-eslint/no-use-before-define**: `"off"` = `'off'`

##### @typescript-eslint/no-useless-constructor

> `readonly` **@typescript-eslint/no-useless-constructor**: `"error"` = `'error'`

##### @typescript-eslint/no-useless-empty-export

> `readonly` **@typescript-eslint/no-useless-empty-export**: `"error"` = `'error'`

##### @typescript-eslint/no-var-requires

> `readonly` **@typescript-eslint/no-var-requires**: `0` = `0`

##### @typescript-eslint/no-wrapper-object-types

> `readonly` **@typescript-eslint/no-wrapper-object-types**: `"error"` = `'error'`

##### @typescript-eslint/non-nullable-type-assertion-style

> `readonly` **@typescript-eslint/non-nullable-type-assertion-style**: `"error"` = `'error'`

##### @typescript-eslint/only-throw-error

> `readonly` **@typescript-eslint/only-throw-error**: readonly \[`"error"`, \{ `allow`: readonly \[\]; `allowRethrowing`: `true`; `allowThrowingAny`: `false`; `allowThrowingUnknown`: `false`; \}\]

##### @typescript-eslint/parameter-properties

> `readonly` **@typescript-eslint/parameter-properties**: `1` \| `2`

##### @typescript-eslint/prefer-as-const

> `readonly` **@typescript-eslint/prefer-as-const**: `"error"` = `'error'`

##### @typescript-eslint/prefer-destructuring

> `readonly` **@typescript-eslint/prefer-destructuring**: `"off"` = `'off'`

##### @typescript-eslint/prefer-enum-initializers

> `readonly` **@typescript-eslint/prefer-enum-initializers**: `"error"` = `'error'`

##### @typescript-eslint/prefer-find

> `readonly` **@typescript-eslint/prefer-find**: `"error"` = `'error'`

##### @typescript-eslint/prefer-for-of

> `readonly` **@typescript-eslint/prefer-for-of**: `"error"` = `'error'`

##### @typescript-eslint/prefer-function-type

> `readonly` **@typescript-eslint/prefer-function-type**: `"error"` = `'error'`

##### @typescript-eslint/prefer-includes

> `readonly` **@typescript-eslint/prefer-includes**: `"error"` = `'error'`

##### @typescript-eslint/prefer-literal-enum-member

> `readonly` **@typescript-eslint/prefer-literal-enum-member**: `1` \| `2`

##### @typescript-eslint/prefer-namespace-keyword

> `readonly` **@typescript-eslint/prefer-namespace-keyword**: `"error"` = `'error'`

##### @typescript-eslint/prefer-nullish-coalescing

> `readonly` **@typescript-eslint/prefer-nullish-coalescing**: readonly \[`"error"`, \{ `allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing`: `false`; `ignoreBooleanCoercion`: `false`; `ignoreConditionalTests`: `false`; `ignoreIfStatements`: `false`; `ignoreMixedLogicalExpressions`: `false`; `ignorePrimitives`: \{ `bigint`: `false`; `boolean`: `false`; `number`: `false`; `string`: `false`; \}; `ignoreTernaryTests`: `false`; \}\]

##### @typescript-eslint/prefer-optional-chain

> `readonly` **@typescript-eslint/prefer-optional-chain**: readonly \[`"error"`, \{ `allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing`: `false`; `checkAny`: `true`; `checkBigInt`: `true`; `checkBoolean`: `true`; `checkNumber`: `true`; `checkString`: `true`; `checkUnknown`: `true`; `requireNullish`: `false`; \}\]

##### @typescript-eslint/prefer-promise-reject-errors

> `readonly` **@typescript-eslint/prefer-promise-reject-errors**: readonly \[`"error"`, \{ `allowEmptyReject`: `false`; \}\]

##### @typescript-eslint/prefer-readonly

> `readonly` **@typescript-eslint/prefer-readonly**: readonly \[`"error"`, \{ `onlyInlineLambdas`: `false`; \}\]

##### @typescript-eslint/prefer-readonly-parameter-types

> `readonly` **@typescript-eslint/prefer-readonly-parameter-types**: readonly \[`"error"`, \{ `allow`: readonly \[\{ `from`: `"lib"`; `name`: readonly \[`"RegExp"`, `"AnimationEvent"`, `"ClipboardEvent"`, `"CompositionEvent"`, `"DragEvent"`, `"Element"`, `"Event"`, `"FocusEvent"`, `"HTMLCanvasElement"`, `"HTMLDivElement"`, `"HTMLElement"`, `"HTMLImageElement"`, `"HTMLInputElement"`, `"HTMLSelectElement"`, `"HTMLTextAreaElement"`, `"KeyboardEvent"`, `"MouseEvent"`, `"PointerEvent"`, `"TouchEvent"`, `"TransitionEvent"`, `"UIEvent"`, `"WheelEvent"`\]; \}, \{ `from`: `"package"`; `name`: readonly \[`"FC"`, `"ReactNode"`\]; `package`: `"react"`; \}\]; `checkParameterProperties`: `true`; `ignoreInferredTypes`: `true`; `treatMethodsAsReadonly`: `true`; \}\]

##### @typescript-eslint/prefer-reduce-type-parameter

> `readonly` **@typescript-eslint/prefer-reduce-type-parameter**: `"error"` = `'error'`

##### @typescript-eslint/prefer-regexp-exec

> `readonly` **@typescript-eslint/prefer-regexp-exec**: `"error"` = `'error'`

##### @typescript-eslint/prefer-return-this-type

> `readonly` **@typescript-eslint/prefer-return-this-type**: `"error"` = `'error'`

##### @typescript-eslint/prefer-string-starts-ends-with

> `readonly` **@typescript-eslint/prefer-string-starts-ends-with**: readonly \[`"error"`, \{ `allowSingleElementEquality`: `"always"`; \}\]

##### @typescript-eslint/prefer-ts-expect-error

> `readonly` **@typescript-eslint/prefer-ts-expect-error**: `0` = `0`

##### @typescript-eslint/promise-function-async

> `readonly` **@typescript-eslint/promise-function-async**: `"off"` = `'off'`

##### @typescript-eslint/related-getter-setter-pairs

> `readonly` **@typescript-eslint/related-getter-setter-pairs**: `"error"` = `'error'`

##### @typescript-eslint/require-array-sort-compare

> `readonly` **@typescript-eslint/require-array-sort-compare**: readonly \[`"error"`, \{ `ignoreStringArrays`: `true`; \}\]

Prevent forgetting compare function when sorting numbers, as `sort`
defaults to string comparison.

##### @typescript-eslint/require-await

> `readonly` **@typescript-eslint/require-await**: `"error"` = `'error'`

##### @typescript-eslint/restrict-plus-operands

> `readonly` **@typescript-eslint/restrict-plus-operands**: readonly \[`"error"`, \{ `allowAny`: `false`; `allowBoolean`: `false`; `allowNullish`: `false`; `allowNumberAndString`: `false`; `allowRegExp`: `false`; `skipCompoundAssignments`: `false`; \}\]

Used to avoid ambiguity with `+` operator. restrict-plus-operands limits
usage to only bigint, number, string types, and prefer-template prohibits
using `+` for string concatenation. Fix: Use template literals or join
string arrays with `join("")`.

- A + b -> `${a}${b}`
- S_1 + s_2 + ... + s_n -> [s_1, ..., s_n].join("")

##### @typescript-eslint/restrict-template-expressions

> `readonly` **@typescript-eslint/restrict-template-expressions**: readonly \[`"error"`, \{ `allowAny`: `false`; `allowArray`: `false`; `allowBoolean`: `true`; `allowNever`: `false`; `allowNullish`: `true`; `allowNumber`: `true`; `allowRegExp`: `false`; \}\]

##### @typescript-eslint/return-await

> `readonly` **@typescript-eslint/return-await**: `1` \| `2`

##### @typescript-eslint/sort-type-constituents

> `readonly` **@typescript-eslint/sort-type-constituents**: `0` = `0`

##### @typescript-eslint/strict-boolean-expressions

> `readonly` **@typescript-eslint/strict-boolean-expressions**: readonly \[`"error"`, \{ `allowAny`: `false`; `allowNullableBoolean`: `false`; `allowNullableEnum`: `false`; `allowNullableNumber`: `false`; `allowNullableObject`: `false`; `allowNullableString`: `false`; `allowNumber`: `false`; `allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing`: `false`; `allowString`: `false`; \}\]

Used to avoid implicit casting to Boolean. Prevents overlooking that
numbers `0`, `NaN` and string `""` are treated as false in conditionals.

##### @typescript-eslint/switch-exhaustiveness-check

> `readonly` **@typescript-eslint/switch-exhaustiveness-check**: readonly \[`"error"`, \{ `allowDefaultCaseForExhaustiveSwitch`: `false`; `requireDefaultForNonUnion`: `true`; \}\]

Prevent missing switch cases (using type information)

##### @typescript-eslint/triple-slash-reference

> `readonly` **@typescript-eslint/triple-slash-reference**: readonly \[`"error"`, \{ `lib`: `"never"`; `path`: `"always"`; `types`: `"always"`; \}\]

##### @typescript-eslint/typedef

> `readonly` **@typescript-eslint/typedef**: `0` = `0`

##### @typescript-eslint/unbound-method

> `readonly` **@typescript-eslint/unbound-method**: `1` \| `2`

##### @typescript-eslint/unified-signatures

> `readonly` **@typescript-eslint/unified-signatures**: `1` \| `2`

##### @typescript-eslint/use-unknown-in-catch-callback-variable

> `readonly` **@typescript-eslint/use-unknown-in-catch-callback-variable**: `"error"` = `'error'`
