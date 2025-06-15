[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/non-zero-int16

# number/branded-types/non-zero-int16

## Variables

### asNonZeroInt16()

> `const` **asNonZeroInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-zero-int16.mts:55](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int16.mts#L55)

Casts a number to a NonZeroInt16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt16 type.

#### Throws

If the value is not a non-zero integer in [-2^15, 2^15).

#### Example

```typescript
const x = asNonZeroInt16(1000); // NonZeroInt16
const y = asNonZeroInt16(-1000); // NonZeroInt16
// asNonZeroInt16(0); // throws TypeError
// asNonZeroInt16(32768); // throws TypeError
```

---

### isNonZeroInt16()

> `const` **isNonZeroInt16**: (`a`) => `a is NonZeroInt16` = `is`

Defined in: [src/number/branded-types/non-zero-int16.mts:40](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int16.mts#L40)

Checks if a number is a NonZeroInt16 (16-bit non-zero signed integer in the range [-2^15, 2^15) excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt16`

`true` if the value is a NonZeroInt16, `false` otherwise.

---

### NonZeroInt16

> `const` **NonZeroInt16**: `object`

Defined in: [src/number/branded-types/non-zero-int16.mts:85](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int16.mts#L85)

Namespace providing type-safe arithmetic operations for 16-bit non-zero signed integers.

All operations automatically clamp results to the valid NonZeroInt16 range [-32768, 32767]
excluding 0. This ensures that all arithmetic maintains the 16-bit non-zero signed integer
constraint, preventing zero results and overflow.

#### Type declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`NonZeroInt16`\>

Returns the absolute value of a 16-bit non-zero signed integer.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`NonZeroInt16`\>

The absolute value as a NonZeroInt16, clamped to valid range.

##### add()

> **add**: (`x`, `y`) => `NonZeroInt16`

Adds two NonZeroInt16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt16`

`a + b` clamped to [-32768, 32767] as a NonZeroInt16.

##### clamp()

> **clamp**: (`x`) => `NonZeroInt16`

Clamps a number to the NonZeroInt16 range (avoiding zero).

###### Parameters

###### x

`number`

###### Returns

`NonZeroInt16`

The value clamped to [-32768, 32767] \ {0} as a NonZeroInt16.

##### div()

> **div**: (`x`, `y`) => `NonZeroInt16`

Divides one NonZeroInt16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`NonZeroInt16`\>

###### Returns

`NonZeroInt16`

`⌊a / b⌋` clamped to [-32768, 32767] as a NonZeroInt16.

##### is()

> **is**: (`a`) => `a is NonZeroInt16`

Type guard to check if a value is a NonZeroInt16.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroInt16`

`true` if the value is a 16-bit non-zero signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt16` = `max_`

Returns the larger of two NonZeroInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt16`, `40`\>[]

###### Returns

`NonZeroInt16`

The maximum value as a NonZeroInt16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit non-zero signed integer.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroInt16` = `min_`

Returns the smaller of two NonZeroInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt16`, `40`\>[]

###### Returns

`NonZeroInt16`

The minimum value as a NonZeroInt16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 16-bit non-zero signed integer.

##### mul()

> **mul**: (`x`, `y`) => `NonZeroInt16`

Multiplies two NonZeroInt16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt16`

`a * b` clamped to [-32768, 32767] as a NonZeroInt16.

##### pow()

> **pow**: (`x`, `y`) => `NonZeroInt16`

Raises a NonZeroInt16 to the power of another NonZeroInt16.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt16`

`a ** b` clamped to [-32768, 32767] as a NonZeroInt16.

##### random()

> **random**: (`min`, `max`) => `NonZeroInt16`

Generates a random NonZeroInt16 value within the valid range.

###### Parameters

###### min

`WithSmallInt`

###### max

`WithSmallInt`

###### Returns

`NonZeroInt16`

A random NonZeroInt16 between MIN_VALUE and MAX_VALUE (excluding 0).

##### sub()

> **sub**: (`x`, `y`) => `NonZeroInt16`

Subtracts one NonZeroInt16 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt16`

`a - b` clamped to [-32768, 32767] as a NonZeroInt16.

#### Example

```typescript
const a = asNonZeroInt16(30000);
const b = asNonZeroInt16(-10000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroInt16.add(a, b); // NonZeroInt16 (20000)
const diff = NonZeroInt16.sub(a, b); // NonZeroInt16 (32767 - clamped to MAX_VALUE)
const product = NonZeroInt16.mul(a, b); // NonZeroInt16 (-32768 - clamped to MIN_VALUE)

// Utility operations
const absolute = NonZeroInt16.abs(b); // NonZeroInt16 (10000)
const minimum = NonZeroInt16.min(a, b); // NonZeroInt16 (-10000)
const maximum = NonZeroInt16.max(a, b); // NonZeroInt16 (30000)

// Range operations (avoiding zero)
const clamped = NonZeroInt16.clamp(0); // NonZeroInt16 (1 or -1, avoiding zero)
const random = NonZeroInt16.random(); // NonZeroInt16 (random non-zero value in range)
const power = NonZeroInt16.pow(asNonZeroInt16(2), asNonZeroInt16(10)); // NonZeroInt16 (1024)
```
