[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/positive-uint16

# number/branded-types/positive-uint16

## Variables

### asPositiveUint16()

> `const` **asPositiveUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/positive-uint16.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-uint16.mts#L54)

Casts a number to a PositiveUint16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveUint16 type.

#### Throws

If the value is not a positive integer in [1, 2^16).

#### Example

```typescript
const x = asPositiveUint16(1000); // PositiveUint16
const y = asPositiveUint16(65535); // PositiveUint16
// asPositiveUint16(0); // throws TypeError
// asPositiveUint16(-1); // throws TypeError
// asPositiveUint16(65536); // throws TypeError
```

---

### isPositiveUint16()

> `const` **isPositiveUint16**: (`a`) => `a is PositiveUint16` = `is`

Defined in: [src/number/branded-types/positive-uint16.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-uint16.mts#L38)

Checks if a number is a PositiveUint16 (16-bit positive unsigned integer in the range [1, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint16`

`true` if the value is a PositiveUint16, `false` otherwise.

---

### PositiveUint16

> `const` **PositiveUint16**: `object`

Defined in: [src/number/branded-types/positive-uint16.mts:84](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-uint16.mts#L84)

Namespace providing type-safe arithmetic operations for 16-bit positive unsigned integers.

All operations automatically clamp results to the valid PositiveUint16 range [1, 65535].
This ensures that all arithmetic maintains the 16-bit positive unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `PositiveUint16`

Adds two PositiveUint16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a + b` clamped to [1, 65535] as a PositiveUint16.

##### clamp()

> **clamp**: (`x`) => `PositiveUint16`

Clamps a number to the PositiveUint16 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint16`

The value clamped to [1, 65535] as a PositiveUint16.

##### div()

> **div**: (`x`, `y`) => `PositiveUint16`

Divides one PositiveUint16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveUint16`\>

###### Returns

`PositiveUint16`

`⌊a / b⌋` clamped to [1, 65535] as a PositiveUint16.

##### is()

> **is**: (`a`) => `a is PositiveUint16`

Type guard to check if a value is a PositiveUint16.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint16`

`true` if the value is a 16-bit positive unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint16` = `max_`

Returns the larger of two PositiveUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The maximum value as a PositiveUint16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit positive unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint16` = `min_`

Returns the smaller of two PositiveUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The minimum value as a PositiveUint16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 16-bit positive unsigned integer.

##### mul()

> **mul**: (`x`, `y`) => `PositiveUint16`

Multiplies two PositiveUint16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a * b` clamped to [1, 65535] as a PositiveUint16.

##### pow()

> **pow**: (`x`, `y`) => `PositiveUint16`

Raises a PositiveUint16 to the power of another PositiveUint16.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a ** b` clamped to [1, 65535] as a PositiveUint16.

##### random()

> **random**: (`min?`, `max?`) => `PositiveUint16`

Generates a random PositiveUint16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### max?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

A random PositiveUint16 between 1 and 65535.

##### sub()

> **sub**: (`x`, `y`) => `PositiveUint16`

Subtracts one PositiveUint16 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a - b` clamped to [1, 65535] as a PositiveUint16 (minimum 1).

#### Example

```typescript
const a = asPositiveUint16(60000);
const b = asPositiveUint16(10000);

// Arithmetic operations with automatic clamping and positive constraint
const sum = PositiveUint16.add(a, b); // PositiveUint16 (65535 - clamped to MAX_VALUE)
const diff = PositiveUint16.sub(a, b); // PositiveUint16 (50000)
const reverseDiff = PositiveUint16.sub(b, a); // PositiveUint16 (1 - clamped to MIN_VALUE)
const product = PositiveUint16.mul(a, b); // PositiveUint16 (65535 - clamped due to overflow)

// Range operations (maintaining positive constraint)
const clamped = PositiveUint16.clamp(-100); // PositiveUint16 (1)
const minimum = PositiveUint16.min(a, b); // PositiveUint16 (10000)
const maximum = PositiveUint16.max(a, b); // PositiveUint16 (60000)

// Utility operations
const random = PositiveUint16.random(); // PositiveUint16 (random value in [1, 65535])
const power = PositiveUint16.pow(asPositiveUint16(2), asPositiveUint16(10)); // PositiveUint16 (1024)
```
