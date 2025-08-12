[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/non-zero-int

# number/branded-types/non-zero-int

## Variables

### asNonZeroInt()

> `const` **asNonZeroInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-zero-int.mts:52](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int.mts#L52)

Casts a number to a NonZeroInt type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt type.

#### Throws

If the value is not a non-zero integer.

#### Example

```typescript
const x = asNonZeroInt(5); // NonZeroInt
const y = asNonZeroInt(-3); // NonZeroInt
// asNonZeroInt(0); // throws TypeError
// asNonZeroInt(1.5); // throws TypeError
```

---

### isNonZeroInt()

> `const` **isNonZeroInt**: (`a`) => `a is NonZeroInt` = `is`

Defined in: [src/number/branded-types/non-zero-int.mts:37](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int.mts#L37)

Checks if a number is a NonZeroInt.

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt`

`true` if the value is a NonZeroInt, `false` otherwise.

---

### NonZeroInt

> `const` **NonZeroInt**: `object`

Defined in: [src/number/branded-types/non-zero-int.mts:81](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-int.mts#L81)

Namespace providing type-safe arithmetic operations for non-zero integers.

All operations maintain the non-zero constraint, ensuring that results are always valid NonZeroInt values.
Division operations return floor division results, and all arithmetic maintains integer precision.

#### Type declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`NonZeroInt`\>

Returns the absolute value of a non-zero integer.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`NonZeroInt`\>

The absolute value as a NonZeroInt.

##### add()

> **add**: (`x`, `y`) => `NonZeroInt`

Adds two non-zero integers.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt`

`a + b` as a NonZeroInt.

##### div()

> **div**: (`x`, `y`) => `NonZeroInt`

Divides one non-zero integer by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`NonZeroInt`\>

###### Returns

`NonZeroInt`

`⌊a / b⌋` as a NonZeroInt.

##### is()

> **is**: (`a`) => `a is NonZeroInt`

Type guard to check if a value is a NonZeroInt.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroInt`

`true` if the value is a non-zero integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt` = `max_`

Returns the larger of two non-zero integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt`, `40`\>[]

###### Returns

`NonZeroInt`

The maximum value as a NonZeroInt.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroInt` = `min_`

Returns the smaller of two non-zero integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt`, `40`\>[]

###### Returns

`NonZeroInt`

The minimum value as a NonZeroInt.

##### mul()

> **mul**: (`x`, `y`) => `NonZeroInt`

Multiplies two non-zero integers.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt`

`a * b` as a NonZeroInt.

##### pow()

> **pow**: (`x`, `y`) => `NonZeroInt`

Raises a non-zero integer to the power of another non-zero integer.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt`

`a ** b` as a NonZeroInt.

##### random()

> **random**: (`min?`, `max?`) => `NonZeroInt`

Generates a random non-zero integer.

###### Parameters

###### min?

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### max?

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### Returns

`NonZeroInt`

A random NonZeroInt value.

##### sub()

> **sub**: (`x`, `y`) => `NonZeroInt`

Subtracts one non-zero integer from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroInt`

`a - b` as a NonZeroInt.

#### Example

```typescript
const a = asNonZeroInt(10);
const b = asNonZeroInt(-5);

// Arithmetic operations
const sum = NonZeroInt.add(a, b); // NonZeroInt (5)
const diff = NonZeroInt.sub(a, b); // NonZeroInt (15)
const product = NonZeroInt.mul(a, b); // NonZeroInt (-50)
const quotient = NonZeroInt.div(a, b); // NonZeroInt (-2)

// Utility operations
const absolute = NonZeroInt.abs(b); // NonZeroInt (5)
const power = NonZeroInt.pow(a, asNonZeroInt(2)); // NonZeroInt (100)
const minimum = NonZeroInt.min(a, b); // NonZeroInt (-5)
const maximum = NonZeroInt(a, b); // NonZeroInt (10)

// Random generation
const randomInt = NonZeroInt.random(); // NonZeroInt (random non-zero integer)
```
