[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/uint32

# number/branded-types/uint32

## Variables

### asUint32()

> `const` **asUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/uint32.mts:53](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint32.mts#L53)

Casts a number to a Uint32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a Uint32 type.

#### Throws

If the value is not a non-negative integer less than 2^32.

#### Example

```typescript
const x = asUint32(1000000); // Uint32
const y = asUint32(0); // Uint32
// asUint32(-1); // throws TypeError
// asUint32(5000000000); // throws TypeError
```

---

### isUint32()

> `const` **isUint32**: (`a`) => `a is Uint32` = `is`

Defined in: [src/number/branded-types/uint32.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint32.mts#L38)

Checks if a number is a Uint32 (32-bit unsigned integer in the range [0, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is Uint32`

`true` if the value is a Uint32, `false` otherwise.

---

### Uint32

> `const` **Uint32**: `object`

Defined in: [src/number/branded-types/uint32.mts:88](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint32.mts#L88)

Utility functions for working with Uint32 (32-bit unsigned integer) branded types.
Provides type-safe operations that ensure results remain within the valid range [0, 2^32).
All arithmetic operations are clamped to maintain the Uint32 constraint.

#### Type Declaration

##### add()

> **add**: (`x`, `y`) => `Uint32`

Adds two Uint32 values, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint32`

`a + b` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.add(asUint32(1000000), asUint32(500000)); // Uint32 (1500000)
```

##### clamp()

> **clamp**: (`x`) => `Uint32`

Clamps a Uint32 to be within the specified range.

###### Parameters

###### x

`number`

###### Returns

`Uint32`

The clamped value as a Uint32

###### Example

```typescript
Uint32.clamp(asUint32(5000000000), Uint32.MIN_VALUE, asUint32(1000)); // Uint32 (1000)
```

##### div()

> **div**: (`x`, `y`) => `Uint32`

Divides two Uint32 values using floor division, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`Uint32`\>

###### Returns

`Uint32`

`⌊a / b⌋` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.div(asUint32(1000000), asUint32(500000)); // Uint32 (2)
Uint32.div(asUint32(7), asUint32(3)); // Uint32 (2) - floor division
```

##### is()

> **is**: (`a`) => `a is Uint32`

Type guard that checks if a value is a 32-bit unsigned integer.

###### Parameters

###### a

`number`

###### Returns

`a is Uint32`

`true` if the value is within the range [0, 2^32), `false` otherwise

##### max()

> `readonly` **max**: (...`values`) => `Uint32` = `max_`

Returns the maximum of multiple Uint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Uint32`, `40`\>[]

The Uint32 values to compare

###### Returns

`Uint32`

The largest value as a Uint32

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a Uint32.

##### min()

> `readonly` **min**: (...`values`) => `Uint32` = `min_`

Returns the minimum of multiple Uint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Uint32`, `40`\>[]

The Uint32 values to compare

###### Returns

`Uint32`

The smallest value as a Uint32

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a Uint32.

##### mul()

> **mul**: (`x`, `y`) => `Uint32`

Multiplies two Uint32 values, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint32`

`a * b` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.mul(asUint32(1000), asUint32(500)); // Uint32 (500000)
```

##### pow()

> **pow**: (`x`, `y`) => `Uint32`

Raises a Uint32 to a power, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint32`

`a ** b` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.pow(asUint32(2), asUint32(10)); // Uint32 (1024)
```

##### random()

> **random**: (`min?`, `max?`) => `Uint32`

Generates a random Uint32 value.

###### Parameters

###### min?

`WithSmallInt`\<`Uint32`, `40`\>

###### max?

`WithSmallInt`\<`Uint32`, `40`\>

###### Returns

`Uint32`

A random Uint32 value within [0, 2^32)

##### sub()

> **sub**: (`x`, `y`) => `Uint32`

Subtracts two Uint32 values, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint32`

`a - b` as a Uint32, clamped to valid range (minimum 0)

###### Example

```typescript
Uint32.sub(asUint32(1000000), asUint32(500000)); // Uint32 (500000)
Uint32.sub(asUint32(100), asUint32(500)); // Uint32 (0) - clamped
```

#### Example

```typescript
// Type checking
Uint32.is(1000000); // true
Uint32.is(-1); // false
Uint32.is(5000000000); // false (exceeds 2^32)

// Constants
console.log(Uint32.MIN_VALUE); // 0
console.log(Uint32.MAX_VALUE); // 4294967295 (2^32 - 1)

// Arithmetic operations (all results clamped to [0, 2^32))
const a = asUint32(1000000);
const b = asUint32(500000);

Uint32.add(a, b); // Uint32 (1500000)
Uint32.sub(a, b); // Uint32 (500000)
Uint32.mul(a, b); // Uint32 (clamped if overflow)
Uint32.div(a, b); // Uint32 (2)
Uint32.pow(asUint32(2), asUint32(10)); // Uint32 (1024)

// Utility functions
Uint32.min(a, b); // Uint32 (500000)
Uint32.max(a, b); // Uint32 (1000000)
Uint32.clamp(asUint32(5000000000), Uint32.MIN_VALUE, Uint32.MAX_VALUE); // Uint32 (MAX_VALUE)
Uint32.random(); // Random Uint32
```
