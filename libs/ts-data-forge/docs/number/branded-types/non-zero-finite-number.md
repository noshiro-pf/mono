[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/non-zero-finite-number

# number/branded-types/non-zero-finite-number

## Variables

### asNonZeroFiniteNumber()

> `const` **asNonZeroFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-zero-finite-number.mts:83](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-finite-number.mts#L83)

Casts a number to a NonZeroFiniteNumber type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroFiniteNumber type.

#### Throws

If the value is not a non-zero finite number.

#### Example

```typescript
const x = asNonZeroFiniteNumber(5.5); // NonZeroFiniteNumber
const y = asNonZeroFiniteNumber(-3.2); // NonZeroFiniteNumber
// asNonZeroFiniteNumber(0); // throws TypeError
// asNonZeroFiniteNumber(Infinity); // throws TypeError
```

---

### isNonZeroFiniteNumber()

> `const` **isNonZeroFiniteNumber**: (`a`) => `a is NonZeroFiniteNumber` = `is`

Defined in: [src/number/branded-types/non-zero-finite-number.mts:68](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-finite-number.mts#L68)

Checks if a number is a NonZeroFiniteNumber (a finite number that is not 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroFiniteNumber`

`true` if the value is a NonZeroFiniteNumber, `false` otherwise.

---

### NonZeroFiniteNumber

> `const` **NonZeroFiniteNumber**: `object`

Defined in: [src/number/branded-types/non-zero-finite-number.mts:117](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-finite-number.mts#L117)

Namespace providing type-safe arithmetic operations for non-zero finite numbers.

All operations maintain the non-zero constraint while ensuring results remain finite
(excluding NaN and Infinity). This type is useful for values that must never be zero,
such as denominators, scaling factors, and ratios.

#### Type declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`NonZeroFiniteNumber`\>

Returns the absolute value of a non-zero finite number.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### Returns

`ToNonNegative`\<`NonZeroFiniteNumber`\>

The absolute value as a NonZeroFiniteNumber.

##### add()

> **add**: (`x`, `y`) => `NonZeroFiniteNumber`

Adds two NonZeroFiniteNumber values.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### y

`NonZeroFiniteNumber`

###### Returns

`NonZeroFiniteNumber`

`a + b` as a NonZeroFiniteNumber.

##### ceil()

> **ceil**: (`x`) => `ToInt`\<`NonZeroFiniteNumber`\>

Rounds up a NonZeroFiniteNumber to the nearest integer.

###### Parameters

###### x

`NonZeroFiniteNumber`

The NonZeroFiniteNumber to round up.

###### Returns

`ToInt`\<`NonZeroFiniteNumber`\>

The ceiling value as a NonZeroInt.

##### div()

> **div**: (`x`, `y`) => `NonZeroFiniteNumber`

Divides one NonZeroFiniteNumber by another.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### y

`ToNonZero`\<`NonZeroFiniteNumber`\>

###### Returns

`NonZeroFiniteNumber`

`a / b` as a NonZeroFiniteNumber.

##### floor()

> **floor**: (`x`) => `ToInt`\<`NonZeroFiniteNumber`\>

Rounds down a NonZeroFiniteNumber to the nearest integer.

###### Parameters

###### x

`NonZeroFiniteNumber`

The NonZeroFiniteNumber to round down.

###### Returns

`ToInt`\<`NonZeroFiniteNumber`\>

The floor value as a NonZeroInt.

##### is()

> **is**: (`a`) => `a is NonZeroFiniteNumber`

Type guard to check if a value is a NonZeroFiniteNumber.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroFiniteNumber`

`true` if the value is a non-zero finite number, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroFiniteNumber` = `max_`

Returns the larger of two NonZeroFiniteNumber values.

###### Parameters

###### values

...readonly `NonZeroFiniteNumber`[]

###### Returns

`NonZeroFiniteNumber`

The maximum value as a NonZeroFiniteNumber.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroFiniteNumber` = `min_`

Returns the smaller of two NonZeroFiniteNumber values.

###### Parameters

###### values

...readonly `NonZeroFiniteNumber`[]

###### Returns

`NonZeroFiniteNumber`

The minimum value as a NonZeroFiniteNumber.

##### mul()

> **mul**: (`x`, `y`) => `NonZeroFiniteNumber`

Multiplies two NonZeroFiniteNumber values.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### y

`NonZeroFiniteNumber`

###### Returns

`NonZeroFiniteNumber`

`a * b` as a NonZeroFiniteNumber.

##### pow()

> **pow**: (`x`, `y`) => `NonZeroFiniteNumber`

Raises a NonZeroFiniteNumber to the power of another NonZeroFiniteNumber.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### y

`NonZeroFiniteNumber`

###### Returns

`NonZeroFiniteNumber`

`a ** b` as a NonZeroFiniteNumber.

##### random()

> **random**: (`min?`, `max?`) => `NonZeroFiniteNumber`

Generates a random NonZeroFiniteNumber value.

###### Parameters

###### min?

`NonZeroFiniteNumber`

###### max?

`NonZeroFiniteNumber`

###### Returns

`NonZeroFiniteNumber`

A random non-zero finite number.

##### round()

> **round**: (`x`) => `ToInt`\<`NonZeroFiniteNumber`\>

Rounds a NonZeroFiniteNumber to the nearest integer.

###### Parameters

###### x

`NonZeroFiniteNumber`

The NonZeroFiniteNumber to round.

###### Returns

`ToInt`\<`NonZeroFiniteNumber`\>

The rounded value as a NonZeroInt.

##### sub()

> **sub**: (`x`, `y`) => `NonZeroFiniteNumber`

Subtracts one NonZeroFiniteNumber from another.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### y

`NonZeroFiniteNumber`

###### Returns

`NonZeroFiniteNumber`

`a - b` as a NonZeroFiniteNumber.

#### Example

```typescript
const factor = asNonZeroFiniteNumber(2.5);
const multiplier = asNonZeroFiniteNumber(-1.5);

// Arithmetic operations that preserve non-zero constraint
const result = NonZeroFiniteNumber.add(factor, multiplier); // NonZeroFiniteNumber (1.0)
const difference = NonZeroFiniteNumber.sub(factor, multiplier); // NonZeroFiniteNumber (4.0)
const product = NonZeroFiniteNumber.mul(factor, multiplier); // NonZeroFiniteNumber (-3.75)
const quotient = NonZeroFiniteNumber.div(factor, multiplier); // NonZeroFiniteNumber (-1.666...)

// Utility operations
const absolute = NonZeroFiniteNumber.abs(multiplier); // NonZeroFiniteNumber (1.5)
const minimum = NonZeroFiniteNumber.min(factor, multiplier); // NonZeroFiniteNumber (-1.5)
const maximum = NonZeroFiniteNumber.max(factor, multiplier); // NonZeroFiniteNumber (2.5)

// Rounding operations (return NonZeroInt)
const rounded = NonZeroFiniteNumber.round(factor); // NonZeroInt (3)
const floored = NonZeroFiniteNumber.floor(factor); // NonZeroInt (2)
const ceiled = NonZeroFiniteNumber.ceil(factor); // NonZeroInt (3)

// Random generation
const randomValue = NonZeroFiniteNumber.random(); // NonZeroFiniteNumber (random non-zero value)
```
