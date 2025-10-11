[**eslint-config-typed**](../README.md)

---

[eslint-config-typed](../README.md) / types/rule-severity-with-default-option

# types/rule-severity-with-default-option

## Functions

### withDefaultOption()

> **withDefaultOption**(`severity`): `1` \| `2`

Defined in: [src/types/rule-severity-with-default-option.mts:6](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/types/rule-severity-with-default-option.mts#L6)

A simple wrapper function to make the existence of an option setting explicit
in the config statement. This function casts `Linter.RuleSeverity` type value
to `Linter.Severity` type.

#### Parameters

##### severity

`"warn"` | `"error"`

#### Returns

`1` \| `2`
