[**Documentation**](../README.md)

---

[Documentation](../README.md) / constants/falsy-value

# constants/falsy-value

## Type Aliases

### FalsyValue

> **FalsyValue** = `0` \| `""` \| `0` \| `0n` \| `false` \| `null` \| `undefined`

Defined in: [constants/falsy-value.d.mts:7](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/falsy-value.d.mts#L7)

Represents the set of JavaScript values considered "falsy".
Includes `false`, `0`, `''` (empty string), `null`, and `undefined`.
Note: `NaN` is also falsy at runtime but cannot be represented as a literal type here.
