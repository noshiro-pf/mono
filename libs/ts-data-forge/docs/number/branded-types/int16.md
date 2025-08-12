[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/int16

# number/branded-types/int16

## Variables

### asInt16()

> `const` **asInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/int16.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int16.mts#L54)

Casts a number to an Int16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int16 type.

#### Throws

If the value is not an integer in [-2^15, 2^15).

#### Example

```typescript
const x = asInt16(1000); // Int16
const y = asInt16(-5000); // Int16
// asInt16(50000); // throws TypeError
// asInt16(1.5); // throws TypeError
```

---

### Int16

> `const` **Int16**: `object`

Defined in: [src/number/branded-types/int16.mts:81](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int16.mts#L81)

Namespace providing type-safe arithmetic operations for 16-bit signed integers.

All operations automatically clamp results to the valid Int16 range [-32768, 32767].
This ensures that all arithmetic maintains the 16-bit signed integer constraint.

#### Type declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`Int16`\>

Returns the absolute value of a 16-bit signed integer.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`Int16`\>

The absolute value as an Int16, clamped to valid range.

##### add()

> **add**: (`x`, `y`) => `Int16`

Adds two Int16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int16`

`a + b` clamped to [-32768, 32767] as an Int16.

##### clamp()

> **clamp**: (`x`) => `Int16`

Clamps a number to the Int16 range.

###### Parameters

###### x

`number`

###### Returns

`Int16`

The value clamped to [-32768, 32767] as an Int16.

##### div()

> **div**: (`x`, `y`) => `Int16`

Divides one Int16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`Int16`\>

###### Returns

`Int16`

`⌊a / b⌋` clamped to [-32768, 32767] as an Int16.

##### is()

> **is**: (`a`) => `a is Int16`

Type guard to check if a value is an Int16.

###### Parameters

###### a

`number`

###### Returns

`a is Int16`

`true` if the value is a 16-bit signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Int16` = `max_`

Returns the larger of two Int16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int16`, `40`\>[]

###### Returns

`Int16`

The maximum value as an Int16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit signed integer.

##### min()

> `readonly` **min**: (...`values`) => `Int16` = `min_`

Returns the smaller of two Int16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int16`, `40`\>[]

###### Returns

`Int16`

The minimum value as an Int16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 16-bit signed integer.

##### mul()

> **mul**: (`x`, `y`) => `Int16`

Multiplies two Int16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int16`

`a * b` clamped to [-32768, 32767] as an Int16.

##### pow()

> **pow**: (`x`, `y`) => `Int16`

Raises an Int16 to the power of another Int16.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int16`

`a ** b` clamped to [-32768, 32767] as an Int16.

##### random()

> **random**: (`min?`, `max?`) => `Int16`

Generates a random Int16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`Int16`, `40`\>

###### max?

`WithSmallInt`\<`Int16`, `40`\>

###### Returns

`Int16`

A random Int16 between MIN_VALUE and MAX_VALUE.

##### sub()

> **sub**: (`x`, `y`) => `Int16`

Subtracts one Int16 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int16`

`a - b` clamped to [-32768, 32767] as an Int16.

#### Example

```typescript
const a = asInt16(30000);
const b = asInt16(5000);

// Arithmetic operations with automatic clamping
const sum = Int16.add(a, b); // Int16 (32767 - clamped to MAX_VALUE)
const diff = Int16.sub(a, b); // Int16 (25000)
const product = Int16.mul(a, b); // Int16 (32767 - clamped due to overflow)

// Range operations
const clamped = Int16.clamp(100000); // Int16 (32767)
const minimum = Int16.min(a, b); // Int16 (5000)
const maximum = Int16.max(a, b); // Int16 (30000)

// Range constants
const range = Int16.MAX_VALUE - Int16.MIN_VALUE + 1; // 65536
```

---

### isInt16()

> `const` **isInt16**: (`a`) => `a is Int16` = `is`

Defined in: [src/number/branded-types/int16.mts:39](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int16.mts#L39)

Checks if a number is an Int16 (16-bit signed integer in the range [-2^15, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is Int16`

`true` if the value is an Int16, `false` otherwise.
