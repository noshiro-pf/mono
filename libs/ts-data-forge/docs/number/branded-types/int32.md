[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/int32

# number/branded-types/int32

## Variables

### asInt32()

> `const` **asInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/int32.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int32.mts#L54)

Casts a number to an Int32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int32 type.

#### Throws

If the value is not an integer in [-2^31, 2^31).

#### Example

```typescript
const x = asInt32(100000); // Int32
const y = asInt32(-500000); // Int32
// asInt32(3000000000); // throws TypeError
// asInt32(1.5); // throws TypeError
```

---

### Int32

> `const` **Int32**: `object`

Defined in: [src/number/branded-types/int32.mts:82](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int32.mts#L82)

Namespace providing type-safe arithmetic operations for 32-bit signed integers.

All operations automatically clamp results to the valid Int32 range [-2147483648, 2147483647].
This ensures that all arithmetic maintains the 32-bit signed integer constraint, preventing overflow.

#### Type Declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`Int32`\>

Returns the absolute value of a 32-bit signed integer.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`Int32`\>

The absolute value as an Int32, clamped to valid range.

##### add()

> **add**: (`x`, `y`) => `Int32`

Adds two Int32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int32`

`a + b` clamped to [-2147483648, 2147483647] as an Int32.

##### clamp()

> **clamp**: (`x`) => `Int32`

Clamps a number to the Int32 range.

###### Parameters

###### x

`number`

###### Returns

`Int32`

The value clamped to [-2147483648, 2147483647] as an Int32.

##### div()

> **div**: (`x`, `y`) => `Int32`

Divides one Int32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`Int32`\>

###### Returns

`Int32`

`⌊a / b⌋` clamped to [-2147483648, 2147483647] as an Int32.

##### is()

> **is**: (`a`) => `a is Int32`

Type guard to check if a value is an Int32.

###### Parameters

###### a

`number`

###### Returns

`a is Int32`

`true` if the value is a 32-bit signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Int32` = `max_`

Returns the larger of two Int32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int32`, `40`\>[]

###### Returns

`Int32`

The maximum value as an Int32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit signed integer.

##### min()

> `readonly` **min**: (...`values`) => `Int32` = `min_`

Returns the smaller of two Int32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int32`, `40`\>[]

###### Returns

`Int32`

The minimum value as an Int32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 32-bit signed integer.

##### mul()

> **mul**: (`x`, `y`) => `Int32`

Multiplies two Int32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int32`

`a * b` clamped to [-2147483648, 2147483647] as an Int32.

##### pow()

> **pow**: (`x`, `y`) => `Int32`

Raises an Int32 to the power of another Int32.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int32`

`a ** b` clamped to [-2147483648, 2147483647] as an Int32.

##### random()

> **random**: (`min?`, `max?`) => `Int32`

Generates a random Int32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`Int32`, `40`\>

###### max?

`WithSmallInt`\<`Int32`, `40`\>

###### Returns

`Int32`

A random Int32 between MIN_VALUE and MAX_VALUE.

##### sub()

> **sub**: (`x`, `y`) => `Int32`

Subtracts one Int32 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int32`

`a - b` clamped to [-2147483648, 2147483647] as an Int32.

#### Example

```typescript
const a = asInt32(2000000000);
const b = asInt32(500000000);

// Arithmetic operations with automatic clamping
const sum = Int32.add(a, b); // Int32 (2147483647 - clamped to MAX_VALUE)
const diff = Int32.sub(a, b); // Int32 (1500000000)
const product = Int32.mul(a, b); // Int32 (2147483647 - clamped due to overflow)

// Range operations
const clamped = Int32.clamp(5000000000); // Int32 (2147483647)
const minimum = Int32.min(a, b); // Int32 (500000000)
const maximum = Int32.max(a, b); // Int32 (2000000000)

// Utility operations
const absolute = Int32.abs(asInt32(-1000)); // Int32 (1000)
const random = Int32.random(); // Int32 (random value in valid range)
```

---

### isInt32()

> `const` **isInt32**: (`a`) => `a is Int32` = `is`

Defined in: [src/number/branded-types/int32.mts:39](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int32.mts#L39)

Checks if a number is an Int32 (32-bit signed integer in the range [-2^31, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is Int32`

`true` if the value is an Int32, `false` otherwise.
