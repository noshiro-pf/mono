[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/uint

# number/branded-types/uint

## Variables

### asUint()

> `const` **asUint**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/uint.mts:52](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint.mts#L52)

Casts a number to a Uint type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a Uint type.

#### Throws

If the value is not a non-negative integer.

#### Example

```typescript
const x = asUint(5); // Uint
const y = asUint(0); // Uint
// asUint(-1); // throws TypeError
// asUint(1.5); // throws TypeError
```

---

### isUint()

> `const` **isUint**: (`a`) => `a is NonNegativeInt` = `is`

Defined in: [src/number/branded-types/uint.mts:37](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint.mts#L37)

Checks if a number is a Uint.

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt`

`true` if the value is a Uint, `false` otherwise.

---

### Uint

> `const` **Uint**: `object`

Defined in: [src/number/branded-types/uint.mts:81](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/uint.mts#L81)

Namespace providing type-safe arithmetic operations for unsigned integers.

All operations maintain the non-negative constraint by clamping negative results to 0.
This ensures that all arithmetic preserves the unsigned integer property.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `NonNegativeInt`

Adds two Uint values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt`

`a + b` clamped to [0, +∞) as a Uint.

##### clamp()

> **clamp**: (`x`) => `NonNegativeInt`

Clamps a number to the Uint range (non-negative).

###### Parameters

###### x

`number`

###### Returns

`NonNegativeInt`

The value clamped to [0, +∞) as a Uint.

##### div()

> **div**: (`x`, `y`) => `NonNegativeInt`

Divides one Uint by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`NonNegativeInt`\>

###### Returns

`NonNegativeInt`

`⌊a / b⌋` clamped to [0, +∞) as a Uint.

##### is()

> **is**: (`a`) => `a is NonNegativeInt`

Type guard to check if a value is a Uint.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeInt`

`true` if the value is a non-negative integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt` = `max_`

Returns the larger of two Uint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt`, `40`\>[]

###### Returns

`NonNegativeInt`

The maximum value as a Uint.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeInt` = `min_`

Returns the smaller of two Uint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt`, `40`\>[]

###### Returns

`NonNegativeInt`

The minimum value as a Uint.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for an unsigned integer.

##### mul()

> **mul**: (`x`, `y`) => `NonNegativeInt`

Multiplies two Uint values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt`

`a * b` clamped to [0, +∞) as a Uint.

##### pow()

> **pow**: (`x`, `y`) => `NonNegativeInt`

Raises a Uint to the power of another Uint.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt`

`a ** b` clamped to [0, +∞) as a Uint.

##### random()

> **random**: (`min?`, `max?`) => `NonNegativeInt`

Generates a random Uint value.

###### Parameters

###### min?

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### max?

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### Returns

`NonNegativeInt`

A random non-negative integer as a Uint.

##### sub()

> **sub**: (`x`, `y`) => `NonNegativeInt`

Subtracts one Uint from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt`

`a - b` clamped to [0, +∞) as a Uint (minimum 0).

#### Example

```typescript
const a = asUint(100);
const b = asUint(150);

// Arithmetic operations with non-negative clamping
const sum = Uint.add(a, b); // Uint (250)
const diff = Uint.sub(a, b); // Uint (0 - clamped to MIN_VALUE)
const product = Uint.mul(a, b); // Uint (15000)
const quotient = Uint.div(b, a); // Uint (1)

// Range operations
const clamped = Uint.clamp(-50); // Uint (0)
const minimum = Uint.min(a, b); // Uint (100)
const maximum = Uint.max(a, b); // Uint (150)

// Utility operations
const random = Uint.random(); // Uint (random non-negative integer)
const power = Uint.pow(asUint(2), asUint(8)); // Uint (256)
```
