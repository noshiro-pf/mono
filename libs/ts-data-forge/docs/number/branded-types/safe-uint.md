[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/safe-uint

# number/branded-types/safe-uint

## Variables

### asSafeUint()

> `const` **asSafeUint**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/safe-uint.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/safe-uint.mts#L54)

Casts a number to a SafeUint type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a SafeUint type.

#### Throws

If the value is not a non-negative safe integer.

#### Example

```typescript
const x = asSafeUint(5); // SafeUint
const y = asSafeUint(0); // SafeUint
// asSafeUint(-1); // throws TypeError
// asSafeUint(1.5); // throws TypeError
```

---

### isSafeUint()

> `const` **isSafeUint**: (`a`) => `a is SafeUint` = `is`

Defined in: [src/number/branded-types/safe-uint.mts:39](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/safe-uint.mts#L39)

Checks if a number is a SafeUint.

#### Parameters

##### a

`number`

#### Returns

`a is SafeUint`

`true` if the value is a SafeUint, `false` otherwise.

---

### SafeUint

> `const` **SafeUint**: `object`

Defined in: [src/number/branded-types/safe-uint.mts:83](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/safe-uint.mts#L83)

Namespace providing type-safe arithmetic operations for safe unsigned integers.

All operations automatically clamp results to the safe unsigned integer range [0, MAX_SAFE_INTEGER].
This ensures that all arithmetic maintains both the non-negative constraint and IEEE 754 precision guarantees,
preventing precision loss while ensuring results are never negative.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `SafeUint`

Adds two SafeUint values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeUint`

`a + b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### clamp()

> **clamp**: (`x`) => `SafeUint`

Clamps a number to the safe unsigned integer range.

###### Parameters

###### x

`number`

###### Returns

`SafeUint`

The value clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### div()

> **div**: (`x`, `y`) => `SafeUint`

Divides one SafeUint by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`SafeUint`\>

###### Returns

`SafeUint`

`⌊a / b⌋` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### is()

> **is**: (`a`) => `a is SafeUint`

Type guard to check if a value is a SafeUint.

###### Parameters

###### a

`number`

###### Returns

`a is SafeUint`

`true` if the value is a non-negative safe integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `SafeUint` = `max_`

Returns the larger of two SafeUint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`SafeUint`, `40`\>[]

###### Returns

`SafeUint`

The maximum value as a SafeUint.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `SafeUint`

The maximum safe integer value (2^53 - 1).

##### min()

> `readonly` **min**: (...`values`) => `SafeUint` = `min_`

Returns the smaller of two SafeUint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`SafeUint`, `40`\>[]

###### Returns

`SafeUint`

The minimum value as a SafeUint.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a safe unsigned integer.

##### mul()

> **mul**: (`x`, `y`) => `SafeUint`

Multiplies two SafeUint values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeUint`

`a * b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### pow()

> **pow**: (`x`, `y`) => `SafeUint`

Raises a SafeUint to the power of another SafeUint.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeUint`

`a ** b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### random()

> **random**: (`min?`, `max?`) => `SafeUint`

Generates a random SafeUint value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`SafeUint`, `40`\>

###### max?

`WithSmallInt`\<`SafeUint`, `40`\>

###### Returns

`SafeUint`

A random SafeUint between 0 and MAX_SAFE_INTEGER.

##### sub()

> **sub**: (`x`, `y`) => `SafeUint`

Subtracts one SafeUint from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeUint`

`a - b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint (minimum 0).

#### Example

```typescript
const a = asSafeUint(9007199254740000); // Near MAX_SAFE_INTEGER
const b = asSafeUint(1000);

// Arithmetic operations with safe unsigned range clamping
const sum = SafeUint.add(a, b); // SafeUint (clamped to MAX_SAFE_INTEGER)
const diff = SafeUint.sub(b, a); // SafeUint (0 - clamped to MIN_VALUE)
const product = SafeUint.mul(a, b); // SafeUint (clamped to MAX_SAFE_INTEGER)

// Range operations
const clamped = SafeUint.clamp(-100); // SafeUint (0)
const minimum = SafeUint.min(a, b); // SafeUint (1000)
const maximum = SafeUint.max(a, b); // SafeUint (a)

// Utility operations
const random = SafeUint.random(); // SafeUint (random safe unsigned integer)
const power = SafeUint.pow(asSafeUint(2), asSafeUint(20)); // SafeUint (1048576)
```
