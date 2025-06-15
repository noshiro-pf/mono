[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/int

# number/branded-types/int

## Variables

### asInt()

> `const` **asInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/int.mts:76](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int.mts#L76)

Casts a number to an Int branded type.

This function validates that the input is an integer and returns it with
the Int brand. Throws a TypeError if the value has a fractional component
or is not a finite number.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int branded type

#### Throws

If the value is not an integer

#### Example

```typescript
const x = asInt(5); // Int
const y = asInt(-10); // Int
const z = asInt(0); // Int

// These throw TypeError:
// asInt(5.5);         // Not an integer
// asInt(NaN);         // Not a number
// asInt(Infinity);    // Not finite
```

---

### Int

> `const` **Int**: `object`

Defined in: [src/number/branded-types/int.mts:115](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int.mts#L115)

Namespace providing type-safe operations for Int branded types.

The Int type represents any integer value (no fractional component) without
range restrictions. All operations preserve the integer constraint, using
floor division for division operations.

Unlike SafeInt, Int allows values outside the safe integer range
(±2^53 - 1), but be aware that very large integers may lose precision
in JavaScript's number type.

#### Type declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`Int`\>

Returns the absolute value of an integer.

The result is always non-negative and maintains the Int brand.
Note that Math.abs(Number.MIN_SAFE_INTEGER) exceeds Number.MAX_SAFE_INTEGER,
so use SafeInt for guaranteed precision.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`Int`\>

The absolute value as a non-negative Int

###### Example

```typescript
Int.abs(asInt(-5)); // Int (5)
Int.abs(asInt(3)); // Int (3)
Int.abs(asInt(-0)); // Int (0)
```

##### add()

> **add**: (`x`, `y`) => `Int`

Adds two integers.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int`

`a + b` as an Int

###### Example

```typescript
Int.add(asInt(5), asInt(3)); // Int (8)
```

##### div()

> **div**: (`x`, `y`) => `Int`

Divides two integers using floor division.

Performs mathematical floor division: `⌊a / b⌋`.
The result is always an integer, rounding toward negative infinity.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`Int`\>

###### Returns

`Int`

The integer quotient as an Int

###### Example

```typescript
// Positive division
Int.div(asInt(10), asInt(3)); // Int (3)
Int.div(asInt(9), asInt(3)); // Int (3)

// Negative division (rounds toward -∞)
Int.div(asInt(-10), asInt(3)); // Int (-4)
Int.div(asInt(10), asInt(-3)); // Int (-4)
Int.div(asInt(-10), asInt(-3)); // Int (3)
```

##### is()

> **is**: (`a`) => `a is Int`

Type guard that checks if a value is an integer.

###### Parameters

###### a

`number`

###### Returns

`a is Int`

`true` if the value is an integer, `false` otherwise

###### See

[isInt](#isint) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `Int` = `max_`

Returns the maximum value from a list of integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int`, `40`\>[]

The integers to compare (at least one required)

###### Returns

`Int`

The largest value as an Int

###### Example

```typescript
Int.max(asInt(5), asInt(3)); // Int (5)
Int.max(asInt(-10), asInt(0), asInt(10)); // Int (10)
```

##### min()

> `readonly` **min**: (...`values`) => `Int` = `min_`

Returns the minimum value from a list of integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int`, `40`\>[]

The integers to compare (at least one required)

###### Returns

`Int`

The smallest value as an Int

###### Example

```typescript
Int.min(asInt(5), asInt(3)); // Int (3)
Int.min(asInt(-10), asInt(0), asInt(10)); // Int (-10)
```

##### mul()

> **mul**: (`x`, `y`) => `Int`

Multiplies two integers.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int`

`a * b` as an Int

###### Example

```typescript
Int.mul(asInt(4), asInt(3)); // Int (12)
```

##### pow()

> **pow**: (`x`, `y`) => `Int`

Raises an integer to a power.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int`

`a ** b` as an Int

###### Example

```typescript
Int.pow(asInt(2), asInt(3)); // Int (8)
```

##### random()

> **random**: (`min`, `max`) => `Int`

Generates a random integer within the specified range (inclusive).

The range is inclusive on both ends, so random(1, 6) can return
any of: 1, 2, 3, 4, 5, or 6.

###### Parameters

###### min

`WithSmallInt`

The minimum value (inclusive)

###### max

`WithSmallInt`

The maximum value (inclusive)

###### Returns

`Int`

A random Int in the range [min, max]

###### Example

```typescript
// Dice roll
const d6 = Int.random(asInt(1), asInt(6));

// Random array index
const index = Int.random(asInt(0), asInt(array.length - 1));

// Can generate negative values
const temp = Int.random(asInt(-10), asInt(10));
```

##### sub()

> **sub**: (`x`, `y`) => `Int`

Subtracts two integers.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Int`

`a - b` as an Int

###### Example

```typescript
Int.sub(asInt(8), asInt(3)); // Int (5)
```

#### Example

```typescript
// Type validation
Int.is(42); // true
Int.is(3.14); // false
Int.is(-0); // true (negative zero is an integer)

// Basic arithmetic
const a = asInt(10);
const b = asInt(3);

const sum = Int.add(a, b); // Int (13)
const diff = Int.sub(a, b); // Int (7)
const product = Int.mul(a, b); // Int (30)
const quotient = Int.div(a, b); // Int (3) - floor division
const power = Int.pow(a, b); // Int (1000)

// Utility operations
const absolute = Int.abs(asInt(-42)); // Int (42)
const minimum = Int.min(a, b, asInt(5)); // Int (3)
const maximum = Int.max(a, b, asInt(5)); // Int (10)

// Random generation
const die = Int.random(asInt(1), asInt(6)); // Random Int in [1, 6]
```

---

### isInt()

> `const` **isInt**: (`a`) => `a is Int` = `is`

Defined in: [src/number/branded-types/int.mts:51](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/int.mts#L51)

Type guard that checks if a value is an integer.

Returns `true` if the value is any integer (positive, negative, or zero),
with no fractional component. This includes values outside the safe integer
range, unlike SafeInt.

#### Parameters

##### a

`number`

#### Returns

`a is Int`

`true` if the value is an integer, `false` otherwise

#### Example

```typescript
isInt(5); // true
isInt(-10); // true
isInt(0); // true
isInt(5.5); // false
isInt(NaN); // false
isInt(Infinity); // false
```
