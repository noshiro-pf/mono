[**eslint-config-typed**](../../../README.md)

---

[eslint-config-typed](../../../README.md) / plugins/total-functions/rules/unsafe-assignment-rule

# plugins/total-functions/rules/unsafe-assignment-rule

## Type Aliases

### MessageId

> **MessageId** = `"errorStringGeneric"`

Defined in: [src/plugins/total-functions/rules/unsafe-assignment-rule.mts:15](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/unsafe-assignment-rule.mts#L15)

## Functions

### createNoUnsafeAssignmentRule()

> **createNoUnsafeAssignmentRule**(`isUnsafeAssignment`): (`context`) => `RuleListener`

Defined in: [src/plugins/total-functions/rules/unsafe-assignment-rule.mts:40](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/unsafe-assignment-rule.mts#L40)

#### Parameters

##### isUnsafeAssignment

(`program`, `checker`, `destinationType`, `sourceType`, `sourceNode`) => `"safe"` \| `"unsafe"`

#### Returns

> (`context`): `RuleListener`

##### Parameters

###### context

`Readonly`\<`TSESLint.RuleContext`\<[`MessageId`](#messageid), readonly `unknown`[]\>\>

##### Returns

`RuleListener`

---

### getSafeTypeImmutability()

> **getSafeTypeImmutability**(`program`, `_checker`, `target`, `overrides?`): `Immutability`

Defined in: [src/plugins/total-functions/rules/unsafe-assignment-rule.mts:17](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/unsafe-assignment-rule.mts#L17)

#### Parameters

##### program

`Program`

##### \_checker

`TypeChecker`

##### target

`Type`

##### overrides?

`ImmutabilityOverrides`

#### Returns

`Immutability`
