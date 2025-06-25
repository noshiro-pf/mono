[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/uint16

# number/branded-types/uint16

## Variables

### asUint16()

> `const` **asUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/uint16.mts:53](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint16.mts#L53)

Casts a number to a Uint16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a Uint16 type.

#### Throws

If the value is not a non-negative integer less than 2^16.

#### Example

```typescript
const x = asUint16(1000); // Uint16
const y = asUint16(0); // Uint16
// asUint16(-1); // throws TypeError
// asUint16(70000); // throws TypeError
```

---

### isUint16()

> `const` **isUint16**: (`a`) => `a is Uint16` = `is`

Defined in: [src/number/branded-types/uint16.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint16.mts#L38)

Checks if a number is a Uint16 (16-bit unsigned integer in the range [0, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is Uint16`

`true` if the value is a Uint16, `false` otherwise.

---

### Uint16

> `const` **Uint16**: `object`

Defined in: [src/number/branded-types/uint16.mts:82](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint16.mts#L82)

Namespace providing type-safe arithmetic operations for 16-bit unsigned integers.

All operations automatically clamp results to the valid Uint16 range [0, 65535].
This ensures that all arithmetic maintains the 16-bit unsigned integer constraint,
with negative results clamped to 0 and overflow results clamped to MAX_VALUE.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `Uint16`

Adds two Uint16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint16`

`a + b` clamped to [0, 65535] as a Uint16.

##### clamp()

> **clamp**: (`x`) => `Uint16`

Clamps a number to the Uint16 range.

###### Parameters

###### x

`number`

###### Returns

`Uint16`

The value clamped to [0, 65535] as a Uint16.

##### div()

> **div**: (`x`, `y`) => `Uint16`

Divides one Uint16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`Uint16`\>

###### Returns

`Uint16`

`⌊a / b⌋` clamped to [0, 65535] as a Uint16.

##### is()

> **is**: (`a`) => `a is Uint16`

Type guard to check if a value is a Uint16.

###### Parameters

###### a

`number`

###### Returns

`a is Uint16`

`true` if the value is a 16-bit unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Uint16` = `max_`

Returns the larger of two Uint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Uint16`, `40`\>[]

###### Returns

`Uint16`

The maximum value as a Uint16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `Uint16` = `min_`

Returns the smaller of two Uint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Uint16`, `40`\>[]

###### Returns

`Uint16`

The minimum value as a Uint16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a 16-bit unsigned integer.

##### mul()

> **mul**: (`x`, `y`) => `Uint16`

Multiplies two Uint16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint16`

`a * b` clamped to [0, 65535] as a Uint16.

##### pow()

> **pow**: (`x`, `y`) => `Uint16`

Raises a Uint16 to the power of another Uint16.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint16`

`a ** b` clamped to [0, 65535] as a Uint16.

##### random()

> **random**: (`min?`, `max?`) => `Uint16`

Generates a random Uint16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`Uint16`, `40`\>

###### max?

`WithSmallInt`\<`Uint16`, `40`\>

###### Returns

`Uint16`

A random Uint16 between 0 and 65535.

##### sub()

> **sub**: (`x`, `y`) => `Uint16`

Subtracts one Uint16 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`Uint16`

`a - b` clamped to [0, 65535] as a Uint16 (minimum 0).

#### Example

```typescript
const a = asUint16(60000);
const b = asUint16(10000);

// Arithmetic operations with automatic clamping
const sum = Uint16.add(a, b); // Uint16 (65535 - clamped to MAX_VALUE)
const diff = Uint16.sub(b, a); // Uint16 (0 - clamped to MIN_VALUE)
const product = Uint16.mul(a, b); // Uint16 (65535 - clamped due to overflow)

// Range operations
const clamped = Uint16.clamp(-100); // Uint16 (0)
const minimum = Uint16.min(a, b); // Uint16 (10000)
const maximum = Uint16.max(a, b); // Uint16 (60000)

// Utility operations
const random = Uint16.random(); // Uint16 (random value in [0, 65535])
const power = Uint16.pow(asUint16(2), asUint16(10)); // Uint16 (1024)
```
