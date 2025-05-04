[**Documentation**](../README.md)

---

[Documentation](../README.md) / constants/alphabet

# constants/alphabet

## Type Aliases

### Alphabet

> **Alphabet** = [`LowerAlphabet`](#loweralphabet) \| [`UpperAlphabet`](#upperalphabet)

Defined in: [constants/alphabet.d.mts:24](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/alphabet.d.mts#L24)

Represents the set of both lowercase and uppercase English alphabet letters.
A union of `LowerAlphabet` and `UpperAlphabet`.

---

### LowerAlphabet

> **LowerAlphabet** = `"a"` \| `"b"` \| `"c"` \| `"d"` \| `"e"` \| `"f"` \| `"g"` \| `"h"` \| `"i"` \| `"j"` \| `"k"` \| `"l"` \| `"m"` \| `"n"` \| `"o"` \| `"p"` \| `"q"` \| `"r"` \| `"s"` \| `"t"` \| `"u"` \| `"v"` \| `"w"` \| `"x"` \| `"y"` \| `"z"`

Defined in: [constants/alphabet.d.mts:6](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/alphabet.d.mts#L6)

Represents the set of lowercase English alphabet letters.
A union of string literals from `'a'` to `'z'`.

---

### UpperAlphabet

> **UpperAlphabet** = `Uppercase`\<[`LowerAlphabet`](#loweralphabet)\>

Defined in: [constants/alphabet.d.mts:18](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/alphabet.d.mts#L18)

Represents the set of uppercase English alphabet letters.
A union of string literals from `'A'` to `'Z'`.
Derived by applying `Uppercase` to `LowerAlphabet`.
