[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/non-negative-finite-number

# number/branded-types/non-negative-finite-number

## Variables

### asNonNegativeFiniteNumber()

> `const` **asNonNegativeFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-negative-finite-number.mts:73](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-finite-number.mts#L73)

Casts a number to a NonNegativeFiniteNumber type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeFiniteNumber type.

#### Throws

If the value is not a non-negative finite number.

#### Example

```typescript
const x = asNonNegativeFiniteNumber(5.5); // NonNegativeFiniteNumber
const y = asNonNegativeFiniteNumber(0); // NonNegativeFiniteNumber
// asNonNegativeFiniteNumber(-1); // throws TypeError
// asNonNegativeFiniteNumber(Infinity); // throws TypeError
```

---

### isNonNegativeFiniteNumber()

> `const` **isNonNegativeFiniteNumber**: (`a`) => `a is NonNegativeFiniteNumber` = `is`

Defined in: [src/number/branded-types/non-negative-finite-number.mts:58](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-finite-number.mts#L58)

Checks if a number is a NonNegativeFiniteNumber (a finite number >= 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeFiniteNumber`

`true` if the value is a NonNegativeFiniteNumber, `false` otherwise.

---

### NonNegativeFiniteNumber

> `const` **NonNegativeFiniteNumber**: `object`

Defined in: [src/number/branded-types/non-negative-finite-number.mts:104](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-finite-number.mts#L104)

Namespace providing type-safe arithmetic operations for non-negative finite numbers.

All operations maintain the non-negative constraint by clamping negative results to 0,
while ensuring results remain finite (excluding NaN and Infinity). This type is useful
for representing measurements, distances, weights, and other inherently non-negative values.

#### Type Declaration

##### add()

> **add**: (`x`, `y`) => `NonNegativeFiniteNumber`

Adds two NonNegativeFiniteNumber values.

###### Parameters

###### x

`NonNegativeFiniteNumber`

###### y

`NonNegativeFiniteNumber`

###### Returns

`NonNegativeFiniteNumber`

`a + b` clamped to [0, +∞) as a NonNegativeFiniteNumber.

##### ceil()

> **ceil**: (`x`) => `ToInt`\<`NonNegativeFiniteNumber`\>

Rounds up a NonNegativeFiniteNumber to the nearest integer.

###### Parameters

###### x

`NonNegativeFiniteNumber`

The NonNegativeFiniteNumber to round up.

###### Returns

`ToInt`\<`NonNegativeFiniteNumber`\>

The ceiling value as a Uint.

##### clamp()

> **clamp**: (`x`) => `NonNegativeFiniteNumber`

Clamps a number to the non-negative finite range.

###### Parameters

###### x

`number`

###### Returns

`NonNegativeFiniteNumber`

The value clamped to [0, +∞) as a NonNegativeFiniteNumber.

##### div()

> **div**: (`x`, `y`) => `NonNegativeFiniteNumber`

Divides one NonNegativeFiniteNumber by another.

###### Parameters

###### x

`NonNegativeFiniteNumber`

###### y

`ToNonZero`\<`NonNegativeFiniteNumber`\>

###### Returns

`NonNegativeFiniteNumber`

`a / b` clamped to [0, +∞) as a NonNegativeFiniteNumber.

##### floor()

> **floor**: (`x`) => `ToInt`\<`NonNegativeFiniteNumber`\>

Rounds down a NonNegativeFiniteNumber to the nearest integer.

###### Parameters

###### x

`NonNegativeFiniteNumber`

The NonNegativeFiniteNumber to round down.

###### Returns

`ToInt`\<`NonNegativeFiniteNumber`\>

The floor value as a Uint.

##### is()

> **is**: (`a`) => `a is NonNegativeFiniteNumber`

Type guard to check if a value is a NonNegativeFiniteNumber.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeFiniteNumber`

`true` if the value is a non-negative finite number, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeFiniteNumber` = `max_`

Returns the larger of two NonNegativeFiniteNumber values.

###### Parameters

###### values

...readonly `NonNegativeFiniteNumber`[]

###### Returns

`NonNegativeFiniteNumber`

The maximum value as a NonNegativeFiniteNumber.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeFiniteNumber` = `min_`

Returns the smaller of two NonNegativeFiniteNumber values.

###### Parameters

###### values

...readonly `NonNegativeFiniteNumber`[]

###### Returns

`NonNegativeFiniteNumber`

The minimum value as a NonNegativeFiniteNumber.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a non-negative finite number.

##### mul()

> **mul**: (`x`, `y`) => `NonNegativeFiniteNumber`

Multiplies two NonNegativeFiniteNumber values.

###### Parameters

###### x

`NonNegativeFiniteNumber`

###### y

`NonNegativeFiniteNumber`

###### Returns

`NonNegativeFiniteNumber`

`a * b` clamped to [0, +∞) as a NonNegativeFiniteNumber.

##### pow()

> **pow**: (`x`, `y`) => `NonNegativeFiniteNumber`

Raises a NonNegativeFiniteNumber to the power of another NonNegativeFiniteNumber.

###### Parameters

###### x

`NonNegativeFiniteNumber`

###### y

`NonNegativeFiniteNumber`

###### Returns

`NonNegativeFiniteNumber`

`a ** b` clamped to [0, +∞) as a NonNegativeFiniteNumber.

##### random()

> **random**: (`min?`, `max?`) => `NonNegativeFiniteNumber`

Generates a random NonNegativeFiniteNumber value.

###### Parameters

###### min?

`NonNegativeFiniteNumber`

###### max?

`NonNegativeFiniteNumber`

###### Returns

`NonNegativeFiniteNumber`

A random non-negative finite number.

##### round()

> **round**: (`x`) => `ToInt`\<`NonNegativeFiniteNumber`\>

Rounds a NonNegativeFiniteNumber to the nearest integer.

###### Parameters

###### x

`NonNegativeFiniteNumber`

The NonNegativeFiniteNumber to round.

###### Returns

`ToInt`\<`NonNegativeFiniteNumber`\>

The rounded value as a Uint.

##### sub()

> **sub**: (`x`, `y`) => `NonNegativeFiniteNumber`

Subtracts one NonNegativeFiniteNumber from another.

###### Parameters

###### x

`NonNegativeFiniteNumber`

###### y

`NonNegativeFiniteNumber`

###### Returns

`NonNegativeFiniteNumber`

`a - b` clamped to [0, +∞) as a NonNegativeFiniteNumber (minimum 0).

#### Example

```typescript
const distance = asNonNegativeFiniteNumber(5.5);
const speed = asNonNegativeFiniteNumber(2.2);

// Arithmetic operations with non-negative clamping
const total = NonNegativeFiniteNumber.add(distance, speed); // NonNegativeFiniteNumber (7.7)
const diff = NonNegativeFiniteNumber.sub(speed, distance); // NonNegativeFiniteNumber (0 - clamped)
const area = NonNegativeFiniteNumber.mul(distance, speed); // NonNegativeFiniteNumber (12.1)
const ratio = NonNegativeFiniteNumber.div(distance, speed); // NonNegativeFiniteNumber (2.5)

// Range operations
const clamped = NonNegativeFiniteNumber.clamp(-10.5); // NonNegativeFiniteNumber (0)
const minimum = NonNegativeFiniteNumber.min(distance, speed); // NonNegativeFiniteNumber (2.2)
const maximum = NonNegativeFiniteNumber.max(distance, speed); // NonNegativeFiniteNumber (5.5)

// Rounding operations (return Uint)
const pixels = NonNegativeFiniteNumber.round(distance); // Uint (6)
const floorValue = NonNegativeFiniteNumber.floor(distance); // Uint (5)
const ceilValue = NonNegativeFiniteNumber.ceil(distance); // Uint (6)
```
