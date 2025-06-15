[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/positive-finite-number

# number/branded-types/positive-finite-number

## Variables

### asPositiveFiniteNumber()

> `const` **asPositiveFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/positive-finite-number.mts:89](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-finite-number.mts#L89)

Casts a number to a PositiveFiniteNumber type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveFiniteNumber type.

#### Throws

If the value is not a positive finite number.

#### Example

```typescript
const x = asPositiveFiniteNumber(5.5); // PositiveFiniteNumber
const y = asPositiveFiniteNumber(0.001); // PositiveFiniteNumber
// asPositiveFiniteNumber(0); // throws TypeError
// asPositiveFiniteNumber(-1); // throws TypeError
```

---

### isPositiveFiniteNumber()

> `const` **isPositiveFiniteNumber**: (`a`) => `a is PositiveFiniteNumber` = `is`

Defined in: [src/number/branded-types/positive-finite-number.mts:74](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-finite-number.mts#L74)

Checks if a number is a PositiveFiniteNumber (a finite number > 0).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveFiniteNumber`

`true` if the value is a PositiveFiniteNumber, `false` otherwise.

---

### PositiveFiniteNumber

> `const` **PositiveFiniteNumber**: `object`

Defined in: [src/number/branded-types/positive-finite-number.mts:125](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-finite-number.mts#L125)

Namespace providing type-safe arithmetic operations for positive finite numbers.

All operations maintain the positive constraint by clamping non-positive results to MIN_VALUE,
while ensuring results remain finite (excluding NaN and Infinity). This type is useful
for representing quantities that must always be positive, such as probabilities, magnitudes,
and physical measurements.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `PositiveFiniteNumber`

Adds two PositiveFiniteNumber values.

###### Parameters

###### x

`PositiveFiniteNumber`

###### y

`PositiveFiniteNumber`

###### Returns

`PositiveFiniteNumber`

`a + b` clamped to (0, +∞) as a PositiveFiniteNumber.

##### ceil()

> **ceil**: (`x`) => `ToInt`\<`PositiveFiniteNumber`\>

Rounds up a PositiveFiniteNumber to the nearest integer.

###### Parameters

###### x

`PositiveFiniteNumber`

The PositiveFiniteNumber to round up.

###### Returns

`ToInt`\<`PositiveFiniteNumber`\>

The ceiling value as a PositiveInt (always >= 1).

##### clamp()

> **clamp**: (`x`) => `PositiveFiniteNumber`

Clamps a number to the positive finite range.

###### Parameters

###### x

`number`

###### Returns

`PositiveFiniteNumber`

The value clamped to (0, +∞) as a PositiveFiniteNumber.

##### div()

> **div**: (`x`, `y`) => `PositiveFiniteNumber`

Divides one PositiveFiniteNumber by another.

###### Parameters

###### x

`PositiveFiniteNumber`

###### y

`ToNonZero`\<`PositiveFiniteNumber`\>

###### Returns

`PositiveFiniteNumber`

`a / b` clamped to (0, +∞) as a PositiveFiniteNumber.

##### floor()

> **floor**: (`x`) => `RemoveNonZeroBrandKey`\<`ToInt`\<`PositiveFiniteNumber`\>\>

Rounds down a PositiveFiniteNumber to the nearest integer.

###### Parameters

###### x

`PositiveFiniteNumber`

The PositiveFiniteNumber to round down.

###### Returns

`RemoveNonZeroBrandKey`\<`ToInt`\<`PositiveFiniteNumber`\>\>

The floor value as a Uint (can be 0).

##### is()

> **is**: (`a`) => `a is PositiveFiniteNumber`

Type guard to check if a value is a PositiveFiniteNumber.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveFiniteNumber`

`true` if the value is a positive finite number, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveFiniteNumber` = `max_`

Returns the larger of two PositiveFiniteNumber values.

###### Parameters

###### values

...readonly `PositiveFiniteNumber`[]

###### Returns

`PositiveFiniteNumber`

The maximum value as a PositiveFiniteNumber.

##### min()

> `readonly` **min**: (...`values`) => `PositiveFiniteNumber` = `min_`

Returns the smaller of two PositiveFiniteNumber values.

###### Parameters

###### values

...readonly `PositiveFiniteNumber`[]

###### Returns

`PositiveFiniteNumber`

The minimum value as a PositiveFiniteNumber.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a positive finite number.

##### mul()

> **mul**: (`x`, `y`) => `PositiveFiniteNumber`

Multiplies two PositiveFiniteNumber values.

###### Parameters

###### x

`PositiveFiniteNumber`

###### y

`PositiveFiniteNumber`

###### Returns

`PositiveFiniteNumber`

`a * b` clamped to (0, +∞) as a PositiveFiniteNumber.

##### pow()

> **pow**: (`x`, `y`) => `PositiveFiniteNumber`

Raises a PositiveFiniteNumber to the power of another PositiveFiniteNumber.

###### Parameters

###### x

`PositiveFiniteNumber`

###### y

`PositiveFiniteNumber`

###### Returns

`PositiveFiniteNumber`

`a ** b` clamped to (0, +∞) as a PositiveFiniteNumber.

##### random()

> **random**: (`min`, `max`) => `PositiveFiniteNumber`

Generates a random PositiveFiniteNumber value.

###### Parameters

###### min

`PositiveFiniteNumber`

###### max

`PositiveFiniteNumber`

###### Returns

`PositiveFiniteNumber`

A random positive finite number.

##### round()

> **round**: (`x`) => `RemoveNonZeroBrandKey`\<`ToInt`\<`PositiveFiniteNumber`\>\>

Rounds a PositiveFiniteNumber to the nearest integer.

###### Parameters

###### x

`PositiveFiniteNumber`

The PositiveFiniteNumber to round.

###### Returns

`RemoveNonZeroBrandKey`\<`ToInt`\<`PositiveFiniteNumber`\>\>

The rounded value as a Uint (can be 0 if x < 0.5).

##### sub()

> **sub**: (`x`, `y`) => `PositiveFiniteNumber`

Subtracts one PositiveFiniteNumber from another.

###### Parameters

###### x

`PositiveFiniteNumber`

###### y

`PositiveFiniteNumber`

###### Returns

`PositiveFiniteNumber`

`a - b` clamped to (0, +∞) as a PositiveFiniteNumber (minimum MIN_VALUE).

#### Example

```typescript
const probability = asPositiveFiniteNumber(0.75);
const rate = asPositiveFiniteNumber(1.25);

// Arithmetic operations with positive clamping
const combined = PositiveFiniteNumber.add(probability, rate); // PositiveFiniteNumber (2.0)
const difference = PositiveFiniteNumber.sub(rate, probability); // PositiveFiniteNumber (0.5)
const scaled = PositiveFiniteNumber.mul(probability, rate); // PositiveFiniteNumber (0.9375)
const ratio = PositiveFiniteNumber.div(rate, probability); // PositiveFiniteNumber (1.666...)

// Range operations
const clamped = PositiveFiniteNumber.clamp(-10.5); // PositiveFiniteNumber (MIN_VALUE)
const minimum = PositiveFiniteNumber.min(probability, rate); // PositiveFiniteNumber (0.75)
const maximum = PositiveFiniteNumber.max(probability, rate); // PositiveFiniteNumber (1.25)

// Rounding operations (different return types based on operation)
const ceiled = PositiveFiniteNumber.ceil(probability); // PositiveInt (1)
const floored = PositiveFiniteNumber.floor(rate); // Uint (1)
const rounded = PositiveFiniteNumber.round(rate); // Uint (1)

// Utility operations
const random = PositiveFiniteNumber.random(); // PositiveFiniteNumber (random positive value)
const power = PositiveFiniteNumber.pow(rate, probability); // PositiveFiniteNumber (1.18...)
```
