[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/finite-number

# number/branded-types/finite-number

## Variables

### asFiniteNumber()

> `const` **asFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/finite-number.mts:98](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/finite-number.mts#L98)

Casts a number to a FiniteNumber branded type.

This function validates that the input is finite (not NaN, Infinity, or -Infinity)
and returns it with the FiniteNumber brand. This ensures type safety for operations
that require finite numeric values.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a FiniteNumber branded type

#### Throws

If the value is NaN, Infinity, or -Infinity

#### Example

```typescript
const x = asFiniteNumber(5.5); // FiniteNumber
const y = asFiniteNumber(-10); // FiniteNumber
const z = asFiniteNumber(0); // FiniteNumber

// These throw TypeError:
// asFiniteNumber(Infinity);     // Not finite
// asFiniteNumber(-Infinity);    // Not finite
// asFiniteNumber(NaN);          // Not a number
// asFiniteNumber(Math.sqrt(-1)); // Results in NaN
```

---

### FiniteNumber

> `const` **FiniteNumber**: `object`

Defined in: [src/number/branded-types/finite-number.mts:144](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/finite-number.mts#L144)

Namespace providing type-safe operations for FiniteNumber branded types.

The FiniteNumber type represents any finite numeric value, excluding the
special values NaN, Infinity, and -Infinity. All operations are guaranteed
to maintain the finite constraint when given finite inputs.

This type is essential for:

- Mathematical operations that require real numbers
- Preventing NaN/Infinity propagation in calculations
- Ensuring numeric stability in algorithms

#### Type Declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`FiniteNumber`\>

Returns the absolute value of a finite number.

###### Parameters

###### x

`FiniteNumber`

The finite number to get the absolute value of

###### Returns

`ToNonNegative`\<`FiniteNumber`\>

The absolute value as a FiniteNumber

###### Example

```typescript
FiniteNumber.abs(asFiniteNumber(-5.5)); // FiniteNumber (5.5)
FiniteNumber.abs(asFiniteNumber(3.2)); // FiniteNumber (3.2)
```

##### add()

> **add**: (`x`, `y`) => `FiniteNumber`

Adds two finite numbers.

###### Parameters

###### x

`FiniteNumber`

###### y

`FiniteNumber`

###### Returns

`FiniteNumber`

`a + b` as a FiniteNumber

###### Example

```typescript
FiniteNumber.add(asFiniteNumber(5.5), asFiniteNumber(3.2)); // FiniteNumber (8.7)
```

##### ceil()

> **ceil**: (`x`) => `ToInt`\<`FiniteNumber`\>

Returns the smallest integer greater than or equal to the given finite number.

###### Parameters

###### x

`FiniteNumber`

The finite number to ceil

###### Returns

`ToInt`\<`FiniteNumber`\>

The ceiling value as an Int

###### Example

```typescript
FiniteNumber.ceil(asFiniteNumber(5.2)); // Int (6)
FiniteNumber.ceil(asFiniteNumber(-5.8)); // Int (-5)
```

##### div()

> **div**: (`x`, `y`) => `FiniteNumber`

Divides two finite numbers.

The divisor must be non-zero (enforced by type constraints).
The result is guaranteed to be finite when both inputs are finite
and the divisor is non-zero.

###### Parameters

###### x

`FiniteNumber`

###### y

`ToNonZero`\<`FiniteNumber`\>

###### Returns

`FiniteNumber`

The quotient `a / b` as a FiniteNumber

###### Example

```typescript
const a = asFiniteNumber(11);
const b = asFiniteNumber(2);

FiniteNumber.div(a, b); // FiniteNumber (5.5)

// With non-zero type guard
const divisor = asFiniteNumber(userInput);
if (Num.isNonZero(divisor)) {
    const result = FiniteNumber.div(a, divisor);
}
```

##### floor()

> **floor**: (`x`) => `ToInt`\<`FiniteNumber`\>

Returns the largest integer less than or equal to the given finite number.

###### Parameters

###### x

`FiniteNumber`

The finite number to floor

###### Returns

`ToInt`\<`FiniteNumber`\>

The floor value as an Int

###### Example

```typescript
FiniteNumber.floor(asFiniteNumber(5.8)); // Int (5)
FiniteNumber.floor(asFiniteNumber(-5.2)); // Int (-6)
```

##### is()

> **is**: (`a`) => `a is FiniteNumber`

Type guard that checks if a value is a finite number.

###### Parameters

###### a

`number`

###### Returns

`a is FiniteNumber`

`true` if the value is finite, `false` otherwise

###### See

[isFiniteNumber](#isfinitenumber) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `FiniteNumber` = `max_`

Returns the maximum value from a list of finite numbers.

###### Parameters

###### values

...readonly `FiniteNumber`[]

The finite numbers to compare (at least one required)

###### Returns

`FiniteNumber`

The largest value as a FiniteNumber

###### Example

```typescript
const a = asFiniteNumber(5.5);
const b = asFiniteNumber(3.2);
const c = asFiniteNumber(7.8);

FiniteNumber.max(a, b); // FiniteNumber (7.8)
FiniteNumber.max(a, b, c); // FiniteNumber (7.8)
```

##### min()

> `readonly` **min**: (...`values`) => `FiniteNumber` = `min_`

Returns the minimum value from a list of finite numbers.

###### Parameters

###### values

...readonly `FiniteNumber`[]

The finite numbers to compare (at least one required)

###### Returns

`FiniteNumber`

The smallest value as a FiniteNumber

###### Example

```typescript
const a = asFiniteNumber(5.5);
const b = asFiniteNumber(3.2);
const c = asFiniteNumber(7.8);

FiniteNumber.min(a, b); // FiniteNumber (3.2)
FiniteNumber.min(a, b, c); // FiniteNumber (3.2)
```

##### mul()

> **mul**: (`x`, `y`) => `FiniteNumber`

Multiplies two finite numbers.

###### Parameters

###### x

`FiniteNumber`

###### y

`FiniteNumber`

###### Returns

`FiniteNumber`

`a * b` as a FiniteNumber

###### Example

```typescript
FiniteNumber.mul(asFiniteNumber(5.5), asFiniteNumber(2)); // FiniteNumber (11)
```

##### pow()

> **pow**: (`x`, `y`) => `FiniteNumber`

Raises a finite number to a power.

###### Parameters

###### x

`FiniteNumber`

###### y

`FiniteNumber`

###### Returns

`FiniteNumber`

`a ** b` as a FiniteNumber

###### Example

```typescript
FiniteNumber.pow(asFiniteNumber(2.5), asFiniteNumber(3)); // FiniteNumber (15.625)
```

##### random()

> **random**: (`min?`, `max?`) => `FiniteNumber`

Generates a random finite number within the specified range.

The generated value is uniformly distributed in the range [min, max].
Both bounds are inclusive.

###### Parameters

###### min?

`FiniteNumber`

The minimum value (inclusive)

###### max?

`FiniteNumber`

The maximum value (inclusive)

###### Returns

`FiniteNumber`

A random FiniteNumber in the range [min, max]

###### Example

```typescript
// Random percentage (0-100)
const pct = FiniteNumber.random(asFiniteNumber(0), asFiniteNumber(100));

// Random coordinate (-1 to 1)
const coord = FiniteNumber.random(asFiniteNumber(-1), asFiniteNumber(1));
```

##### round()

> **round**: (`x`) => `ToInt`\<`FiniteNumber`\>

Rounds a finite number to the nearest integer.

###### Parameters

###### x

`FiniteNumber`

The finite number to round

###### Returns

`ToInt`\<`FiniteNumber`\>

The rounded value as an Int

###### Example

```typescript
FiniteNumber.round(asFiniteNumber(5.4)); // Int (5)
FiniteNumber.round(asFiniteNumber(5.6)); // Int (6)
FiniteNumber.round(asFiniteNumber(5.5)); // Int (6)
```

##### sub()

> **sub**: (`x`, `y`) => `FiniteNumber`

Subtracts two finite numbers.

###### Parameters

###### x

`FiniteNumber`

###### y

`FiniteNumber`

###### Returns

`FiniteNumber`

`a - b` as a FiniteNumber

###### Example

```typescript
FiniteNumber.sub(asFiniteNumber(8.7), asFiniteNumber(3.2)); // FiniteNumber (5.5)
```

#### Example

```typescript
// Type validation
FiniteNumber.is(3.14); // true
FiniteNumber.is(Infinity); // false
FiniteNumber.is(0 / 0); // false (NaN)

// Arithmetic with guaranteed finite results
const a = asFiniteNumber(10.5);
const b = asFiniteNumber(3.2);

const sum = FiniteNumber.add(a, b); // FiniteNumber (13.7)
const diff = FiniteNumber.sub(a, b); // FiniteNumber (7.3)
const product = FiniteNumber.mul(a, b); // FiniteNumber (33.6)
const quotient = FiniteNumber.div(a, b); // FiniteNumber (3.28125)
const power = FiniteNumber.pow(a, asFiniteNumber(2)); // FiniteNumber (110.25)

// Rounding to integers
const value = asFiniteNumber(5.7);
const floored = FiniteNumber.floor(value); // Int (5)
const ceiled = FiniteNumber.ceil(value); // Int (6)
const rounded = FiniteNumber.round(value); // Int (6)

// Utility operations
const absolute = FiniteNumber.abs(asFiniteNumber(-42.5)); // FiniteNumber (42.5)
const minimum = FiniteNumber.min(a, b, asFiniteNumber(5)); // FiniteNumber (3.2)
const maximum = FiniteNumber.max(a, b, asFiniteNumber(5)); // FiniteNumber (10.5)

// Random generation
const rand = FiniteNumber.random(asFiniteNumber(0), asFiniteNumber(1)); // Random in [0, 1]
```

---

### isFiniteNumber()

> `const` **isFiniteNumber**: (`a`) => `a is FiniteNumber` = `is`

Defined in: [src/number/branded-types/finite-number.mts:72](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/finite-number.mts#L72)

Type guard that checks if a value is a finite number.

Returns `true` if the value is a finite number (not NaN, Infinity, or -Infinity).
This is stricter than the standard number type, which includes these special values.

#### Parameters

##### a

`number`

#### Returns

`a is FiniteNumber`

`true` if the value is finite, `false` otherwise

#### Example

```typescript
isFiniteNumber(42); // true
isFiniteNumber(3.14); // true
isFiniteNumber(-0); // true
isFiniteNumber(Infinity); // false
isFiniteNumber(-Infinity); // false
isFiniteNumber(NaN); // false
isFiniteNumber(1 / 0); // false (Infinity)
```
