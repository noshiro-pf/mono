[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/non-zero-uint32

# number/branded-types/non-zero-uint32

## Variables

### asNonZeroUint32()

> `const` **asNonZeroUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-zero-uint32.mts:55](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-uint32.mts#L55)

Casts a number to a NonZeroUint32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroUint32 type.

#### Throws

If the value is not a non-zero integer in [1, 2^32).

#### Example

```typescript
const x = asNonZeroUint32(1000); // NonZeroUint32
const y = asNonZeroUint32(4294967295); // NonZeroUint32
// asNonZeroUint32(0); // throws TypeError
// asNonZeroUint32(-1); // throws TypeError
// asNonZeroUint32(4294967296); // throws TypeError
```

---

### isNonZeroUint32()

> `const` **isNonZeroUint32**: (`a`) => `a is PositiveUint32` = `is`

Defined in: [src/number/branded-types/non-zero-uint32.mts:39](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-uint32.mts#L39)

Checks if a number is a NonZeroUint32 (32-bit non-zero unsigned integer in the range [1, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint32`

`true` if the value is a NonZeroUint32, `false` otherwise.

---

### NonZeroUint32

> `const` **NonZeroUint32**: `object`

Defined in: [src/number/branded-types/non-zero-uint32.mts:85](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-uint32.mts#L85)

Namespace providing type-safe arithmetic operations for 32-bit non-zero unsigned integers.

All operations automatically clamp results to the valid NonZeroUint32 range [1, 4294967295].
This ensures that all arithmetic maintains the 32-bit non-zero unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `PositiveUint32`

Adds two NonZeroUint32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a + b` clamped to [1, 4294967295] as a NonZeroUint32.

##### clamp()

> **clamp**: (`x`) => `PositiveUint32`

Clamps a number to the NonZeroUint32 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint32`

The value clamped to [1, 4294967295] as a NonZeroUint32.

##### div()

> **div**: (`x`, `y`) => `PositiveUint32`

Divides one NonZeroUint32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveUint32`\>

###### Returns

`PositiveUint32`

`⌊a / b⌋` clamped to [1, 4294967295] as a NonZeroUint32.

##### is()

> **is**: (`a`) => `a is PositiveUint32`

Type guard to check if a value is a NonZeroUint32.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint32`

`true` if the value is a 32-bit non-zero unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint32` = `max_`

Returns the larger of two NonZeroUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The maximum value as a NonZeroUint32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit non-zero unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint32` = `min_`

Returns the smaller of two NonZeroUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The minimum value as a NonZeroUint32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 32-bit non-zero unsigned integer.

##### mul()

> **mul**: (`x`, `y`) => `PositiveUint32`

Multiplies two NonZeroUint32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a * b` clamped to [1, 4294967295] as a NonZeroUint32.

##### pow()

> **pow**: (`x`, `y`) => `PositiveUint32`

Raises a NonZeroUint32 to the power of another NonZeroUint32.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a ** b` clamped to [1, 4294967295] as a NonZeroUint32.

##### random()

> **random**: (`min`, `max`) => `PositiveUint32`

Generates a random NonZeroUint32 value within the valid range.

###### Parameters

###### min

`WithSmallInt`

###### max

`WithSmallInt`

###### Returns

`PositiveUint32`

A random NonZeroUint32 between 1 and 4294967295.

##### sub()

> **sub**: (`x`, `y`) => `PositiveUint32`

Subtracts one NonZeroUint32 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveUint32`

`a - b` clamped to [1, 4294967295] as a NonZeroUint32 (minimum 1).

#### Example

```typescript
const a = asNonZeroUint32(4000000000);
const b = asNonZeroUint32(1000000000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroUint32.add(a, b); // NonZeroUint32 (4294967295 - clamped to MAX_VALUE)
const diff = NonZeroUint32.sub(a, b); // NonZeroUint32 (3000000000)
const reverseDiff = NonZeroUint32.sub(b, a); // NonZeroUint32 (1 - clamped to MIN_VALUE)
const product = NonZeroUint32.mul(a, b); // NonZeroUint32 (4294967295 - clamped due to overflow)

// Range operations (maintaining non-zero constraint)
const clamped = NonZeroUint32.clamp(-100); // NonZeroUint32 (1)
const minimum = NonZeroUint32.min(a, b); // NonZeroUint32 (1000000000)
const maximum = NonZeroUint32.max(a, b); // NonZeroUint32 (4000000000)

// Utility operations
const random = NonZeroUint32.random(); // NonZeroUint32 (random value in [1, 4294967295])
const power = NonZeroUint32.pow(asNonZeroUint32(2), asNonZeroUint32(20)); // NonZeroUint32 (1048576)
```
