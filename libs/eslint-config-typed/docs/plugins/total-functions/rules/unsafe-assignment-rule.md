[**eslint-config-typed**](../../../README.md)

---

[eslint-config-typed](../../../README.md) / plugins/total-functions/rules/unsafe-assignment-rule

# plugins/total-functions/rules/unsafe-assignment-rule

## Type Aliases

### MessageId

> **MessageId** = `"errorStringGeneric"`

Defined in: [src/plugins/total-functions/rules/unsafe-assignment-rule.mts:10](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/unsafe-assignment-rule.mts#L10)

## Functions

### createNoUnsafeAssignmentRule()

> **createNoUnsafeAssignmentRule**(`isUnsafeAssignment`): (`context`) => `RuleListener`

Defined in: [src/plugins/total-functions/rules/unsafe-assignment-rule.mts:13](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/plugins/total-functions/rules/unsafe-assignment-rule.mts#L13)

#### Parameters

##### isUnsafeAssignment

(`checker`, `destinationType`, `sourceType`, `sourceNode`) => `"safe"` \| `"unsafe"`

#### Returns

> (`context`): `RuleListener`

##### Parameters

###### context

`Readonly`\<`TSESLint.RuleContext`\<[`MessageId`](#messageid), readonly `unknown`[]\>\>

##### Returns

`RuleListener`
