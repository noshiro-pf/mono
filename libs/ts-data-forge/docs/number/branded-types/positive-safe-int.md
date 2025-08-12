[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/positive-safe-int

# number/branded-types/positive-safe-int

## Variables

### asPositiveSafeInt()

> `const` **asPositiveSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/positive-safe-int.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-safe-int.mts#L54)

Casts a number to a PositiveSafeInt type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveSafeInt type.

#### Throws

If the value is not a positive safe integer.

#### Example

```typescript
const x = asPositiveSafeInt(5); // PositiveSafeInt
const y = asPositiveSafeInt(1000); // PositiveSafeInt
// asPositiveSafeInt(0); // throws TypeError
// asPositiveSafeInt(-1); // throws TypeError
```

---

### isPositiveSafeInt()

> `const` **isPositiveSafeInt**: (`a`) => `a is PositiveSafeInt` = `is`

Defined in: [src/number/branded-types/positive-safe-int.mts:39](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-safe-int.mts#L39)

Checks if a number is a PositiveSafeInt (a positive safe integer in the range [1, MAX_SAFE_INTEGER]).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveSafeInt`

`true` if the value is a PositiveSafeInt, `false` otherwise.

---

### PositiveSafeInt

> `const` **PositiveSafeInt**: `object`

Defined in: [src/number/branded-types/positive-safe-int.mts:83](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-safe-int.mts#L83)

Namespace providing type-safe arithmetic operations for positive safe integers.

All operations automatically clamp results to the positive safe integer range [1, MAX_SAFE_INTEGER].
This ensures that all arithmetic maintains both the positive constraint and IEEE 754 precision guarantees,
preventing precision loss and ensuring results are always positive.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `PositiveSafeInt`

Adds two PositiveSafeInt values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveSafeInt`

`a + b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### clamp()

> **clamp**: (`x`) => `PositiveSafeInt`

Clamps a number to the positive safe integer range.

###### Parameters

###### x

`number`

###### Returns

`PositiveSafeInt`

The value clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### div()

> **div**: (`x`, `y`) => `PositiveSafeInt`

Divides one PositiveSafeInt by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveSafeInt`\>

###### Returns

`PositiveSafeInt`

`⌊a / b⌋` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### is()

> **is**: (`a`) => `a is PositiveSafeInt`

Type guard to check if a value is a PositiveSafeInt.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveSafeInt`

`true` if the value is a positive safe integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveSafeInt` = `max_`

Returns the larger of two PositiveSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveSafeInt`, `40`\>[]

###### Returns

`PositiveSafeInt`

The maximum value as a PositiveSafeInt.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `SafeUint`

The maximum safe integer value (2^53 - 1).

##### min()

> `readonly` **min**: (...`values`) => `PositiveSafeInt` = `min_`

Returns the smaller of two PositiveSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveSafeInt`, `40`\>[]

###### Returns

`PositiveSafeInt`

The minimum value as a PositiveSafeInt.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a positive safe integer.

##### mul()

> **mul**: (`x`, `y`) => `PositiveSafeInt`

Multiplies two PositiveSafeInt values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveSafeInt`

`a * b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### pow()

> **pow**: (`x`, `y`) => `PositiveSafeInt`

Raises a PositiveSafeInt to the power of another PositiveSafeInt.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveSafeInt`

`a ** b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### random()

> **random**: (`min?`, `max?`) => `PositiveSafeInt`

Generates a random PositiveSafeInt value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### max?

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### Returns

`PositiveSafeInt`

A random PositiveSafeInt between 1 and MAX_SAFE_INTEGER.

##### sub()

> **sub**: (`x`, `y`) => `PositiveSafeInt`

Subtracts one PositiveSafeInt from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveSafeInt`

`a - b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt (minimum 1).

#### Example

```typescript
const a = asPositiveSafeInt(1000000);
const b = asPositiveSafeInt(2000000);

// Arithmetic operations with positive safe range clamping
const sum = PositiveSafeInt.add(a, b); // PositiveSafeInt (3000000)
const diff = PositiveSafeInt.sub(a, b); // PositiveSafeInt (1 - clamped to MIN_VALUE)
const product = PositiveSafeInt.mul(a, b); // PositiveSafeInt (2000000000000)

// Range operations
const clamped = PositiveSafeInt.clamp(0); // PositiveSafeInt (1)
const minimum = PositiveSafeInt.min(a, b); // PositiveSafeInt (1000000)
const maximum = PositiveSafeInt.max(a, b); // PositiveSafeInt (2000000)

// Utility operations
const random = PositiveSafeInt.random(); // PositiveSafeInt (random positive safe integer)
const power = PositiveSafeInt.pow(asPositiveSafeInt(2), asPositiveSafeInt(10)); // PositiveSafeInt (1024)
```
