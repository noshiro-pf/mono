[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/non-zero-uint16

# number/branded-types/non-zero-uint16

## Variables

### asNonZeroUint16()

> `const` **asNonZeroUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-zero-uint16.mts:55](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-uint16.mts#L55)

Casts a number to a NonZeroUint16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroUint16 type.

#### Throws

If the value is not a non-zero integer in [1, 2^16).

#### Example

```typescript
const x = asNonZeroUint16(1000); // NonZeroUint16
const y = asNonZeroUint16(65535); // NonZeroUint16
// asNonZeroUint16(0); // throws TypeError
// asNonZeroUint16(-1); // throws TypeError
// asNonZeroUint16(65536); // throws TypeError
```

---

### isNonZeroUint16()

> `const` **isNonZeroUint16**: (`a`) => `a is PositiveUint16` = `is`

Defined in: [src/number/branded-types/non-zero-uint16.mts:39](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-uint16.mts#L39)

Checks if a number is a NonZeroUint16 (16-bit non-zero unsigned integer in the range [1, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint16`

`true` if the value is a NonZeroUint16, `false` otherwise.

---

### NonZeroUint16

> `const` **NonZeroUint16**: `object`

Defined in: [src/number/branded-types/non-zero-uint16.mts:85](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-uint16.mts#L85)

Namespace providing type-safe arithmetic operations for 16-bit non-zero unsigned integers.

All operations automatically clamp results to the valid NonZeroUint16 range [1, 65535].
This ensures that all arithmetic maintains the 16-bit non-zero unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `PositiveUint16`

Adds two NonZeroUint16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a + b` clamped to [1, 65535] as a NonZeroUint16.

##### clamp()

> **clamp**: (`x`) => `PositiveUint16`

Clamps a number to the NonZeroUint16 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint16`

The value clamped to [1, 65535] as a NonZeroUint16.

##### div()

> **div**: (`x`, `y`) => `PositiveUint16`

Divides one NonZeroUint16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveUint16`\>

###### Returns

`PositiveUint16`

`⌊a / b⌋` clamped to [1, 65535] as a NonZeroUint16.

##### is()

> **is**: (`a`) => `a is PositiveUint16`

Type guard to check if a value is a NonZeroUint16.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint16`

`true` if the value is a 16-bit non-zero unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint16` = `max_`

Returns the larger of two NonZeroUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The maximum value as a NonZeroUint16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit non-zero unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint16` = `min_`

Returns the smaller of two NonZeroUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The minimum value as a NonZeroUint16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 16-bit non-zero unsigned integer.

##### mul()

> **mul**: (`x`, `y`) => `PositiveUint16`

Multiplies two NonZeroUint16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a * b` clamped to [1, 65535] as a NonZeroUint16.

##### pow()

> **pow**: (`x`, `y`) => `PositiveUint16`

Raises a NonZeroUint16 to the power of another NonZeroUint16.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a ** b` clamped to [1, 65535] as a NonZeroUint16.

##### random()

> **random**: (`min?`, `max?`) => `PositiveUint16`

Generates a random NonZeroUint16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### max?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

A random NonZeroUint16 between 1 and 65535.

##### sub()

> **sub**: (`x`, `y`) => `PositiveUint16`

Subtracts one NonZeroUint16 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint16`

`a - b` clamped to [1, 65535] as a NonZeroUint16 (minimum 1).

#### Example

```typescript
const a = asNonZeroUint16(60000);
const b = asNonZeroUint16(10000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroUint16.add(a, b); // NonZeroUint16 (65535 - clamped to MAX_VALUE)
const diff = NonZeroUint16.sub(a, b); // NonZeroUint16 (50000)
const reverseDiff = NonZeroUint16.sub(b, a); // NonZeroUint16 (1 - clamped to MIN_VALUE)
const product = NonZeroUint16.mul(a, b); // NonZeroUint16 (65535 - clamped due to overflow)

// Range operations (maintaining non-zero constraint)
const clamped = NonZeroUint16.clamp(-100); // NonZeroUint16 (1)
const minimum = NonZeroUint16.min(a, b); // NonZeroUint16 (10000)
const maximum = NonZeroUint16.max(a, b); // NonZeroUint16 (60000)

// Utility operations
const random = NonZeroUint16.random(); // NonZeroUint16 (random value in [1, 65535])
const power = NonZeroUint16.pow(asNonZeroUint16(2), asNonZeroUint16(10)); // NonZeroUint16 (1024)
```
