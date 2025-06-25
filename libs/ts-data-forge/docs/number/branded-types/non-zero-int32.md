[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/non-zero-int32

# number/branded-types/non-zero-int32

## Variables

### asNonZeroInt32()

> `const` **asNonZeroInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-zero-int32.mts:55](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int32.mts#L55)

Casts a number to a NonZeroInt32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt32 type.

#### Throws

If the value is not a non-zero integer in [-2^31, 2^31).

#### Example

```typescript
const x = asNonZeroInt32(1000); // NonZeroInt32
const y = asNonZeroInt32(-1000); // NonZeroInt32
// asNonZeroInt32(0); // throws TypeError
// asNonZeroInt32(2147483648); // throws TypeError
```

---

### isNonZeroInt32()

> `const` **isNonZeroInt32**: (`a`) => `a is NonZeroInt32` = `is`

Defined in: [src/number/branded-types/non-zero-int32.mts:40](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int32.mts#L40)

Checks if a number is a NonZeroInt32 (32-bit non-zero signed integer in the range [-2^31, 2^31) excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt32`

`true` if the value is a NonZeroInt32, `false` otherwise.

---

### NonZeroInt32

> `const` **NonZeroInt32**: `object`

Defined in: [src/number/branded-types/non-zero-int32.mts:85](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int32.mts#L85)

Namespace providing type-safe arithmetic operations for 32-bit non-zero signed integers.

All operations automatically clamp results to the valid NonZeroInt32 range [-2147483648, 2147483647]
excluding 0. This ensures that all arithmetic maintains the 32-bit non-zero signed integer
constraint, preventing zero results and overflow.

#### Type declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`NonZeroInt32`\>

Returns the absolute value of a 32-bit non-zero signed integer.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`NonZeroInt32`\>

The absolute value as a NonZeroInt32, clamped to valid range.

##### add()

> **add**: (`x`, `y`) => `NonZeroInt32`

Adds two NonZeroInt32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt32`

`a + b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### clamp()

> **clamp**: (`x`) => `NonZeroInt32`

Clamps a number to the NonZeroInt32 range (avoiding zero).

###### Parameters

###### x

`number`

###### Returns

`NonZeroInt32`

The value clamped to [-2147483648, 2147483647] \ {0} as a NonZeroInt32.

##### div()

> **div**: (`x`, `y`) => `NonZeroInt32`

Divides one NonZeroInt32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`NonZeroInt32`\>

###### Returns

`NonZeroInt32`

`⌊a / b⌋` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### is()

> **is**: (`a`) => `a is NonZeroInt32`

Type guard to check if a value is a NonZeroInt32.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroInt32`

`true` if the value is a 32-bit non-zero signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt32` = `max_`

Returns the larger of two NonZeroInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt32`, `40`\>[]

###### Returns

`NonZeroInt32`

The maximum value as a NonZeroInt32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit non-zero signed integer.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroInt32` = `min_`

Returns the smaller of two NonZeroInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt32`, `40`\>[]

###### Returns

`NonZeroInt32`

The minimum value as a NonZeroInt32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 32-bit non-zero signed integer.

##### mul()

> **mul**: (`x`, `y`) => `NonZeroInt32`

Multiplies two NonZeroInt32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt32`

`a * b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### pow()

> **pow**: (`x`, `y`) => `NonZeroInt32`

Raises a NonZeroInt32 to the power of another NonZeroInt32.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt32`

`a ** b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### random()

> **random**: (`min?`, `max?`) => `NonZeroInt32`

Generates a random NonZeroInt32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### max?

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### Returns

`NonZeroInt32`

A random NonZeroInt32 between MIN_VALUE and MAX_VALUE (excluding 0).

##### sub()

> **sub**: (`x`, `y`) => `NonZeroInt32`

Subtracts one NonZeroInt32 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt32`

`a - b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

#### Example

```typescript
const a = asNonZeroInt32(2000000000);
const b = asNonZeroInt32(-500000000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroInt32.add(a, b); // NonZeroInt32 (1500000000)
const diff = NonZeroInt32.sub(a, b); // NonZeroInt32 (2147483647 - clamped to MAX_VALUE)
const product = NonZeroInt32.mul(a, b); // NonZeroInt32 (-2147483648 - clamped to MIN_VALUE)

// Utility operations
const absolute = NonZeroInt32.abs(b); // NonZeroInt32 (500000000)
const minimum = NonZeroInt32.min(a, b); // NonZeroInt32 (-500000000)
const maximum = NonZeroInt32.max(a, b); // NonZeroInt32 (2000000000)

// Range operations (avoiding zero)
const clamped = NonZeroInt32.clamp(0); // NonZeroInt32 (1 or -1, avoiding zero)
const random = NonZeroInt32.random(); // NonZeroInt32 (random non-zero value in range)
const power = NonZeroInt32.pow(asNonZeroInt32(2), asNonZeroInt32(20)); // NonZeroInt32 (1048576)
```
