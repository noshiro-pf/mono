[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/positive-uint32

# number/branded-types/positive-uint32

## Variables

### asPositiveUint32()

> `const` **asPositiveUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/positive-uint32.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-uint32.mts#L54)

Casts a number to a PositiveUint32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveUint32 type.

#### Throws

If the value is not a positive integer in [1, 2^32).

#### Example

```typescript
const x = asPositiveUint32(1000); // PositiveUint32
const y = asPositiveUint32(4294967295); // PositiveUint32
// asPositiveUint32(0); // throws TypeError
// asPositiveUint32(-1); // throws TypeError
// asPositiveUint32(4294967296); // throws TypeError
```

---

### isPositiveUint32()

> `const` **isPositiveUint32**: (`a`) => `a is PositiveUint32` = `is`

Defined in: [src/number/branded-types/positive-uint32.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-uint32.mts#L38)

Checks if a number is a PositiveUint32 (32-bit positive unsigned integer in the range [1, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint32`

`true` if the value is a PositiveUint32, `false` otherwise.

---

### PositiveUint32

> `const` **PositiveUint32**: `object`

Defined in: [src/number/branded-types/positive-uint32.mts:84](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-uint32.mts#L84)

Namespace providing type-safe arithmetic operations for 32-bit positive unsigned integers.

All operations automatically clamp results to the valid PositiveUint32 range [1, 4294967295].
This ensures that all arithmetic maintains the 32-bit positive unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `PositiveUint32`

Adds two PositiveUint32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a + b` clamped to [1, 4294967295] as a PositiveUint32.

##### clamp()

> **clamp**: (`x`) => `PositiveUint32`

Clamps a number to the PositiveUint32 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint32`

The value clamped to [1, 4294967295] as a PositiveUint32.

##### div()

> **div**: (`x`, `y`) => `PositiveUint32`

Divides one PositiveUint32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveUint32`\>

###### Returns

`PositiveUint32`

`⌊a / b⌋` clamped to [1, 4294967295] as a PositiveUint32.

##### is()

> **is**: (`a`) => `a is PositiveUint32`

Type guard to check if a value is a PositiveUint32.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint32`

`true` if the value is a 32-bit positive unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint32` = `max_`

Returns the larger of two PositiveUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The maximum value as a PositiveUint32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit positive unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint32` = `min_`

Returns the smaller of two PositiveUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The minimum value as a PositiveUint32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 32-bit positive unsigned integer.

##### mul()

> **mul**: (`x`, `y`) => `PositiveUint32`

Multiplies two PositiveUint32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a * b` clamped to [1, 4294967295] as a PositiveUint32.

##### pow()

> **pow**: (`x`, `y`) => `PositiveUint32`

Raises a PositiveUint32 to the power of another PositiveUint32.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a ** b` clamped to [1, 4294967295] as a PositiveUint32.

##### random()

> **random**: (`min?`, `max?`) => `PositiveUint32`

Generates a random PositiveUint32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### max?

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

A random PositiveUint32 between 1 and 4294967295.

##### sub()

> **sub**: (`x`, `y`) => `PositiveUint32`

Subtracts one PositiveUint32 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a - b` clamped to [1, 4294967295] as a PositiveUint32 (minimum 1).

#### Example

```typescript
const a = asPositiveUint32(4000000000);
const b = asPositiveUint32(1000000000);

// Arithmetic operations with automatic clamping and positive constraint
const sum = PositiveUint32.add(a, b); // PositiveUint32 (4294967295 - clamped to MAX_VALUE)
const diff = PositiveUint32.sub(a, b); // PositiveUint32 (3000000000)
const reverseDiff = PositiveUint32.sub(b, a); // PositiveUint32 (1 - clamped to MIN_VALUE)
const product = PositiveUint32.mul(a, b); // PositiveUint32 (4294967295 - clamped due to overflow)

// Range operations (maintaining positive constraint)
const clamped = PositiveUint32.clamp(-100); // PositiveUint32 (1)
const minimum = PositiveUint32.min(a, b); // PositiveUint32 (1000000000)
const maximum = PositiveUint32.max(a, b); // PositiveUint32 (4000000000)

// Utility operations
const random = PositiveUint32.random(); // PositiveUint32 (random value in [1, 4294967295])
const power = PositiveUint32.pow(asPositiveUint32(2), asPositiveUint32(20)); // PositiveUint32 (1048576)
```
