[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/safe-int

# number/branded-types/safe-int

## Variables

### asSafeInt()

> `const` **asSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/safe-int.mts:79](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/safe-int.mts#L79)

Casts a number to a SafeInt branded type.

This function validates that the input is a safe integer (within ±(2^53 - 1))
and returns it with the SafeInt brand. This ensures type safety for operations
that require precise integer arithmetic.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a SafeInt branded type

#### Throws

If the value is not a safe integer

#### Example

```typescript
const x = asSafeInt(5); // SafeInt
const y = asSafeInt(-1000); // SafeInt
const z = asSafeInt(2 ** 50); // SafeInt (within range)

// These throw TypeError:
// asSafeInt(1.5);                      // Not an integer
// asSafeInt(Number.MAX_SAFE_INTEGER + 1); // Exceeds safe range
// asSafeInt(2**53);                    // Loss of precision
```

---

### isSafeInt()

> `const` **isSafeInt**: (`a`) => `a is SafeInt` = `is`

Defined in: [src/number/branded-types/safe-int.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/safe-int.mts#L54)

Type guard that checks if a value is a safe integer.

A safe integer is an integer that can be exactly represented in JavaScript
without precision loss. The range is [±(2^53 - 1)].

#### Parameters

##### a

`number`

#### Returns

`a is SafeInt`

`true` if the value is a safe integer, `false` otherwise

#### Example

```typescript
isSafeInt(42); // true
isSafeInt(Number.MAX_SAFE_INTEGER); // true
isSafeInt(Number.MAX_SAFE_INTEGER + 1); // false
isSafeInt(3.14); // false
isSafeInt(NaN); // false
```

---

### SafeInt

> `const` **SafeInt**: `object`

Defined in: [src/number/branded-types/safe-int.mts:122](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/safe-int.mts#L122)

Namespace providing type-safe operations for SafeInt branded types.

SafeInt represents integers that can be exactly represented in JavaScript's
number type without precision loss. The range is [±(2^53 - 1)], which covers
approximately ±9 quadrillion.

All operations automatically clamp results to stay within the safe range,
preventing precision loss that occurs with larger integers. This makes SafeInt
ideal for:

- Financial calculations requiring exact cents
- Database IDs and counters
- Array indices and sizes
- Any integer arithmetic requiring precision guarantees

#### Type declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`SafeInt`\>

Returns the absolute value of a safe integer.

Note: `Math.abs(MIN_SAFE_INTEGER)` would exceed `MAX_SAFE_INTEGER`,
so this function clamps the result to maintain the safe integer guarantee.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`SafeInt`\>

The absolute value as a SafeInt, clamped if necessary

###### Example

```typescript
SafeInt.abs(asSafeInt(-42)); // SafeInt (42)
SafeInt.abs(asSafeInt(42)); // SafeInt (42)
SafeInt.abs(SafeInt.MIN_VALUE); // SafeInt (MAX_SAFE_INTEGER)
```

##### add()

> **add**: (`x`, `y`) => `SafeInt`

Adds two SafeInt values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeInt`

`a + b` clamped to safe integer range as a SafeInt.

##### clamp()

> **clamp**: (`x`) => `SafeInt`

Clamps a number to the safe integer range.

###### Parameters

###### x

`number`

###### Returns

`SafeInt`

The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] as a SafeInt.

##### div()

> **div**: (`x`, `y`) => `SafeInt`

Divides one SafeInt by another using floor division.

Performs mathematical floor division: `⌊a / b⌋`.
The divisor must be non-zero (enforced by type constraints).

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`SafeInt`\>

###### Returns

`SafeInt`

The integer quotient as a SafeInt

###### Example

```typescript
SafeInt.div(asSafeInt(10), asSafeInt(3)); // SafeInt (3)
SafeInt.div(asSafeInt(-10), asSafeInt(3)); // SafeInt (-4)

// Large number division
const large = asSafeInt(1000000000000);
const divisor = asSafeInt(1000000);
SafeInt.div(large, divisor); // SafeInt (1000000)
```

##### is()

> **is**: (`a`) => `a is SafeInt`

Type guard that checks if a value is a safe integer.

###### Parameters

###### a

`number`

###### Returns

`a is SafeInt`

`true` if the value is a safe integer, `false` otherwise

###### See

[isSafeInt](#issafeint) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `SafeInt` = `max_`

Returns the maximum value from a list of safe integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`SafeInt`, `40`\>[]

The safe integers to compare (at least one required)

###### Returns

`SafeInt`

The largest value as a SafeInt

###### Example

```typescript
SafeInt.max(asSafeInt(5), asSafeInt(3)); // SafeInt (5)
SafeInt.max(asSafeInt(-10), asSafeInt(0), asSafeInt(10)); // SafeInt (10)
```

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `SafeUint`

The maximum safe integer value (2^53 - 1).

##### min()

> `readonly` **min**: (...`values`) => `SafeInt` = `min_`

Returns the minimum value from a list of safe integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`SafeInt`, `40`\>[]

The safe integers to compare (at least one required)

###### Returns

`SafeInt`

The smallest value as a SafeInt

###### Example

```typescript
SafeInt.min(asSafeInt(5), asSafeInt(3)); // SafeInt (3)
SafeInt.min(asSafeInt(-10), asSafeInt(0), asSafeInt(10)); // SafeInt (-10)
```

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `SafeInt`

The minimum safe integer value (-(2^53 - 1)).

##### mul()

> **mul**: (`x`, `y`) => `SafeInt`

Multiplies two SafeInt values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeInt`

`a * b` clamped to safe integer range as a SafeInt.

##### pow()

> **pow**: (`x`, `y`) => `SafeInt`

Raises a SafeInt to the power of another SafeInt.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeInt`

`a ** b` clamped to safe integer range as a SafeInt.

##### random()

> **random**: (`min?`, `max?`) => `SafeInt`

Generates a random safe integer within the specified range (inclusive).

The range is inclusive on both ends. If min > max, they are automatically swapped.

###### Parameters

###### min?

`WithSmallInt`\<`SafeInt`, `40`\>

The minimum value (inclusive)

###### max?

`WithSmallInt`\<`SafeInt`, `40`\>

The maximum value (inclusive)

###### Returns

`SafeInt`

A random SafeInt in the range [min, max]

###### Example

```typescript
// Dice roll
const d20 = SafeInt.random(asSafeInt(1), asSafeInt(20));

// Random index for large array
const index = SafeInt.random(asSafeInt(0), asSafeInt(1000000));

// Can use full safe range
const any = SafeInt.random(SafeInt.MIN_VALUE, SafeInt.MAX_VALUE);
```

##### sub()

> **sub**: (`x`, `y`) => `SafeInt`

Subtracts one SafeInt from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`SafeInt`

`a - b` clamped to safe integer range as a SafeInt.

#### Example

```typescript
// Near the boundary
const nearMax = asSafeInt(9007199254740990);
const increment = asSafeInt(10);

// Automatic clamping prevents precision loss
const sum = SafeInt.add(nearMax, increment); // Clamped to MAX_SAFE_INTEGER
const product = SafeInt.mul(nearMax, increment); // Clamped to MAX_SAFE_INTEGER

// Safe operations
const a = asSafeInt(1000000);
const b = asSafeInt(500);

const diff = SafeInt.sub(a, b); // SafeInt (999500)
const quotient = SafeInt.div(a, b); // SafeInt (2000)
const power = SafeInt.pow(b, asSafeInt(2)); // SafeInt (250000)

// Utility operations
const absolute = SafeInt.abs(asSafeInt(-42)); // SafeInt (42)
const clamped = SafeInt.clamp(2 ** 60); // SafeInt (MAX_SAFE_INTEGER)

// Random generation
const die = SafeInt.random(asSafeInt(1), asSafeInt(6)); // Random 1-6
```
