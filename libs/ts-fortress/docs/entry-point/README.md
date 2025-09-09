[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / entry-point

# entry-point

## Namespaces

- [Result](namespaces/Result.md)

## Type Aliases

### Result\<S, E\>

> **Result**\<`S`, `E`\> = `Ok_`\<`S`\> \| `Err_`\<`E`\>

Defined in: node_modules/ts-data-forge/dist/functional/result.d.mts:39

Represents a value that can either be a success (`Ok`) or an error (`Err`).

#### Type Parameters

##### S

`S`

The type of the success value.

##### E

`E`

The type of the error value.

## Variables

### asFiniteNumber()

> `const` **asFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/finite-number.d.mts:48

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

### asInt()

> `const` **asInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int.d.mts:46

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

### asInt16()

> `const` **asInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int16.d.mts:21

Casts a number to an Int16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int16 type.

#### Throws

If the value is not an integer in [-2^15, 2^15).

#### Example

```typescript
const x = asInt16(1000); // Int16
const y = asInt16(-5000); // Int16
// asInt16(50000); // throws TypeError
// asInt16(1.5); // throws TypeError
```

---

### asInt32()

> `const` **asInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int32.d.mts:21

Casts a number to an Int32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int32 type.

#### Throws

If the value is not an integer in [-2^31, 2^31).

#### Example

```typescript
const x = asInt32(100000); // Int32
const y = asInt32(-500000); // Int32
// asInt32(3000000000); // throws TypeError
// asInt32(1.5); // throws TypeError
```

---

### asInt8()

> `const` **asInt8**: (`x`) => `Int8`

Defined in: node_modules/ts-data-forge/dist/number/enum/int8.d.mts:46

Casts a number to an Int8 branded type.

This function validates that the input is within the Int8 range [-128, 127]
and is an integer, then returns it with the Int8 brand.

#### Parameters

##### x

`number`

#### Returns

`Int8`

The value as an Int8 branded type

#### Throws

If the value is not a valid 8-bit signed integer

#### Example

```typescript
const byte = asInt8(100); // Int8
const max = asInt8(127); // Int8 (maximum value)
const min = asInt8(-128); // Int8 (minimum value)
const zero = asInt8(0); // Int8

// These throw TypeError:
// asInt8(128);               // Exceeds maximum (127)
// asInt8(-129);              // Below minimum (-128)
// asInt8(1.5);               // Not an integer
// asInt8(NaN);               // Not a number
```

---

### asNonNegativeFiniteNumber()

> `const` **asNonNegativeFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-finite-number.d.mts:22

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

### asNonNegativeInt16()

> `const` **asNonNegativeInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-int16.d.mts:20

Casts a number to a NonNegativeInt16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeInt16 type.

#### Throws

If the value is not a non-negative integer in [0, 2^15).

#### Example

```typescript
const x = asNonNegativeInt16(1000); // NonNegativeInt16
const y = asNonNegativeInt16(0); // NonNegativeInt16
// asNonNegativeInt16(-1); // throws TypeError
// asNonNegativeInt16(32768); // throws TypeError
```

---

### asNonNegativeInt32()

> `const` **asNonNegativeInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-int32.d.mts:20

Casts a number to a NonNegativeInt32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeInt32 type.

#### Throws

If the value is not a non-negative integer in [0, 2^31).

#### Example

```typescript
const x = asNonNegativeInt32(1000); // NonNegativeInt32
const y = asNonNegativeInt32(0); // NonNegativeInt32
// asNonNegativeInt32(-1); // throws TypeError
// asNonNegativeInt32(2147483648); // throws TypeError
```

---

### asNonZeroFiniteNumber()

> `const` **asNonZeroFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-finite-number.d.mts:22

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

### asNonZeroInt()

> `const` **asNonZeroInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int.d.mts:21

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

### asNonZeroInt16()

> `const` **asNonZeroInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int16.d.mts:21

Casts a number to a NonZeroInt16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt16 type.

#### Throws

If the value is not a non-zero integer in [-2^15, 2^15).

#### Example

```typescript
const x = asNonZeroInt16(1000); // NonZeroInt16
const y = asNonZeroInt16(-1000); // NonZeroInt16
// asNonZeroInt16(0); // throws TypeError
// asNonZeroInt16(32768); // throws TypeError
```

---

### asNonZeroInt32()

> `const` **asNonZeroInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int32.d.mts:21

Casts a number to a NonZeroInt32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt32 type.

#### Throws

If the value is not a non-zero integer in [-2^31, 2^31).

#### Example

```typescript
const x = asNonZeroInt32(1000); // NonZeroInt32
const y = asNonZeroInt32(-1000); // NonZeroInt32
// asNonZeroInt32(0); // throws TypeError
// asNonZeroInt32(2147483648); // throws TypeError
```

---

### asNonZeroSafeInt()

> `const` **asNonZeroSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-safe-int.d.mts:21

Casts a number to a NonZeroSafeInt type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroSafeInt type.

#### Throws

If the value is not a non-zero safe integer.

#### Example

```typescript
const x = asNonZeroSafeInt(5); // NonZeroSafeInt
const y = asNonZeroSafeInt(-1000); // NonZeroSafeInt
// asNonZeroSafeInt(0); // throws TypeError
// asNonZeroSafeInt(1.5); // throws TypeError
```

---

### asNonZeroUint16()

> `const` **asNonZeroUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-uint16.d.mts:21

Casts a number to a NonZeroUint16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroUint16 type.

#### Throws

If the value is not a non-zero integer in [1, 2^16).

#### Example

```typescript
const x = asNonZeroUint16(1000); // NonZeroUint16
const y = asNonZeroUint16(65535); // NonZeroUint16
// asNonZeroUint16(0); // throws TypeError
// asNonZeroUint16(-1); // throws TypeError
// asNonZeroUint16(65536); // throws TypeError
```

---

### asNonZeroUint32()

> `const` **asNonZeroUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-uint32.d.mts:21

Casts a number to a NonZeroUint32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroUint32 type.

#### Throws

If the value is not a non-zero integer in [1, 2^32).

#### Example

```typescript
const x = asNonZeroUint32(1000); // NonZeroUint32
const y = asNonZeroUint32(4294967295); // NonZeroUint32
// asNonZeroUint32(0); // throws TypeError
// asNonZeroUint32(-1); // throws TypeError
// asNonZeroUint32(4294967296); // throws TypeError
```

---

### asPositiveFiniteNumber()

> `const` **asPositiveFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-finite-number.d.mts:22

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

### asPositiveInt()

> `const` **asPositiveInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int.d.mts:45

Casts a number to a PositiveInt branded type.

This function validates that the input is a positive integer (>= 1)
and returns it with the PositiveInt brand. This ensures type safety
for operations that require strictly positive integer values.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt branded type

#### Throws

If the value is not a positive integer

#### Example

```typescript
const count = asPositiveInt(5); // PositiveInt
const length = asPositiveInt(100); // PositiveInt
const one = asPositiveInt(1); // PositiveInt (minimum valid)

// These throw TypeError:
// asPositiveInt(0);                 // Zero is not positive
// asPositiveInt(-1);                // Negative numbers not allowed
// asPositiveInt(5.5);               // Not an integer
// asPositiveInt(Infinity);          // Not finite
```

---

### asPositiveInt16()

> `const` **asPositiveInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int16.d.mts:21

Casts a number to a PositiveInt16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt16 type.

#### Throws

If the value is not a positive integer in [1, 2^15).

#### Example

```typescript
const x = asPositiveInt16(1000); // PositiveInt16
const y = asPositiveInt16(32767); // PositiveInt16
// asPositiveInt16(0); // throws TypeError
// asPositiveInt16(-1); // throws TypeError
// asPositiveInt16(32768); // throws TypeError
```

---

### asPositiveInt32()

> `const` **asPositiveInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int32.d.mts:21

Casts a number to a PositiveInt32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt32 type.

#### Throws

If the value is not a positive integer in [1, 2^31).

#### Example

```typescript
const x = asPositiveInt32(1000); // PositiveInt32
const y = asPositiveInt32(2147483647); // PositiveInt32
// asPositiveInt32(0); // throws TypeError
// asPositiveInt32(-1); // throws TypeError
// asPositiveInt32(2147483648); // throws TypeError
```

---

### asPositiveSafeInt()

> `const` **asPositiveSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-safe-int.d.mts:20

Casts a number to a PositiveSafeInt type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveSafeInt type.

#### Throws

If the value is not a positive safe integer.

#### Example

```typescript
const x = asPositiveSafeInt(5); // PositiveSafeInt
const y = asPositiveSafeInt(1000); // PositiveSafeInt
// asPositiveSafeInt(0); // throws TypeError
// asPositiveSafeInt(-1); // throws TypeError
```

---

### asPositiveUint16()

> `const` **asPositiveUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-uint16.d.mts:21

Casts a number to a PositiveUint16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveUint16 type.

#### Throws

If the value is not a positive integer in [1, 2^16).

#### Example

```typescript
const x = asPositiveUint16(1000); // PositiveUint16
const y = asPositiveUint16(65535); // PositiveUint16
// asPositiveUint16(0); // throws TypeError
// asPositiveUint16(-1); // throws TypeError
// asPositiveUint16(65536); // throws TypeError
```

---

### asPositiveUint32()

> `const` **asPositiveUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-uint32.d.mts:21

Casts a number to a PositiveUint32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveUint32 type.

#### Throws

If the value is not a positive integer in [1, 2^32).

#### Example

```typescript
const x = asPositiveUint32(1000); // PositiveUint32
const y = asPositiveUint32(4294967295); // PositiveUint32
// asPositiveUint32(0); // throws TypeError
// asPositiveUint32(-1); // throws TypeError
// asPositiveUint32(4294967296); // throws TypeError
```

---

### asSafeInt()

> `const` **asSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/safe-int.d.mts:44

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

### asSafeUint()

> `const` **asSafeUint**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/safe-uint.d.mts:20

Casts a number to a SafeUint type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a SafeUint type.

#### Throws

If the value is not a non-negative safe integer.

#### Example

```typescript
const x = asSafeUint(5); // SafeUint
const y = asSafeUint(0); // SafeUint
// asSafeUint(-1); // throws TypeError
// asSafeUint(1.5); // throws TypeError
```

---

### asUint()

> `const` **asUint**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint.d.mts:20

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

### asUint16()

> `const` **asUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint16.d.mts:20

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

### asUint32()

> `const` **asUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint32.d.mts:20

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

### asUint8()

> `const` **asUint8**: (`x`) => `Uint8`

Defined in: node_modules/ts-data-forge/dist/number/enum/uint8.d.mts:21

Casts a number to a Uint8 type.

#### Parameters

##### x

`number`

#### Returns

`Uint8`

The value as a Uint8 type.

#### Throws

If the value is not a valid 8-bit unsigned integer.

#### Example

```typescript
const x = asUint8(255); // Uint8
const y = asUint8(0); // Uint8
// asUint8(-1); // throws TypeError
// asUint8(256); // throws TypeError
// asUint8(1.5); // throws TypeError
```

---

### FiniteNumber

> `const` **FiniteNumber**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/finite-number.d.mts:98

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

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`FiniteNumber`\>

Returns the absolute value of a finite number.

###### Parameters

###### x

`FiniteNumber`

The finite number to get the absolute value of

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`FiniteNumber`\>

The absolute value as a FiniteNumber

###### Example

```typescript
FiniteNumber.abs(asFiniteNumber(-5.5)); // FiniteNumber (5.5)
FiniteNumber.abs(asFiniteNumber(3.2)); // FiniteNumber (3.2)
```

##### add()

> `readonly` **add**: (`x`, `y`) => `FiniteNumber`

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

> `readonly` **ceil**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Returns the smallest integer greater than or equal to the given finite number.

###### Parameters

###### x

`ElementType`

The finite number to ceil

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The ceiling value as an Int

###### Example

```typescript
FiniteNumber.ceil(asFiniteNumber(5.2)); // Int (6)
FiniteNumber.ceil(asFiniteNumber(-5.8)); // Int (-5)
```

##### div()

> `readonly` **div**: (`x`, `y`) => `FiniteNumber`

Divides two finite numbers.

The divisor must be non-zero (enforced by type constraints).
The result is guaranteed to be finite when both inputs are finite
and the divisor is non-zero.

###### Parameters

###### x

`FiniteNumber`

###### y

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>

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

> `readonly` **floor**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Returns the largest integer less than or equal to the given finite number.

###### Parameters

###### x

`ElementType`

The finite number to floor

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The floor value as an Int

###### Example

```typescript
FiniteNumber.floor(asFiniteNumber(5.8)); // Int (5)
FiniteNumber.floor(asFiniteNumber(-5.2)); // Int (-6)
```

##### is()

> `readonly` **is**: (`a`) => `a is FiniteNumber`

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

> `readonly` **max**: (...`values`) => `FiniteNumber`

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

> `readonly` **min**: (...`values`) => `FiniteNumber`

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

> `readonly` **mul**: (`x`, `y`) => `FiniteNumber`

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

> `readonly` **pow**: (`x`, `y`) => `FiniteNumber`

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

> `readonly` **random**: (`min?`, `max?`) => `FiniteNumber`

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

> `readonly` **round**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds a finite number to the nearest integer.

###### Parameters

###### x

`ElementType`

The finite number to round

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The rounded value as an Int

###### Example

```typescript
FiniteNumber.round(asFiniteNumber(5.4)); // Int (5)
FiniteNumber.round(asFiniteNumber(5.6)); // Int (6)
FiniteNumber.round(asFiniteNumber(5.5)); // Int (6)
```

##### sub()

> `readonly` **sub**: (`x`, `y`) => `FiniteNumber`

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

### Int

> `const` **Int**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int.d.mts:90

Namespace providing type-safe operations for Int branded types.

The Int type represents any integer value (no fractional component) without
range restrictions. All operations preserve the integer constraint, using
floor division for division operations.

Unlike SafeInt, Int allows values outside the safe integer range
(±2^53 - 1), but be aware that very large integers may lose precision
in JavaScript's number type.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int`\>

Returns the absolute value of an integer.

The result is always non-negative and maintains the Int brand.
Note that Math.abs(Number.MIN_SAFE_INTEGER) exceeds Number.MAX_SAFE_INTEGER,
so use SafeInt for guaranteed precision.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int`\>

The absolute value as a non-negative Int

###### Example

```typescript
Int.abs(asInt(-5)); // Int (5)
Int.abs(asInt(3)); // Int (3)
Int.abs(asInt(-0)); // Int (0)
```

##### add()

> `readonly` **add**: (`x`, `y`) => `Int`

Adds two integers.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### y

`WithSmallInt`\<`Int`, `40`\>

###### Returns

`Int`

`a + b` as an Int

###### Example

```typescript
Int.add(asInt(5), asInt(3)); // Int (8)
```

##### div()

> `readonly` **div**: (`x`, `y`) => `Int`

Divides two integers using floor division.

Performs mathematical floor division: `⌊a / b⌋`.
The result is always an integer, rounding toward negative infinity.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

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

> `readonly` **is**: (`a`) => `a is Int`

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

> `readonly` **max**: (...`values`) => `Int`

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

> `readonly` **min**: (...`values`) => `Int`

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

> `readonly` **mul**: (`x`, `y`) => `Int`

Multiplies two integers.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### y

`WithSmallInt`\<`Int`, `40`\>

###### Returns

`Int`

`a * b` as an Int

###### Example

```typescript
Int.mul(asInt(4), asInt(3)); // Int (12)
```

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Int`

Raises an integer to a power.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### y

`WithSmallInt`\<`Int`, `40`\>

###### Returns

`Int`

`a ** b` as an Int

###### Example

```typescript
Int.pow(asInt(2), asInt(3)); // Int (8)
```

##### random()

> `readonly` **random**: (`min?`, `max?`) => `Int`

Generates a random integer within the specified range (inclusive).

The range is inclusive on both ends, so random(1, 6) can return
any of: 1, 2, 3, 4, 5, or 6.

###### Parameters

###### min?

`WithSmallInt`\<`Int`, `40`\>

The minimum value (inclusive)

###### max?

`WithSmallInt`\<`Int`, `40`\>

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

> `readonly` **sub**: (`x`, `y`) => `Int`

Subtracts two integers.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### y

`WithSmallInt`\<`Int`, `40`\>

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

### Int16

> `const` **Int16**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int16.d.mts:62

Namespace providing type-safe arithmetic operations for 16-bit signed integers.

All operations automatically clamp results to the valid Int16 range [-32768, 32767].
This ensures that all arithmetic maintains the 16-bit signed integer constraint.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int16`\>

Returns the absolute value of a 16-bit signed integer.

###### Parameters

###### x

`WithSmallInt`\<`Int16`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int16`\>

The absolute value as an Int16, clamped to valid range.

##### add()

> `readonly` **add**: (`x`, `y`) => `Int16`

Adds two Int16 values.

###### Parameters

###### x

`WithSmallInt`\<`Int16`, `40`\>

###### y

`WithSmallInt`\<`Int16`, `40`\>

###### Returns

`Int16`

`a + b` clamped to [-32768, 32767] as an Int16.

##### clamp()

> `readonly` **clamp**: (`x`) => `Int16`

Clamps a number to the Int16 range.

###### Parameters

###### x

`number`

###### Returns

`Int16`

The value clamped to [-32768, 32767] as an Int16.

##### div()

> `readonly` **div**: (`x`, `y`) => `Int16`

Divides one Int16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`Int16`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`Int16`

`⌊a / b⌋` clamped to [-32768, 32767] as an Int16.

##### is()

> `readonly` **is**: (`a`) => `a is Int16`

Type guard to check if a value is an Int16.

###### Parameters

###### a

`number`

###### Returns

`a is Int16`

`true` if the value is a 16-bit signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Int16`

Returns the larger of two Int16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int16`, `40`\>[]

###### Returns

`Int16`

The maximum value as an Int16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit signed integer.

##### min()

> `readonly` **min**: (...`values`) => `Int16`

Returns the smaller of two Int16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int16`, `40`\>[]

###### Returns

`Int16`

The minimum value as an Int16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 16-bit signed integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `Int16`

Multiplies two Int16 values.

###### Parameters

###### x

`WithSmallInt`\<`Int16`, `40`\>

###### y

`WithSmallInt`\<`Int16`, `40`\>

###### Returns

`Int16`

`a * b` clamped to [-32768, 32767] as an Int16.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Int16`

Raises an Int16 to the power of another Int16.

###### Parameters

###### x

`WithSmallInt`\<`Int16`, `40`\>

###### y

`WithSmallInt`\<`Int16`, `40`\>

###### Returns

`Int16`

`a ** b` clamped to [-32768, 32767] as an Int16.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `Int16`

Generates a random Int16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`Int16`, `40`\>

###### max?

`WithSmallInt`\<`Int16`, `40`\>

###### Returns

`Int16`

A random Int16 between MIN_VALUE and MAX_VALUE.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `Int16`

Subtracts one Int16 from another.

###### Parameters

###### x

`WithSmallInt`\<`Int16`, `40`\>

###### y

`WithSmallInt`\<`Int16`, `40`\>

###### Returns

`Int16`

`a - b` clamped to [-32768, 32767] as an Int16.

#### Example

```typescript
const a = asInt16(30000);
const b = asInt16(5000);

// Arithmetic operations with automatic clamping
const sum = Int16.add(a, b); // Int16 (32767 - clamped to MAX_VALUE)
const diff = Int16.sub(a, b); // Int16 (25000)
const product = Int16.mul(a, b); // Int16 (32767 - clamped due to overflow)

// Range operations
const clamped = Int16.clamp(100000); // Int16 (32767)
const minimum = Int16.min(a, b); // Int16 (5000)
const maximum = Int16.max(a, b); // Int16 (30000)

// Range constants
const range = Int16.MAX_VALUE - Int16.MIN_VALUE + 1; // 65536
```

---

### Int32

> `const` **Int32**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int32.d.mts:59

Namespace providing type-safe arithmetic operations for 32-bit signed integers.

All operations automatically clamp results to the valid Int32 range [-2147483648, 2147483647].
This ensures that all arithmetic maintains the 32-bit signed integer constraint, preventing overflow.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int32`\>

Returns the absolute value of a 32-bit signed integer.

###### Parameters

###### x

`WithSmallInt`\<`Int32`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int32`\>

The absolute value as an Int32, clamped to valid range.

##### add()

> `readonly` **add**: (`x`, `y`) => `Int32`

Adds two Int32 values.

###### Parameters

###### x

`WithSmallInt`\<`Int32`, `40`\>

###### y

`WithSmallInt`\<`Int32`, `40`\>

###### Returns

`Int32`

`a + b` clamped to [-2147483648, 2147483647] as an Int32.

##### clamp()

> `readonly` **clamp**: (`x`) => `Int32`

Clamps a number to the Int32 range.

###### Parameters

###### x

`number`

###### Returns

`Int32`

The value clamped to [-2147483648, 2147483647] as an Int32.

##### div()

> `readonly` **div**: (`x`, `y`) => `Int32`

Divides one Int32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`Int32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`Int32`

`⌊a / b⌋` clamped to [-2147483648, 2147483647] as an Int32.

##### is()

> `readonly` **is**: (`a`) => `a is Int32`

Type guard to check if a value is an Int32.

###### Parameters

###### a

`number`

###### Returns

`a is Int32`

`true` if the value is a 32-bit signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Int32`

Returns the larger of two Int32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int32`, `40`\>[]

###### Returns

`Int32`

The maximum value as an Int32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit signed integer.

##### min()

> `readonly` **min**: (...`values`) => `Int32`

Returns the smaller of two Int32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Int32`, `40`\>[]

###### Returns

`Int32`

The minimum value as an Int32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 32-bit signed integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `Int32`

Multiplies two Int32 values.

###### Parameters

###### x

`WithSmallInt`\<`Int32`, `40`\>

###### y

`WithSmallInt`\<`Int32`, `40`\>

###### Returns

`Int32`

`a * b` clamped to [-2147483648, 2147483647] as an Int32.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Int32`

Raises an Int32 to the power of another Int32.

###### Parameters

###### x

`WithSmallInt`\<`Int32`, `40`\>

###### y

`WithSmallInt`\<`Int32`, `40`\>

###### Returns

`Int32`

`a ** b` clamped to [-2147483648, 2147483647] as an Int32.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `Int32`

Generates a random Int32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`Int32`, `40`\>

###### max?

`WithSmallInt`\<`Int32`, `40`\>

###### Returns

`Int32`

A random Int32 between MIN_VALUE and MAX_VALUE.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `Int32`

Subtracts one Int32 from another.

###### Parameters

###### x

`WithSmallInt`\<`Int32`, `40`\>

###### y

`WithSmallInt`\<`Int32`, `40`\>

###### Returns

`Int32`

`a - b` clamped to [-2147483648, 2147483647] as an Int32.

#### Example

```typescript
const a = asInt32(2000000000);
const b = asInt32(500000000);

// Arithmetic operations with automatic clamping
const sum = Int32.add(a, b); // Int32 (2147483647 - clamped to MAX_VALUE)
const diff = Int32.sub(a, b); // Int32 (1500000000)
const product = Int32.mul(a, b); // Int32 (2147483647 - clamped due to overflow)

// Range operations
const clamped = Int32.clamp(5000000000); // Int32 (2147483647)
const minimum = Int32.min(a, b); // Int32 (500000000)
const maximum = Int32.max(a, b); // Int32 (2000000000)

// Utility operations
const absolute = Int32.abs(asInt32(-1000)); // Int32 (1000)
const random = Int32.random(); // Int32 (random value in valid range)
```

---

### Int8

> `const` **Int8**: `object`

Defined in: node_modules/ts-data-forge/dist/number/enum/int8.d.mts:88

Namespace providing type-safe operations for Int8 (8-bit signed integer) branded types.

Int8 represents signed integers in the range [-128, 127], equivalent to a signed
byte in many programming languages. All operations automatically clamp results
to stay within this range, preventing overflow/underflow issues.

This type is useful for:

- Binary data processing (signed bytes)
- Small integer values with known bounds
- Embedded systems programming
- Memory-efficient integer storage
- Image processing (signed pixel offsets)

#### Type Declaration

##### abs()

> `readonly` **abs**: \<`N`\>(`x`) => `AbsoluteValue`\<`N`\>

Returns the absolute value of an Int8.

###### Type Parameters

###### N

`N` _extends_ `Int8`

###### Parameters

###### x

`N`

###### Returns

`AbsoluteValue`\<`N`\>

The absolute value as an Int8, clamped to valid range.

##### add()

> `readonly` **add**: (`x`, `y`) => `Int8`

Adds two Int8 values.

###### Parameters

###### x

`Int8`

###### y

`Int8`

###### Returns

`Int8`

`a + b` clamped to [-128, 127] as an Int8.

##### clamp()

> `readonly` **clamp**: (`a`) => `Int8`

Clamps a number to the Int8 range.

###### Parameters

###### a

`number`

###### Returns

`Int8`

The value clamped to [-128, 127] as an Int8.

##### div()

> `readonly` **div**: (`x`, `y`) => `Int8`

Divides one Int8 by another using floor division.

###### Parameters

###### x

`Int8`

###### y

`Exclude`\<`Int8`, `0`\>

###### Returns

`Int8`

`⌊a / b⌋` clamped to [-128, 127] as an Int8.

##### is()

> `readonly` **is**: (`x`) => `x is Int8`

Type guard that checks if a value is an 8-bit signed integer.

###### Parameters

###### x

`number`

###### Returns

`x is Int8`

`true` if the value is in range [-128, 127] and is an integer

###### See

[isInt8](#isint8) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `Int8`

Returns the maximum value from a list of Int8 values.

###### Parameters

###### values

...readonly `Int8`[]

The Int8 values to compare (at least one required)

###### Returns

`Int8`

The largest value as an Int8

###### Example

```typescript
Int8.max(asInt8(50), asInt8(-30), asInt8(100)); // Int8 (100)
```

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `127`

The maximum value for an 8-bit signed integer.

##### min()

> `readonly` **min**: (...`values`) => `Int8`

Returns the minimum value from a list of Int8 values.

###### Parameters

###### values

...readonly `Int8`[]

The Int8 values to compare (at least one required)

###### Returns

`Int8`

The smallest value as an Int8

###### Example

```typescript
Int8.min(asInt8(50), asInt8(-30), asInt8(100)); // Int8 (-30)
```

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `-128`

The minimum value for an 8-bit signed integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `Int8`

Multiplies two Int8 values.

###### Parameters

###### x

`Int8`

###### y

`Int8`

###### Returns

`Int8`

`a * b` clamped to [-128, 127] as an Int8.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Int8`

Raises an Int8 to the power of another Int8.

###### Parameters

###### x

`Int8`

###### y

`Int8`

###### Returns

`Int8`

`a ** b` clamped to [-128, 127] as an Int8.

##### random()

> `readonly` **random**: (`min`, `max`) => `Int8`

Generates a random Int8 value within the specified range (inclusive).

Both bounds are inclusive. If min > max, they are automatically swapped.

###### Parameters

###### min

`Int8`

The minimum value (inclusive)

###### max

`Int8`

The maximum value (inclusive)

###### Returns

`Int8`

A random Int8 in the range [min, max]

###### Example

```typescript
// Random signed byte
const randomByte = Int8.random(Int8.MIN_VALUE, Int8.MAX_VALUE);

// Random small range
const dice = Int8.random(asInt8(1), asInt8(6)); // 1-6

// Random offset
const offset = Int8.random(asInt8(-10), asInt8(10)); // -10 to 10
```

##### sub()

> `readonly` **sub**: (`x`, `y`) => `Int8`

Subtracts one Int8 from another.

###### Parameters

###### x

`Int8`

###### y

`Int8`

###### Returns

`Int8`

`a - b` clamped to [-128, 127] as an Int8.

#### Example

```typescript
// Basic usage
const a = asInt8(100);
const b = asInt8(50);

// Arithmetic with automatic clamping
const sum = Int8.add(a, b); // Int8 (127) - clamped to maximum
const diff = Int8.sub(a, b); // Int8 (50)
const product = Int8.mul(a, b); // Int8 (127) - clamped due to overflow
const quotient = Int8.div(a, b); // Int8 (2)

// Boundary handling
const overflow = Int8.add(asInt8(127), asInt8(10)); // Int8 (127) - clamped
const underflow = Int8.sub(asInt8(-128), asInt8(10)); // Int8 (-128) - clamped

// Utility operations
const clamped = Int8.clamp(200); // Int8 (127)
const absolute = Int8.abs(asInt8(-100)); // Int8 (100)
const minimum = Int8.min(a, b); // Int8 (50)
const maximum = Int8.max(a, b); // Int8 (100)

// Random generation
const die = Int8.random(asInt8(1), asInt8(6)); // Random 1-6
const offset = Int8.random(asInt8(-10), asInt8(10)); // Random ±10
```

---

### isBigint()

> `const` **isBigint**: (`u`) => `u is bigint`

Defined in: node_modules/ts-data-forge/dist/guard/is-type.d.mts:171

Type guard that checks if a value is a bigint.

**Type Narrowing Behavior:**

- Narrows `unknown` to `bigint` when `true`
- Identifies values created with `BigInt()` constructor or `n` suffix

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is bigint`

`true` if `u` is a bigint, `false` otherwise.
When `true`, TypeScript narrows the type to `bigint`.

#### Example

```typescript
const userInput: unknown = parseInput();

if (isBigint(userInput)) {
    // userInput is now typed as bigint
    console.log('BigInt value:', userInput.toString());
    const doubled = userInput * 2n; // Safe bigint operations
}
```

---

### isFiniteNumber()

> `const` **isFiniteNumber**: (`a`) => `a is FiniteNumber`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/finite-number.d.mts:23

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

---

### isInt()

> `const` **isInt**: (`a`) => `a is Int`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int.d.mts:22

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

---

### isInt16()

> `const` **isInt16**: (`a`) => `a is Int16`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int16.d.mts:7

Checks if a number is an Int16 (16-bit signed integer in the range [-2^15, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is Int16`

`true` if the value is an Int16, `false` otherwise.

---

### isInt32()

> `const` **isInt32**: (`a`) => `a is Int32`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/int32.d.mts:7

Checks if a number is an Int32 (32-bit signed integer in the range [-2^31, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is Int32`

`true` if the value is an Int32, `false` otherwise.

---

### isInt8()

> `const` **isInt8**: (`x`) => `x is Int8`

Defined in: node_modules/ts-data-forge/dist/number/enum/int8.d.mts:21

Type guard that checks if a value is an 8-bit signed integer.

An Int8 is a signed integer in the range [-128, 127], representing
values that fit in exactly 8 bits of memory.

#### Parameters

##### x

`number`

#### Returns

`x is Int8`

`true` if the value is an Int8, `false` otherwise

#### Example

```typescript
isInt8(100); // true
isInt8(-50); // true
isInt8(127); // true (max value)
isInt8(-128); // true (min value)
isInt8(128); // false (exceeds max)
isInt8(-129); // false (below min)
isInt8(5.5); // false (not integer)
```

---

### isNonNegativeFiniteNumber()

> `const` **isNonNegativeFiniteNumber**: (`a`) => `a is NonNegativeFiniteNumber`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-finite-number.d.mts:8

Checks if a number is a NonNegativeFiniteNumber (a finite number >= 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeFiniteNumber`

`true` if the value is a NonNegativeFiniteNumber, `false` otherwise.

---

### isNonNegativeInt16()

> `const` **isNonNegativeInt16**: (`a`) => `a is NonNegativeInt16`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-int16.d.mts:6

Checks if a number is a NonNegativeInt16 (16-bit non-negative signed integer in the range [0, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt16`

`true` if the value is a NonNegativeInt16, `false` otherwise.

---

### isNonNegativeInt32()

> `const` **isNonNegativeInt32**: (`a`) => `a is NonNegativeInt32`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-int32.d.mts:6

Checks if a number is a NonNegativeInt32 (32-bit non-negative signed integer in the range [0, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt32`

`true` if the value is a NonNegativeInt32, `false` otherwise.

---

### isNonZeroFiniteNumber()

> `const` **isNonZeroFiniteNumber**: (`a`) => `a is NonZeroFiniteNumber`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-finite-number.d.mts:8

Checks if a number is a NonZeroFiniteNumber (a finite number that is not 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroFiniteNumber`

`true` if the value is a NonZeroFiniteNumber, `false` otherwise.

---

### isNonZeroInt()

> `const` **isNonZeroInt**: (`a`) => `a is NonZeroInt`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int.d.mts:7

Checks if a number is a NonZeroInt.

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt`

`true` if the value is a NonZeroInt, `false` otherwise.

---

### isNonZeroInt16()

> `const` **isNonZeroInt16**: (`a`) => `a is NonZeroInt16`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int16.d.mts:7

Checks if a number is a NonZeroInt16 (16-bit non-zero signed integer in the range [-2^15, 2^15) excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt16`

`true` if the value is a NonZeroInt16, `false` otherwise.

---

### isNonZeroInt32()

> `const` **isNonZeroInt32**: (`a`) => `a is NonZeroInt32`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int32.d.mts:7

Checks if a number is a NonZeroInt32 (32-bit non-zero signed integer in the range [-2^31, 2^31) excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt32`

`true` if the value is a NonZeroInt32, `false` otherwise.

---

### isNonZeroSafeInt()

> `const` **isNonZeroSafeInt**: (`a`) => `a is NonZeroSafeInt`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-safe-int.d.mts:7

Checks if a number is a NonZeroSafeInt (a non-zero safe integer in the range [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroSafeInt`

`true` if the value is a NonZeroSafeInt, `false` otherwise.

---

### isNonZeroUint16()

> `const` **isNonZeroUint16**: (`a`) => `a is PositiveUint16`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-uint16.d.mts:6

Checks if a number is a NonZeroUint16 (16-bit non-zero unsigned integer in the range [1, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint16`

`true` if the value is a NonZeroUint16, `false` otherwise.

---

### isNonZeroUint32()

> `const` **isNonZeroUint32**: (`a`) => `a is PositiveUint32`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-uint32.d.mts:6

Checks if a number is a NonZeroUint32 (32-bit non-zero unsigned integer in the range [1, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint32`

`true` if the value is a NonZeroUint32, `false` otherwise.

---

### isPositiveFiniteNumber()

> `const` **isPositiveFiniteNumber**: (`a`) => `a is PositiveFiniteNumber`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-finite-number.d.mts:8

Checks if a number is a PositiveFiniteNumber (a finite number > 0).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveFiniteNumber`

`true` if the value is a PositiveFiniteNumber, `false` otherwise.

---

### isPositiveInt()

> `const` **isPositiveInt**: (`a`) => `a is PositiveInt`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int.d.mts:20

Type guard that checks if a value is a positive integer.

A positive integer is any integer greater than zero (>= 1).
This excludes zero, negative numbers, and non-integers.

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt`

`true` if the value is a positive integer, `false` otherwise

#### Example

```typescript
isPositiveInt(5); // true
isPositiveInt(1); // true
isPositiveInt(0); // false (zero is not positive)
isPositiveInt(-1); // false (negative)
isPositiveInt(5.5); // false (not an integer)
isPositiveInt(NaN); // false
```

---

### isPositiveInt16()

> `const` **isPositiveInt16**: (`a`) => `a is PositiveInt16`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int16.d.mts:6

Checks if a number is a PositiveInt16 (16-bit positive signed integer in the range [1, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt16`

`true` if the value is a PositiveInt16, `false` otherwise.

---

### isPositiveInt32()

> `const` **isPositiveInt32**: (`a`) => `a is PositiveInt32`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int32.d.mts:6

Checks if a number is a PositiveInt32 (32-bit positive signed integer in the range [1, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt32`

`true` if the value is a PositiveInt32, `false` otherwise.

---

### isPositiveSafeInt()

> `const` **isPositiveSafeInt**: (`a`) => `a is PositiveSafeInt`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-safe-int.d.mts:6

Checks if a number is a PositiveSafeInt (a positive safe integer in the range [1, MAX_SAFE_INTEGER]).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveSafeInt`

`true` if the value is a PositiveSafeInt, `false` otherwise.

---

### isPositiveUint16()

> `const` **isPositiveUint16**: (`a`) => `a is PositiveUint16`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-uint16.d.mts:6

Checks if a number is a PositiveUint16 (16-bit positive unsigned integer in the range [1, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint16`

`true` if the value is a PositiveUint16, `false` otherwise.

---

### isPositiveUint32()

> `const` **isPositiveUint32**: (`a`) => `a is PositiveUint32`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-uint32.d.mts:6

Checks if a number is a PositiveUint32 (32-bit positive unsigned integer in the range [1, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint32`

`true` if the value is a PositiveUint32, `false` otherwise.

---

### isSafeInt()

> `const` **isSafeInt**: (`a`) => `a is SafeInt`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/safe-int.d.mts:20

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

### isSafeUint()

> `const` **isSafeUint**: (`a`) => `a is SafeUint`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/safe-uint.d.mts:6

Checks if a number is a SafeUint.

#### Parameters

##### a

`number`

#### Returns

`a is SafeUint`

`true` if the value is a SafeUint, `false` otherwise.

---

### isUint()

> `const` **isUint**: (`a`) => `a is NonNegativeInt`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint.d.mts:6

Checks if a number is a Uint.

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt`

`true` if the value is a Uint, `false` otherwise.

---

### isUint16()

> `const` **isUint16**: (`a`) => `a is Uint16`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint16.d.mts:6

Checks if a number is a Uint16 (16-bit unsigned integer in the range [0, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is Uint16`

`true` if the value is a Uint16, `false` otherwise.

---

### isUint32()

> `const` **isUint32**: (`a`) => `a is Uint32`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint32.d.mts:6

Checks if a number is a Uint32 (32-bit unsigned integer in the range [0, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is Uint32`

`true` if the value is a Uint32, `false` otherwise.

---

### isUint8()

> `const` **isUint8**: (`x`) => `x is Uint8`

Defined in: node_modules/ts-data-forge/dist/number/enum/uint8.d.mts:6

Checks if a number is a Uint8 (8-bit unsigned integer in the range [0, 255]).

#### Parameters

##### x

`number`

#### Returns

`x is Uint8`

`true` if the value is a Uint8, `false` otherwise.

---

### NonNegativeFiniteNumber

> `const` **NonNegativeFiniteNumber**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-finite-number.d.mts:62

Namespace providing type-safe arithmetic operations for non-negative finite numbers.

All operations maintain the non-negative constraint by clamping negative results to 0,
while ensuring results remain finite (excluding NaN and Infinity). This type is useful
for representing measurements, distances, weights, and other inherently non-negative values.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `NonNegativeFiniteNumber`

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

> `readonly` **ceil**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds up a NonNegativeFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The NonNegativeFiniteNumber to round up.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The ceiling value as a Uint.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonNegativeFiniteNumber`

Clamps a number to the non-negative finite range.

###### Parameters

###### x

`number`

###### Returns

`NonNegativeFiniteNumber`

The value clamped to [0, +∞) as a NonNegativeFiniteNumber.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonNegativeFiniteNumber`

Divides one NonNegativeFiniteNumber by another.

###### Parameters

###### x

`NonNegativeFiniteNumber`

###### y

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>

###### Returns

`NonNegativeFiniteNumber`

`a / b` clamped to [0, +∞) as a NonNegativeFiniteNumber.

##### floor()

> `readonly` **floor**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds down a NonNegativeFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The NonNegativeFiniteNumber to round down.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The floor value as a Uint.

##### is()

> `readonly` **is**: (`a`) => `a is NonNegativeFiniteNumber`

Type guard to check if a value is a NonNegativeFiniteNumber.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeFiniteNumber`

`true` if the value is a non-negative finite number, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeFiniteNumber`

Returns the larger of two NonNegativeFiniteNumber values.

###### Parameters

###### values

...readonly `NonNegativeFiniteNumber`[]

###### Returns

`NonNegativeFiniteNumber`

The maximum value as a NonNegativeFiniteNumber.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeFiniteNumber`

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

> `readonly` **mul**: (`x`, `y`) => `NonNegativeFiniteNumber`

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

> `readonly` **pow**: (`x`, `y`) => `NonNegativeFiniteNumber`

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

> `readonly` **random**: (`min?`, `max?`) => `NonNegativeFiniteNumber`

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

> `readonly` **round**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds a NonNegativeFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The NonNegativeFiniteNumber to round.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The rounded value as a Uint.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `NonNegativeFiniteNumber`

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

---

### NonNegativeInt16

> `const` **NonNegativeInt16**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-int16.d.mts:65

Namespace providing type-safe arithmetic operations for 16-bit non-negative integers.

All operations automatically clamp results to the valid NonNegativeInt16 range [0, 32767].
This ensures that all arithmetic maintains the 16-bit non-negative integer constraint,
with negative results clamped to 0 and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `NonNegativeInt16`

Adds two NonNegativeInt16 values.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### Returns

`NonNegativeInt16`

`a + b` clamped to [0, 32767] as a NonNegativeInt16.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonNegativeInt16`

Clamps a number to the NonNegativeInt16 range.

###### Parameters

###### x

`number`

###### Returns

`NonNegativeInt16`

The value clamped to [0, 32767] as a NonNegativeInt16.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonNegativeInt16`

Divides one NonNegativeInt16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`NonNegativeInt16`

`⌊a / b⌋` clamped to [0, 32767] as a NonNegativeInt16.

##### is()

> `readonly` **is**: (`a`) => `a is NonNegativeInt16`

Type guard to check if a value is a NonNegativeInt16.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeInt16`

`true` if the value is a 16-bit non-negative integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt16`

Returns the larger of two NonNegativeInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt16`, `40`\>[]

###### Returns

`NonNegativeInt16`

The maximum value as a NonNegativeInt16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit non-negative integer.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeInt16`

Returns the smaller of two NonNegativeInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt16`, `40`\>[]

###### Returns

`NonNegativeInt16`

The minimum value as a NonNegativeInt16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a 16-bit non-negative integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `NonNegativeInt16`

Multiplies two NonNegativeInt16 values.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### Returns

`NonNegativeInt16`

`a * b` clamped to [0, 32767] as a NonNegativeInt16.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `NonNegativeInt16`

Raises a NonNegativeInt16 to the power of another NonNegativeInt16.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### Returns

`NonNegativeInt16`

`a ** b` clamped to [0, 32767] as a NonNegativeInt16.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `NonNegativeInt16`

Generates a random NonNegativeInt16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### max?

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### Returns

`NonNegativeInt16`

A random NonNegativeInt16 between 0 and 32767.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `NonNegativeInt16`

Subtracts one NonNegativeInt16 from another.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### Returns

`NonNegativeInt16`

`a - b` clamped to [0, 32767] as a NonNegativeInt16 (minimum 0).

#### Example

```typescript
const a = asNonNegativeInt16(30000);
const b = asNonNegativeInt16(5000);

// Arithmetic operations with automatic clamping
const sum = NonNegativeInt16.add(a, b); // NonNegativeInt16 (32767 - clamped to MAX_VALUE)
const diff = NonNegativeInt16.sub(a, b); // NonNegativeInt16 (25000)
const reverseDiff = NonNegativeInt16.sub(b, a); // NonNegativeInt16 (0 - clamped to MIN_VALUE)
const product = NonNegativeInt16.mul(a, b); // NonNegativeInt16 (32767 - clamped due to overflow)

// Range operations
const clamped = NonNegativeInt16.clamp(-100); // NonNegativeInt16 (0)
const minimum = NonNegativeInt16.min(a, b); // NonNegativeInt16 (5000)
const maximum = NonNegativeInt16.max(a, b); // NonNegativeInt16 (30000)

// Utility operations
const random = NonNegativeInt16.random(); // NonNegativeInt16 (random value in [0, 32767])
const power = NonNegativeInt16.pow(
    asNonNegativeInt16(2),
    asNonNegativeInt16(10),
); // NonNegativeInt16 (1024)
```

---

### NonNegativeInt32

> `const` **NonNegativeInt32**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-negative-int32.d.mts:63

Namespace providing type-safe arithmetic operations for 32-bit non-negative integers.

All operations automatically clamp results to the valid NonNegativeInt32 range [0, 2147483647].
This ensures that all arithmetic maintains the 32-bit non-negative integer constraint,
with negative results clamped to 0 and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `NonNegativeInt32`

Adds two NonNegativeInt32 values.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### Returns

`NonNegativeInt32`

`a + b` clamped to [0, 2147483647] as a NonNegativeInt32.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonNegativeInt32`

Clamps a number to the NonNegativeInt32 range.

###### Parameters

###### x

`number`

###### Returns

`NonNegativeInt32`

The value clamped to [0, 2147483647] as a NonNegativeInt32.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonNegativeInt32`

Divides one NonNegativeInt32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`NonNegativeInt32`

`⌊a / b⌋` clamped to [0, 2147483647] as a NonNegativeInt32.

##### is()

> `readonly` **is**: (`a`) => `a is NonNegativeInt32`

Type guard to check if a value is a NonNegativeInt32.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeInt32`

`true` if the value is a 32-bit non-negative integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt32`

Returns the larger of two NonNegativeInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt32`, `40`\>[]

###### Returns

`NonNegativeInt32`

The maximum value as a NonNegativeInt32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit non-negative integer.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeInt32`

Returns the smaller of two NonNegativeInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt32`, `40`\>[]

###### Returns

`NonNegativeInt32`

The minimum value as a NonNegativeInt32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a 32-bit non-negative integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `NonNegativeInt32`

Multiplies two NonNegativeInt32 values.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### Returns

`NonNegativeInt32`

`a * b` clamped to [0, 2147483647] as a NonNegativeInt32.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `NonNegativeInt32`

Raises a NonNegativeInt32 to the power of another NonNegativeInt32.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### Returns

`NonNegativeInt32`

`a ** b` clamped to [0, 2147483647] as a NonNegativeInt32.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `NonNegativeInt32`

Generates a random NonNegativeInt32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### max?

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### Returns

`NonNegativeInt32`

A random NonNegativeInt32 between 0 and 2147483647.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `NonNegativeInt32`

Subtracts one NonNegativeInt32 from another.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### Returns

`NonNegativeInt32`

`a - b` clamped to [0, 2147483647] as a NonNegativeInt32 (minimum 0).

#### Example

```typescript
const a = asNonNegativeInt32(2000000000);
const b = asNonNegativeInt32(500000000);

// Arithmetic operations with automatic clamping
const sum = NonNegativeInt32.add(a, b); // NonNegativeInt32 (2147483647 - clamped to MAX_VALUE)
const diff = NonNegativeInt32.sub(a, b); // NonNegativeInt32 (1500000000)
const reverseDiff = NonNegativeInt32.sub(b, a); // NonNegativeInt32 (0 - clamped to MIN_VALUE)
const product = NonNegativeInt32.mul(a, b); // NonNegativeInt32 (2147483647 - clamped due to overflow)

// Range operations
const clamped = NonNegativeInt32.clamp(-1000); // NonNegativeInt32 (0)
const minimum = NonNegativeInt32.min(a, b); // NonNegativeInt32 (500000000)
const maximum = NonNegativeInt32.max(a, b); // NonNegativeInt32 (2000000000)

// Utility operations
const random = NonNegativeInt32.random(); // NonNegativeInt32 (random value in [0, 2147483647])
const power = NonNegativeInt32.pow(
    asNonNegativeInt32(2),
    asNonNegativeInt32(20),
); // NonNegativeInt32 (1048576)
```

---

### NonZeroFiniteNumber

> `const` **NonZeroFiniteNumber**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-finite-number.d.mts:61

Namespace providing type-safe arithmetic operations for non-zero finite numbers.

All operations maintain the non-zero constraint while ensuring results remain finite
(excluding NaN and Infinity). This type is useful for values that must never be zero,
such as denominators, scaling factors, and ratios.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroFiniteNumber`\>

Returns the absolute value of a non-zero finite number.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroFiniteNumber`\>

The absolute value as a NonZeroFiniteNumber.

##### add()

> `readonly` **add**: (`x`, `y`) => `NonZeroFiniteNumber`

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

> `readonly` **ceil**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds up a NonZeroFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The NonZeroFiniteNumber to round up.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The ceiling value as a NonZeroInt.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonZeroFiniteNumber`

Divides one NonZeroFiniteNumber by another.

###### Parameters

###### x

`NonZeroFiniteNumber`

###### y

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>

###### Returns

`NonZeroFiniteNumber`

`a / b` as a NonZeroFiniteNumber.

##### floor()

> `readonly` **floor**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds down a NonZeroFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The NonZeroFiniteNumber to round down.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The floor value as a NonZeroInt.

##### is()

> `readonly` **is**: (`a`) => `a is NonZeroFiniteNumber`

Type guard to check if a value is a NonZeroFiniteNumber.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroFiniteNumber`

`true` if the value is a non-zero finite number, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroFiniteNumber`

Returns the larger of two NonZeroFiniteNumber values.

###### Parameters

###### values

...readonly `NonZeroFiniteNumber`[]

###### Returns

`NonZeroFiniteNumber`

The maximum value as a NonZeroFiniteNumber.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroFiniteNumber`

Returns the smaller of two NonZeroFiniteNumber values.

###### Parameters

###### values

...readonly `NonZeroFiniteNumber`[]

###### Returns

`NonZeroFiniteNumber`

The minimum value as a NonZeroFiniteNumber.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `NonZeroFiniteNumber`

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

> `readonly` **pow**: (`x`, `y`) => `NonZeroFiniteNumber`

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

> `readonly` **random**: (`min?`, `max?`) => `NonZeroFiniteNumber`

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

> `readonly` **round**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds a NonZeroFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The NonZeroFiniteNumber to round.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The rounded value as a NonZeroInt.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `NonZeroFiniteNumber`

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

---

### NonZeroInt

> `const` **NonZeroInt**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int.d.mts:56

Namespace providing type-safe arithmetic operations for non-zero integers.

All operations maintain the non-zero constraint, ensuring that results are always valid NonZeroInt values.
Division operations return floor division results, and all arithmetic maintains integer precision.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroInt`\>

Returns the absolute value of a non-zero integer.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroInt`\>

The absolute value as a NonZeroInt.

##### add()

> `readonly` **add**: (`x`, `y`) => `NonZeroInt`

Adds two non-zero integers.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### Returns

`NonZeroInt`

`a + b` as a NonZeroInt.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonZeroInt`

Divides one non-zero integer by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`NonZeroInt`

`⌊a / b⌋` as a NonZeroInt.

##### is()

> `readonly` **is**: (`a`) => `a is NonZeroInt`

Type guard to check if a value is a NonZeroInt.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroInt`

`true` if the value is a non-zero integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt`

Returns the larger of two non-zero integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt`, `40`\>[]

###### Returns

`NonZeroInt`

The maximum value as a NonZeroInt.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroInt`

Returns the smaller of two non-zero integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt`, `40`\>[]

###### Returns

`NonZeroInt`

The minimum value as a NonZeroInt.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `NonZeroInt`

Multiplies two non-zero integers.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### Returns

`NonZeroInt`

`a * b` as a NonZeroInt.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `NonZeroInt`

Raises a non-zero integer to the power of another non-zero integer.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### Returns

`NonZeroInt`

`a ** b` as a NonZeroInt.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `NonZeroInt`

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

> `readonly` **sub**: (`x`, `y`) => `NonZeroInt`

Subtracts one non-zero integer from another.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt`, `40`\>

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

---

### NonZeroInt16

> `const` **NonZeroInt16**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int16.d.mts:66

Namespace providing type-safe arithmetic operations for 16-bit non-zero signed integers.

All operations automatically clamp results to the valid NonZeroInt16 range [-32768, 32767]
excluding 0. This ensures that all arithmetic maintains the 16-bit non-zero signed integer
constraint, preventing zero results and overflow.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroInt16`\>

Returns the absolute value of a 16-bit non-zero signed integer.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroInt16`\>

The absolute value as a NonZeroInt16, clamped to valid range.

##### add()

> `readonly` **add**: (`x`, `y`) => `NonZeroInt16`

Adds two NonZeroInt16 values.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### Returns

`NonZeroInt16`

`a + b` clamped to [-32768, 32767] as a NonZeroInt16.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonZeroInt16`

Clamps a number to the NonZeroInt16 range (avoiding zero).

###### Parameters

###### x

`number`

###### Returns

`NonZeroInt16`

The value clamped to [-32768, 32767] \ {0} as a NonZeroInt16.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonZeroInt16`

Divides one NonZeroInt16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`NonZeroInt16`

`⌊a / b⌋` clamped to [-32768, 32767] as a NonZeroInt16.

##### is()

> `readonly` **is**: (`a`) => `a is NonZeroInt16`

Type guard to check if a value is a NonZeroInt16.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroInt16`

`true` if the value is a 16-bit non-zero signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt16`

Returns the larger of two NonZeroInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt16`, `40`\>[]

###### Returns

`NonZeroInt16`

The maximum value as a NonZeroInt16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit non-zero signed integer.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroInt16`

Returns the smaller of two NonZeroInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt16`, `40`\>[]

###### Returns

`NonZeroInt16`

The minimum value as a NonZeroInt16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 16-bit non-zero signed integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `NonZeroInt16`

Multiplies two NonZeroInt16 values.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### Returns

`NonZeroInt16`

`a * b` clamped to [-32768, 32767] as a NonZeroInt16.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `NonZeroInt16`

Raises a NonZeroInt16 to the power of another NonZeroInt16.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### Returns

`NonZeroInt16`

`a ** b` clamped to [-32768, 32767] as a NonZeroInt16.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `NonZeroInt16`

Generates a random NonZeroInt16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### max?

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### Returns

`NonZeroInt16`

A random NonZeroInt16 between MIN_VALUE and MAX_VALUE (excluding 0).

##### sub()

> `readonly` **sub**: (`x`, `y`) => `NonZeroInt16`

Subtracts one NonZeroInt16 from another.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt16`, `40`\>

###### Returns

`NonZeroInt16`

`a - b` clamped to [-32768, 32767] as a NonZeroInt16.

#### Example

```typescript
const a = asNonZeroInt16(30000);
const b = asNonZeroInt16(-10000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroInt16.add(a, b); // NonZeroInt16 (20000)
const diff = NonZeroInt16.sub(a, b); // NonZeroInt16 (32767 - clamped to MAX_VALUE)
const product = NonZeroInt16.mul(a, b); // NonZeroInt16 (-32768 - clamped to MIN_VALUE)

// Utility operations
const absolute = NonZeroInt16.abs(b); // NonZeroInt16 (10000)
const minimum = NonZeroInt16.min(a, b); // NonZeroInt16 (-10000)
const maximum = NonZeroInt16.max(a, b); // NonZeroInt16 (30000)

// Range operations (avoiding zero)
const clamped = NonZeroInt16.clamp(0); // NonZeroInt16 (1 or -1, avoiding zero)
const random = NonZeroInt16.random(); // NonZeroInt16 (random non-zero value in range)
const power = NonZeroInt16.pow(asNonZeroInt16(2), asNonZeroInt16(10)); // NonZeroInt16 (1024)
```

---

### NonZeroInt32

> `const` **NonZeroInt32**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-int32.d.mts:62

Namespace providing type-safe arithmetic operations for 32-bit non-zero signed integers.

All operations automatically clamp results to the valid NonZeroInt32 range [-2147483648, 2147483647]
excluding 0. This ensures that all arithmetic maintains the 32-bit non-zero signed integer
constraint, preventing zero results and overflow.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroInt32`\>

Returns the absolute value of a 32-bit non-zero signed integer.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroInt32`\>

The absolute value as a NonZeroInt32, clamped to valid range.

##### add()

> `readonly` **add**: (`x`, `y`) => `NonZeroInt32`

Adds two NonZeroInt32 values.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### Returns

`NonZeroInt32`

`a + b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonZeroInt32`

Clamps a number to the NonZeroInt32 range (avoiding zero).

###### Parameters

###### x

`number`

###### Returns

`NonZeroInt32`

The value clamped to [-2147483648, 2147483647] \ {0} as a NonZeroInt32.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonZeroInt32`

Divides one NonZeroInt32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`NonZeroInt32`

`⌊a / b⌋` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### is()

> `readonly` **is**: (`a`) => `a is NonZeroInt32`

Type guard to check if a value is a NonZeroInt32.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroInt32`

`true` if the value is a 32-bit non-zero signed integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt32`

Returns the larger of two NonZeroInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt32`, `40`\>[]

###### Returns

`NonZeroInt32`

The maximum value as a NonZeroInt32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit non-zero signed integer.

##### min()

> `readonly` **min**: (...`values`) => `NonZeroInt32`

Returns the smaller of two NonZeroInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt32`, `40`\>[]

###### Returns

`NonZeroInt32`

The minimum value as a NonZeroInt32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `number`

The minimum value for a 32-bit non-zero signed integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `NonZeroInt32`

Multiplies two NonZeroInt32 values.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### Returns

`NonZeroInt32`

`a * b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `NonZeroInt32`

Raises a NonZeroInt32 to the power of another NonZeroInt32.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### Returns

`NonZeroInt32`

`a ** b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `NonZeroInt32`

Generates a random NonZeroInt32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### max?

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### Returns

`NonZeroInt32`

A random NonZeroInt32 between MIN_VALUE and MAX_VALUE (excluding 0).

##### sub()

> `readonly` **sub**: (`x`, `y`) => `NonZeroInt32`

Subtracts one NonZeroInt32 from another.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### y

`WithSmallInt`\<`NonZeroInt32`, `40`\>

###### Returns

`NonZeroInt32`

`a - b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.

#### Example

```typescript
const a = asNonZeroInt32(2000000000);
const b = asNonZeroInt32(-500000000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroInt32.add(a, b); // NonZeroInt32 (1500000000)
const diff = NonZeroInt32.sub(a, b); // NonZeroInt32 (2147483647 - clamped to MAX_VALUE)
const product = NonZeroInt32.mul(a, b); // NonZeroInt32 (-2147483648 - clamped to MIN_VALUE)

// Utility operations
const absolute = NonZeroInt32.abs(b); // NonZeroInt32 (500000000)
const minimum = NonZeroInt32.min(a, b); // NonZeroInt32 (-500000000)
const maximum = NonZeroInt32.max(a, b); // NonZeroInt32 (2000000000)

// Range operations (avoiding zero)
const clamped = NonZeroInt32.clamp(0); // NonZeroInt32 (1 or -1, avoiding zero)
const random = NonZeroInt32.random(); // NonZeroInt32 (random non-zero value in range)
const power = NonZeroInt32.pow(asNonZeroInt32(2), asNonZeroInt32(20)); // NonZeroInt32 (1048576)
```

---

### NonZeroSafeInt

> `const` **NonZeroSafeInt**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-safe-int.d.mts:56

Namespace providing type-safe arithmetic operations for non-zero safe integers.

All operations automatically clamp results to the non-zero safe integer range, excluding zero.
This ensures that all arithmetic maintains both the non-zero constraint and IEEE 754 precision guarantees,
preventing precision loss while ensuring results are never zero.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroSafeInt`\>

Returns the absolute value of a non-zero safe integer.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`NonZeroSafeInt`\>

The absolute value as a NonZeroSafeInt, clamped to safe range.

##### add()

> `readonly` **add**: (`x`, `y`) => `NonZeroSafeInt`

Adds two NonZeroSafeInt values.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### Returns

`NonZeroSafeInt`

`a + b` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonZeroSafeInt`

Clamps a number to the non-zero safe integer range.

###### Parameters

###### x

`number`

###### Returns

`NonZeroSafeInt`

The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] \ {0} as a NonZeroSafeInt.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonZeroSafeInt`

Divides one NonZeroSafeInt by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`NonZeroSafeInt`

`⌊a / b⌋` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### is()

> `readonly` **is**: (`a`) => `a is NonZeroSafeInt`

Type guard to check if a value is a NonZeroSafeInt.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroSafeInt`

`true` if the value is a non-zero safe integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroSafeInt`

Returns the larger of two NonZeroSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroSafeInt`, `40`\>[]

###### Returns

`NonZeroSafeInt`

The maximum value as a NonZeroSafeInt.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `SafeUint`

The maximum safe integer value (2^53 - 1).

##### min()

> `readonly` **min**: (...`values`) => `NonZeroSafeInt`

Returns the smaller of two NonZeroSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroSafeInt`, `40`\>[]

###### Returns

`NonZeroSafeInt`

The minimum value as a NonZeroSafeInt.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `SafeInt`

The minimum safe integer value (-(2^53 - 1)).

##### mul()

> `readonly` **mul**: (`x`, `y`) => `NonZeroSafeInt`

Multiplies two NonZeroSafeInt values.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### Returns

`NonZeroSafeInt`

`a * b` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `NonZeroSafeInt`

Raises a NonZeroSafeInt to the power of another NonZeroSafeInt.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### Returns

`NonZeroSafeInt`

`a ** b` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `NonZeroSafeInt`

Generates a random NonZeroSafeInt value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### max?

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### Returns

`NonZeroSafeInt`

A random non-zero safe integer between MIN_SAFE_INTEGER and MAX_SAFE_INTEGER.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `NonZeroSafeInt`

Subtracts one NonZeroSafeInt from another.

###### Parameters

###### x

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### y

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### Returns

`NonZeroSafeInt`

`a - b` clamped to non-zero safe integer range as a NonZeroSafeInt.

#### Example

```typescript
const a = asNonZeroSafeInt(9007199254740000); // Near MAX_SAFE_INTEGER
const b = asNonZeroSafeInt(-1000);

// Arithmetic operations with non-zero safe range clamping
const sum = NonZeroSafeInt.add(a, b); // NonZeroSafeInt (9007199254739000)
const diff = NonZeroSafeInt.sub(a, b); // NonZeroSafeInt (clamped to MAX_SAFE_INTEGER)
const product = NonZeroSafeInt.mul(a, b); // NonZeroSafeInt (clamped to MIN_SAFE_INTEGER)

// Utility operations
const absolute = NonZeroSafeInt.abs(b); // NonZeroSafeInt (1000)
const minimum = NonZeroSafeInt.min(a, b); // NonZeroSafeInt (-1000)
const maximum = NonZeroSafeInt.max(a, b); // NonZeroSafeInt (a)

// Random generation
const random = NonZeroSafeInt.random(); // NonZeroSafeInt (random non-zero safe integer)
```

---

### NonZeroUint16

> `const` **NonZeroUint16**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-uint16.d.mts:66

Namespace providing type-safe arithmetic operations for 16-bit non-zero unsigned integers.

All operations automatically clamp results to the valid NonZeroUint16 range [1, 65535].
This ensures that all arithmetic maintains the 16-bit non-zero unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveUint16`

Adds two NonZeroUint16 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a + b` clamped to [1, 65535] as a NonZeroUint16.

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveUint16`

Clamps a number to the NonZeroUint16 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint16`

The value clamped to [1, 65535] as a NonZeroUint16.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveUint16`

Divides one NonZeroUint16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveUint16`

`⌊a / b⌋` clamped to [1, 65535] as a NonZeroUint16.

##### is()

> `readonly` **is**: (`a`) => `a is PositiveUint16`

Type guard to check if a value is a NonZeroUint16.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint16`

`true` if the value is a 16-bit non-zero unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint16`

Returns the larger of two NonZeroUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The maximum value as a NonZeroUint16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit non-zero unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint16`

Returns the smaller of two NonZeroUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The minimum value as a NonZeroUint16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 16-bit non-zero unsigned integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveUint16`

Multiplies two NonZeroUint16 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a * b` clamped to [1, 65535] as a NonZeroUint16.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveUint16`

Raises a NonZeroUint16 to the power of another NonZeroUint16.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a ** b` clamped to [1, 65535] as a NonZeroUint16.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveUint16`

Generates a random NonZeroUint16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### max?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

A random NonZeroUint16 between 1 and 65535.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveUint16`

Subtracts one NonZeroUint16 from another.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a - b` clamped to [1, 65535] as a NonZeroUint16 (minimum 1).

#### Example

```typescript
const a = asNonZeroUint16(60000);
const b = asNonZeroUint16(10000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroUint16.add(a, b); // NonZeroUint16 (65535 - clamped to MAX_VALUE)
const diff = NonZeroUint16.sub(a, b); // NonZeroUint16 (50000)
const reverseDiff = NonZeroUint16.sub(b, a); // NonZeroUint16 (1 - clamped to MIN_VALUE)
const product = NonZeroUint16.mul(a, b); // NonZeroUint16 (65535 - clamped due to overflow)

// Range operations (maintaining non-zero constraint)
const clamped = NonZeroUint16.clamp(-100); // NonZeroUint16 (1)
const minimum = NonZeroUint16.min(a, b); // NonZeroUint16 (10000)
const maximum = NonZeroUint16.max(a, b); // NonZeroUint16 (60000)

// Utility operations
const random = NonZeroUint16.random(); // NonZeroUint16 (random value in [1, 65535])
const power = NonZeroUint16.pow(asNonZeroUint16(2), asNonZeroUint16(10)); // NonZeroUint16 (1024)
```

---

### NonZeroUint32

> `const` **NonZeroUint32**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/non-zero-uint32.d.mts:64

Namespace providing type-safe arithmetic operations for 32-bit non-zero unsigned integers.

All operations automatically clamp results to the valid NonZeroUint32 range [1, 4294967295].
This ensures that all arithmetic maintains the 32-bit non-zero unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveUint32`

Adds two NonZeroUint32 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a + b` clamped to [1, 4294967295] as a NonZeroUint32.

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveUint32`

Clamps a number to the NonZeroUint32 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint32`

The value clamped to [1, 4294967295] as a NonZeroUint32.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveUint32`

Divides one NonZeroUint32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveUint32`

`⌊a / b⌋` clamped to [1, 4294967295] as a NonZeroUint32.

##### is()

> `readonly` **is**: (`a`) => `a is PositiveUint32`

Type guard to check if a value is a NonZeroUint32.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint32`

`true` if the value is a 32-bit non-zero unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint32`

Returns the larger of two NonZeroUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The maximum value as a NonZeroUint32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit non-zero unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint32`

Returns the smaller of two NonZeroUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The minimum value as a NonZeroUint32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 32-bit non-zero unsigned integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveUint32`

Multiplies two NonZeroUint32 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a * b` clamped to [1, 4294967295] as a NonZeroUint32.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveUint32`

Raises a NonZeroUint32 to the power of another NonZeroUint32.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a ** b` clamped to [1, 4294967295] as a NonZeroUint32.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveUint32`

Generates a random NonZeroUint32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### max?

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

A random NonZeroUint32 between 1 and 4294967295.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveUint32`

Subtracts one NonZeroUint32 from another.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a - b` clamped to [1, 4294967295] as a NonZeroUint32 (minimum 1).

#### Example

```typescript
const a = asNonZeroUint32(4000000000);
const b = asNonZeroUint32(1000000000);

// Arithmetic operations with automatic clamping and non-zero constraint
const sum = NonZeroUint32.add(a, b); // NonZeroUint32 (4294967295 - clamped to MAX_VALUE)
const diff = NonZeroUint32.sub(a, b); // NonZeroUint32 (3000000000)
const reverseDiff = NonZeroUint32.sub(b, a); // NonZeroUint32 (1 - clamped to MIN_VALUE)
const product = NonZeroUint32.mul(a, b); // NonZeroUint32 (4294967295 - clamped due to overflow)

// Range operations (maintaining non-zero constraint)
const clamped = NonZeroUint32.clamp(-100); // NonZeroUint32 (1)
const minimum = NonZeroUint32.min(a, b); // NonZeroUint32 (1000000000)
const maximum = NonZeroUint32.max(a, b); // NonZeroUint32 (4000000000)

// Utility operations
const random = NonZeroUint32.random(); // NonZeroUint32 (random value in [1, 4294967295])
const power = NonZeroUint32.pow(asNonZeroUint32(2), asNonZeroUint32(20)); // NonZeroUint32 (1048576)
```

---

### PositiveFiniteNumber

> `const` **PositiveFiniteNumber**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-finite-number.d.mts:68

Namespace providing type-safe arithmetic operations for positive finite numbers.

All operations maintain the positive constraint by clamping non-positive results to MIN_VALUE,
while ensuring results remain finite (excluding NaN and Infinity). This type is useful
for representing quantities that must always be positive, such as probabilities, magnitudes,
and physical measurements.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveFiniteNumber`

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

> `readonly` **ceil**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Rounds up a PositiveFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The PositiveFiniteNumber to round up.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The ceiling value as a PositiveInt (always >= 1).

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveFiniteNumber`

Clamps a number to the positive finite range.

###### Parameters

###### x

`number`

###### Returns

`PositiveFiniteNumber`

The value clamped to (0, +∞) as a PositiveFiniteNumber.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveFiniteNumber`

Divides one PositiveFiniteNumber by another.

###### Parameters

###### x

`PositiveFiniteNumber`

###### y

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>

###### Returns

`PositiveFiniteNumber`

`a / b` clamped to (0, +∞) as a PositiveFiniteNumber.

##### floor()

> `readonly` **floor**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey`\<`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>\>

Rounds down a PositiveFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The PositiveFiniteNumber to round down.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey`\<`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>\>

The floor value as a Uint (can be 0).

##### is()

> `readonly` **is**: (`a`) => `a is PositiveFiniteNumber`

Type guard to check if a value is a PositiveFiniteNumber.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveFiniteNumber`

`true` if the value is a positive finite number, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveFiniteNumber`

Returns the larger of two PositiveFiniteNumber values.

###### Parameters

###### values

...readonly `PositiveFiniteNumber`[]

###### Returns

`PositiveFiniteNumber`

The maximum value as a PositiveFiniteNumber.

##### min()

> `readonly` **min**: (...`values`) => `PositiveFiniteNumber`

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

> `readonly` **mul**: (`x`, `y`) => `PositiveFiniteNumber`

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

> `readonly` **pow**: (`x`, `y`) => `PositiveFiniteNumber`

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

> `readonly` **random**: (`min?`, `max?`) => `PositiveFiniteNumber`

Generates a random PositiveFiniteNumber value.

###### Parameters

###### min?

`PositiveFiniteNumber`

###### max?

`PositiveFiniteNumber`

###### Returns

`PositiveFiniteNumber`

A random positive finite number.

##### round()

> `readonly` **round**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey`\<`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>\>

Rounds a PositiveFiniteNumber to the nearest integer.

###### Parameters

###### x

`ElementType`

The PositiveFiniteNumber to round.

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey`\<`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>\>

The rounded value as a Uint (can be 0 if x < 0.5).

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveFiniteNumber`

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

---

### PositiveInt

> `const` **PositiveInt**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int.d.mts:102

Namespace providing type-safe operations for PositiveInt branded types.

PositiveInt represents integers that are strictly greater than zero (>= 1).
All operations automatically clamp results to maintain the positive constraint,
ensuring that arithmetic operations never produce zero or negative values.

This type is essential for:

- Array lengths and sizes (length >= 1)
- Counts and quantities that must be positive
- Denominators in division operations
- Loop counters and iteration counts
- Database primary keys and IDs

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveInt`

Adds two positive integers, ensuring the result is never less than 1.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt`, `40`\>

###### Returns

`PositiveInt`

`a + b` as a PositiveInt, but never less than 1

###### Example

```typescript
PositiveInt.add(asPositiveInt(5), asPositiveInt(3)); // PositiveInt (8)
```

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveInt`

Clamps a number to the positive integer range.

Since PositiveInt has a minimum value of 1, this function ensures
that any input less than 1 is clamped to 1.

###### Parameters

###### x

`number`

###### Returns

`PositiveInt`

The value clamped to >= 1 as a PositiveInt

###### Example

```typescript
PositiveInt.clamp(5); // PositiveInt (5)
PositiveInt.clamp(0); // PositiveInt (1) - clamped to minimum
PositiveInt.clamp(-10); // PositiveInt (1) - clamped to minimum
PositiveInt.clamp(100); // PositiveInt (100)
```

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveInt`

Divides two positive integers using floor division, clamping to remain positive.

Performs mathematical floor division: `⌊a / b⌋`. If the result would be 0
(when a < b), it is clamped to 1 to maintain the positive integer constraint.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveInt`

`max(1, ⌊a / b⌋)` as a PositiveInt

###### Example

```typescript
PositiveInt.div(asPositiveInt(10), asPositiveInt(3)); // PositiveInt (3)
PositiveInt.div(asPositiveInt(9), asPositiveInt(3)); // PositiveInt (3)
PositiveInt.div(asPositiveInt(2), asPositiveInt(3)); // PositiveInt (1) - clamped
PositiveInt.div(asPositiveInt(1), asPositiveInt(5)); // PositiveInt (1) - clamped
```

##### is()

> `readonly` **is**: (`a`) => `a is PositiveInt`

Type guard that checks if a value is a positive integer.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveInt`

`true` if the value is a positive integer, `false` otherwise

###### See

[isPositiveInt](#ispositiveint) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt`

Returns the maximum value from a list of positive integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt`, `40`\>[]

The positive integers to compare (at least one required)

###### Returns

`PositiveInt`

The largest value as a PositiveInt

###### Example

```typescript
PositiveInt.max(asPositiveInt(5), asPositiveInt(3)); // PositiveInt (5)
PositiveInt.max(asPositiveInt(10), asPositiveInt(1), asPositiveInt(7)); // PositiveInt (10)
```

##### min()

> `readonly` **min**: (...`values`) => `PositiveInt`

Returns the minimum value from a list of positive integers.

Since all inputs are guaranteed to be >= 1, the result is also guaranteed
to be a positive integer.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt`, `40`\>[]

The positive integers to compare (at least one required)

###### Returns

`PositiveInt`

The smallest value as a PositiveInt

###### Example

```typescript
PositiveInt.min(asPositiveInt(5), asPositiveInt(3)); // PositiveInt (3)
PositiveInt.min(asPositiveInt(10), asPositiveInt(1), asPositiveInt(7)); // PositiveInt (1)
```

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a PositiveInt.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveInt`

Multiplies two positive integers, ensuring the result is never less than 1.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt`, `40`\>

###### Returns

`PositiveInt`

`a * b` as a PositiveInt, but never less than 1

###### Example

```typescript
PositiveInt.mul(asPositiveInt(4), asPositiveInt(3)); // PositiveInt (12)
```

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveInt`

Raises a positive integer to a power, ensuring the result is never less than 1.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt`, `40`\>

###### Returns

`PositiveInt`

`a ** b` as a PositiveInt, but never less than 1

###### Example

```typescript
PositiveInt.pow(asPositiveInt(2), asPositiveInt(3)); // PositiveInt (8)
```

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveInt`

Generates a random positive integer within the specified range (inclusive).

Both bounds are inclusive, and both min and max must be positive integers.
If min > max, they are automatically swapped.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveInt`, `40`\>

The minimum value (inclusive, must be >= 1)

###### max?

`WithSmallInt`\<`PositiveInt`, `40`\>

The maximum value (inclusive, must be >= min)

###### Returns

`PositiveInt`

A random PositiveInt in the range [min, max]

###### Example

```typescript
// Dice roll
const d6 = PositiveInt.random(asPositiveInt(1), asPositiveInt(6));

// Random user ID
const userId = PositiveInt.random(asPositiveInt(1000), asPositiveInt(9999));

// Random page count
const pages = PositiveInt.random(asPositiveInt(50), asPositiveInt(500));
```

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveInt`

Subtracts two positive integers, clamping the result to remain positive.

If the mathematical result would be <= 0, it is clamped to 1 to maintain
the positive integer constraint.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt`, `40`\>

###### Returns

`PositiveInt`

`max(1, a - b)` as a PositiveInt

###### Example

```typescript
PositiveInt.sub(asPositiveInt(8), asPositiveInt(3)); // PositiveInt (5)
PositiveInt.sub(asPositiveInt(3), asPositiveInt(8)); // PositiveInt (1) - clamped
PositiveInt.sub(asPositiveInt(5), asPositiveInt(5)); // PositiveInt (1) - clamped
```

#### Example

```typescript
// Type validation
PositiveInt.is(5); // true
PositiveInt.is(1); // true (minimum value)
PositiveInt.is(0); // false
PositiveInt.is(-1); // false

// Automatic clamping in operations
const a = asPositiveInt(10);
const b = asPositiveInt(3);

const sum = PositiveInt.add(a, b); // PositiveInt (13)
const diff1 = PositiveInt.sub(a, b); // PositiveInt (7)
const diff2 = PositiveInt.sub(b, a); // PositiveInt (1) - clamped!
const product = PositiveInt.mul(a, b); // PositiveInt (30)
const quotient = PositiveInt.div(a, b); // PositiveInt (3)

// Edge case: division that would be < 1
const small = PositiveInt.div(asPositiveInt(2), asPositiveInt(3)); // PositiveInt (1)

// Range operations
const minimum = PositiveInt.min(a, b); // PositiveInt (3)
const maximum = PositiveInt.max(a, b); // PositiveInt (10)

// Random generation
const dice = PositiveInt.random(asPositiveInt(1), asPositiveInt(6)); // 1-6
const id = PositiveInt.random(asPositiveInt(1000), asPositiveInt(9999)); // 4-digit ID
```

---

### PositiveInt16

> `const` **PositiveInt16**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int16.d.mts:67

Namespace providing type-safe arithmetic operations for 16-bit positive integers.

All operations automatically clamp results to the valid PositiveInt16 range [1, 32767].
This ensures that all arithmetic maintains the 16-bit positive integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveInt16`

Adds two PositiveInt16 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### Returns

`PositiveInt16`

`a + b` clamped to [1, 32767] as a PositiveInt16.

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveInt16`

Clamps a number to the PositiveInt16 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveInt16`

The value clamped to [1, 32767] as a PositiveInt16.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveInt16`

Divides one PositiveInt16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveInt16`

`⌊a / b⌋` clamped to [1, 32767] as a PositiveInt16.

##### is()

> `readonly` **is**: (`a`) => `a is PositiveInt16`

Type guard to check if a value is a PositiveInt16.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveInt16`

`true` if the value is a 16-bit positive integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt16`

Returns the larger of two PositiveInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt16`, `40`\>[]

###### Returns

`PositiveInt16`

The maximum value as a PositiveInt16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit positive integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveInt16`

Returns the smaller of two PositiveInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt16`, `40`\>[]

###### Returns

`PositiveInt16`

The minimum value as a PositiveInt16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 16-bit positive integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveInt16`

Multiplies two PositiveInt16 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### Returns

`PositiveInt16`

`a * b` clamped to [1, 32767] as a PositiveInt16.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveInt16`

Raises a PositiveInt16 to the power of another PositiveInt16.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### Returns

`PositiveInt16`

`a ** b` clamped to [1, 32767] as a PositiveInt16.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveInt16`

Generates a random PositiveInt16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### max?

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### Returns

`PositiveInt16`

A random PositiveInt16 between 1 and 32767.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveInt16`

Subtracts one PositiveInt16 from another.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### Returns

`PositiveInt16`

`a - b` clamped to [1, 32767] as a PositiveInt16 (minimum 1).

#### Example

```typescript
const a = asPositiveInt16(30000);
const b = asPositiveInt16(5000);

// Arithmetic operations with automatic clamping
const sum = PositiveInt16.add(a, b); // PositiveInt16 (32767 - clamped to MAX_VALUE)
const diff = PositiveInt16.sub(a, b); // PositiveInt16 (25000)
const reverseDiff = PositiveInt16.sub(b, a); // PositiveInt16 (1 - clamped to MIN_VALUE)
const product = PositiveInt16.mul(a, b); // PositiveInt16 (32767 - clamped due to overflow)

// Range operations
const clamped = PositiveInt16.clamp(0); // PositiveInt16 (1)
const minimum = PositiveInt16.min(a, b); // PositiveInt16 (5000)
const maximum = PositiveInt16.max(a, b); // PositiveInt16 (30000)

// Utility operations
const random = PositiveInt16.random(); // PositiveInt16 (random value in [1, 32767])
const power = PositiveInt16.pow(asPositiveInt16(2), asPositiveInt16(10)); // PositiveInt16 (1024)
```

---

### PositiveInt32

> `const` **PositiveInt32**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-int32.d.mts:65

Namespace providing type-safe arithmetic operations for 32-bit positive integers.

All operations automatically clamp results to the valid PositiveInt32 range [1, 2147483647].
This ensures that all arithmetic maintains the 32-bit positive integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveInt32`

Adds two PositiveInt32 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### Returns

`PositiveInt32`

`a + b` clamped to [1, 2147483647] as a PositiveInt32.

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveInt32`

Clamps a number to the PositiveInt32 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveInt32`

The value clamped to [1, 2147483647] as a PositiveInt32.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveInt32`

Divides one PositiveInt32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveInt32`

`⌊a / b⌋` clamped to [1, 2147483647] as a PositiveInt32.

##### is()

> `readonly` **is**: (`a`) => `a is PositiveInt32`

Type guard to check if a value is a PositiveInt32.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveInt32`

`true` if the value is a 32-bit positive integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt32`

Returns the larger of two PositiveInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt32`, `40`\>[]

###### Returns

`PositiveInt32`

The maximum value as a PositiveInt32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit positive integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveInt32`

Returns the smaller of two PositiveInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt32`, `40`\>[]

###### Returns

`PositiveInt32`

The minimum value as a PositiveInt32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 32-bit positive integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveInt32`

Multiplies two PositiveInt32 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### Returns

`PositiveInt32`

`a * b` clamped to [1, 2147483647] as a PositiveInt32.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveInt32`

Raises a PositiveInt32 to the power of another PositiveInt32.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### Returns

`PositiveInt32`

`a ** b` clamped to [1, 2147483647] as a PositiveInt32.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveInt32`

Generates a random PositiveInt32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### max?

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### Returns

`PositiveInt32`

A random PositiveInt32 between 1 and 2147483647.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveInt32`

Subtracts one PositiveInt32 from another.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### Returns

`PositiveInt32`

`a - b` clamped to [1, 2147483647] as a PositiveInt32 (minimum 1).

#### Example

```typescript
const a = asPositiveInt32(2000000000);
const b = asPositiveInt32(500000000);

// Arithmetic operations with automatic clamping and positive constraint
const sum = PositiveInt32.add(a, b); // PositiveInt32 (2147483647 - clamped to MAX_VALUE)
const diff = PositiveInt32.sub(a, b); // PositiveInt32 (1500000000)
const reverseDiff = PositiveInt32.sub(b, a); // PositiveInt32 (1 - clamped to MIN_VALUE)
const product = PositiveInt32.mul(a, b); // PositiveInt32 (2147483647 - clamped due to overflow)

// Range operations (maintaining positive constraint)
const clamped = PositiveInt32.clamp(-1000); // PositiveInt32 (1)
const minimum = PositiveInt32.min(a, b); // PositiveInt32 (500000000)
const maximum = PositiveInt32.max(a, b); // PositiveInt32 (2000000000)

// Utility operations
const random = PositiveInt32.random(); // PositiveInt32 (random value in [1, 2147483647])
const power = PositiveInt32.pow(asPositiveInt32(2), asPositiveInt32(20)); // PositiveInt32 (1048576)
```

---

### PositiveSafeInt

> `const` **PositiveSafeInt**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-safe-int.d.mts:61

Namespace providing type-safe arithmetic operations for positive safe integers.

All operations automatically clamp results to the positive safe integer range [1, MAX_SAFE_INTEGER].
This ensures that all arithmetic maintains both the positive constraint and IEEE 754 precision guarantees,
preventing precision loss and ensuring results are always positive.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveSafeInt`

Adds two PositiveSafeInt values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### Returns

`PositiveSafeInt`

`a + b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveSafeInt`

Clamps a number to the positive safe integer range.

###### Parameters

###### x

`number`

###### Returns

`PositiveSafeInt`

The value clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveSafeInt`

Divides one PositiveSafeInt by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveSafeInt`

`⌊a / b⌋` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### is()

> `readonly` **is**: (`a`) => `a is PositiveSafeInt`

Type guard to check if a value is a PositiveSafeInt.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveSafeInt`

`true` if the value is a positive safe integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveSafeInt`

Returns the larger of two PositiveSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveSafeInt`, `40`\>[]

###### Returns

`PositiveSafeInt`

The maximum value as a PositiveSafeInt.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `SafeUint`

The maximum safe integer value (2^53 - 1).

##### min()

> `readonly` **min**: (...`values`) => `PositiveSafeInt`

Returns the smaller of two PositiveSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveSafeInt`, `40`\>[]

###### Returns

`PositiveSafeInt`

The minimum value as a PositiveSafeInt.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a positive safe integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveSafeInt`

Multiplies two PositiveSafeInt values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### Returns

`PositiveSafeInt`

`a * b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveSafeInt`

Raises a PositiveSafeInt to the power of another PositiveSafeInt.

###### Parameters

###### x

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### Returns

`PositiveSafeInt`

`a ** b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveSafeInt`

Generates a random PositiveSafeInt value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### max?

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### Returns

`PositiveSafeInt`

A random PositiveSafeInt between 1 and MAX_SAFE_INTEGER.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveSafeInt`

Subtracts one PositiveSafeInt from another.

###### Parameters

###### x

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveSafeInt`, `40`\>

###### Returns

`PositiveSafeInt`

`a - b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt (minimum 1).

#### Example

```typescript
const a = asPositiveSafeInt(1000000);
const b = asPositiveSafeInt(2000000);

// Arithmetic operations with positive safe range clamping
const sum = PositiveSafeInt.add(a, b); // PositiveSafeInt (3000000)
const diff = PositiveSafeInt.sub(a, b); // PositiveSafeInt (1 - clamped to MIN_VALUE)
const product = PositiveSafeInt.mul(a, b); // PositiveSafeInt (2000000000000)

// Range operations
const clamped = PositiveSafeInt.clamp(0); // PositiveSafeInt (1)
const minimum = PositiveSafeInt.min(a, b); // PositiveSafeInt (1000000)
const maximum = PositiveSafeInt.max(a, b); // PositiveSafeInt (2000000)

// Utility operations
const random = PositiveSafeInt.random(); // PositiveSafeInt (random positive safe integer)
const power = PositiveSafeInt.pow(asPositiveSafeInt(2), asPositiveSafeInt(10)); // PositiveSafeInt (1024)
```

---

### PositiveUint16

> `const` **PositiveUint16**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-uint16.d.mts:66

Namespace providing type-safe arithmetic operations for 16-bit positive unsigned integers.

All operations automatically clamp results to the valid PositiveUint16 range [1, 65535].
This ensures that all arithmetic maintains the 16-bit positive unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveUint16`

Adds two PositiveUint16 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a + b` clamped to [1, 65535] as a PositiveUint16.

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveUint16`

Clamps a number to the PositiveUint16 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint16`

The value clamped to [1, 65535] as a PositiveUint16.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveUint16`

Divides one PositiveUint16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveUint16`

`⌊a / b⌋` clamped to [1, 65535] as a PositiveUint16.

##### is()

> `readonly` **is**: (`a`) => `a is PositiveUint16`

Type guard to check if a value is a PositiveUint16.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint16`

`true` if the value is a 16-bit positive unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint16`

Returns the larger of two PositiveUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The maximum value as a PositiveUint16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit positive unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint16`

Returns the smaller of two PositiveUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The minimum value as a PositiveUint16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 16-bit positive unsigned integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveUint16`

Multiplies two PositiveUint16 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a * b` clamped to [1, 65535] as a PositiveUint16.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveUint16`

Raises a PositiveUint16 to the power of another PositiveUint16.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a ** b` clamped to [1, 65535] as a PositiveUint16.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveUint16`

Generates a random PositiveUint16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### max?

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

A random PositiveUint16 between 1 and 65535.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveUint16`

Subtracts one PositiveUint16 from another.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint16`, `40`\>

###### Returns

`PositiveUint16`

`a - b` clamped to [1, 65535] as a PositiveUint16 (minimum 1).

#### Example

```typescript
const a = asPositiveUint16(60000);
const b = asPositiveUint16(10000);

// Arithmetic operations with automatic clamping and positive constraint
const sum = PositiveUint16.add(a, b); // PositiveUint16 (65535 - clamped to MAX_VALUE)
const diff = PositiveUint16.sub(a, b); // PositiveUint16 (50000)
const reverseDiff = PositiveUint16.sub(b, a); // PositiveUint16 (1 - clamped to MIN_VALUE)
const product = PositiveUint16.mul(a, b); // PositiveUint16 (65535 - clamped due to overflow)

// Range operations (maintaining positive constraint)
const clamped = PositiveUint16.clamp(-100); // PositiveUint16 (1)
const minimum = PositiveUint16.min(a, b); // PositiveUint16 (10000)
const maximum = PositiveUint16.max(a, b); // PositiveUint16 (60000)

// Utility operations
const random = PositiveUint16.random(); // PositiveUint16 (random value in [1, 65535])
const power = PositiveUint16.pow(asPositiveUint16(2), asPositiveUint16(10)); // PositiveUint16 (1024)
```

---

### PositiveUint32

> `const` **PositiveUint32**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/positive-uint32.d.mts:64

Namespace providing type-safe arithmetic operations for 32-bit positive unsigned integers.

All operations automatically clamp results to the valid PositiveUint32 range [1, 4294967295].
This ensures that all arithmetic maintains the 32-bit positive unsigned integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `PositiveUint32`

Adds two PositiveUint32 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a + b` clamped to [1, 4294967295] as a PositiveUint32.

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveUint32`

Clamps a number to the PositiveUint32 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveUint32`

The value clamped to [1, 4294967295] as a PositiveUint32.

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveUint32`

Divides one PositiveUint32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveUint32`

`⌊a / b⌋` clamped to [1, 4294967295] as a PositiveUint32.

##### is()

> `readonly` **is**: (`a`) => `a is PositiveUint32`

Type guard to check if a value is a PositiveUint32.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveUint32`

`true` if the value is a 32-bit positive unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint32`

Returns the larger of two PositiveUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The maximum value as a PositiveUint32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit positive unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveUint32`

Returns the smaller of two PositiveUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The minimum value as a PositiveUint32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 32-bit positive unsigned integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `PositiveUint32`

Multiplies two PositiveUint32 values.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a * b` clamped to [1, 4294967295] as a PositiveUint32.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveUint32`

Raises a PositiveUint32 to the power of another PositiveUint32.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a ** b` clamped to [1, 4294967295] as a PositiveUint32.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `PositiveUint32`

Generates a random PositiveUint32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### max?

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

A random PositiveUint32 between 1 and 4294967295.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `PositiveUint32`

Subtracts one PositiveUint32 from another.

###### Parameters

###### x

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### y

`WithSmallInt`\<`PositiveUint32`, `40`\>

###### Returns

`PositiveUint32`

`a - b` clamped to [1, 4294967295] as a PositiveUint32 (minimum 1).

#### Example

```typescript
const a = asPositiveUint32(4000000000);
const b = asPositiveUint32(1000000000);

// Arithmetic operations with automatic clamping and positive constraint
const sum = PositiveUint32.add(a, b); // PositiveUint32 (4294967295 - clamped to MAX_VALUE)
const diff = PositiveUint32.sub(a, b); // PositiveUint32 (3000000000)
const reverseDiff = PositiveUint32.sub(b, a); // PositiveUint32 (1 - clamped to MIN_VALUE)
const product = PositiveUint32.mul(a, b); // PositiveUint32 (4294967295 - clamped due to overflow)

// Range operations (maintaining positive constraint)
const clamped = PositiveUint32.clamp(-100); // PositiveUint32 (1)
const minimum = PositiveUint32.min(a, b); // PositiveUint32 (1000000000)
const maximum = PositiveUint32.max(a, b); // PositiveUint32 (4000000000)

// Utility operations
const random = PositiveUint32.random(); // PositiveUint32 (random value in [1, 4294967295])
const power = PositiveUint32.pow(asPositiveUint32(2), asPositiveUint32(20)); // PositiveUint32 (1048576)
```

---

### SafeInt

> `const` **SafeInt**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/safe-int.d.mts:93

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

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`SafeInt`\>

Returns the absolute value of a safe integer.

Note: `Math.abs(MIN_SAFE_INTEGER)` would exceed `MAX_SAFE_INTEGER`,
so this function clamps the result to maintain the safe integer guarantee.

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`SafeInt`\>

The absolute value as a SafeInt, clamped if necessary

###### Example

```typescript
SafeInt.abs(asSafeInt(-42)); // SafeInt (42)
SafeInt.abs(asSafeInt(42)); // SafeInt (42)
SafeInt.abs(SafeInt.MIN_VALUE); // SafeInt (MAX_SAFE_INTEGER)
```

##### add()

> `readonly` **add**: (`x`, `y`) => `SafeInt`

Adds two SafeInt values.

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### y

`WithSmallInt`\<`SafeInt`, `40`\>

###### Returns

`SafeInt`

`a + b` clamped to safe integer range as a SafeInt.

##### clamp()

> `readonly` **clamp**: (`x`) => `SafeInt`

Clamps a number to the safe integer range.

###### Parameters

###### x

`number`

###### Returns

`SafeInt`

The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] as a SafeInt.

##### div()

> `readonly` **div**: (`x`, `y`) => `SafeInt`

Divides one SafeInt by another using floor division.

Performs mathematical floor division: `⌊a / b⌋`.
The divisor must be non-zero (enforced by type constraints).

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

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

> `readonly` **is**: (`a`) => `a is SafeInt`

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

> `readonly` **max**: (...`values`) => `SafeInt`

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

> `readonly` **min**: (...`values`) => `SafeInt`

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

> `readonly` **mul**: (`x`, `y`) => `SafeInt`

Multiplies two SafeInt values.

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### y

`WithSmallInt`\<`SafeInt`, `40`\>

###### Returns

`SafeInt`

`a * b` clamped to safe integer range as a SafeInt.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `SafeInt`

Raises a SafeInt to the power of another SafeInt.

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### y

`WithSmallInt`\<`SafeInt`, `40`\>

###### Returns

`SafeInt`

`a ** b` clamped to safe integer range as a SafeInt.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `SafeInt`

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

> `readonly` **sub**: (`x`, `y`) => `SafeInt`

Subtracts one SafeInt from another.

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### y

`WithSmallInt`\<`SafeInt`, `40`\>

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

---

### SafeUint

> `const` **SafeUint**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/safe-uint.d.mts:60

Namespace providing type-safe arithmetic operations for safe unsigned integers.

All operations automatically clamp results to the safe unsigned integer range [0, MAX_SAFE_INTEGER].
This ensures that all arithmetic maintains both the non-negative constraint and IEEE 754 precision guarantees,
preventing precision loss while ensuring results are never negative.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `SafeUint`

Adds two SafeUint values.

###### Parameters

###### x

`WithSmallInt`\<`SafeUint`, `40`\>

###### y

`WithSmallInt`\<`SafeUint`, `40`\>

###### Returns

`SafeUint`

`a + b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### clamp()

> `readonly` **clamp**: (`x`) => `SafeUint`

Clamps a number to the safe unsigned integer range.

###### Parameters

###### x

`number`

###### Returns

`SafeUint`

The value clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### div()

> `readonly` **div**: (`x`, `y`) => `SafeUint`

Divides one SafeUint by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`SafeUint`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`SafeUint`

`⌊a / b⌋` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### is()

> `readonly` **is**: (`a`) => `a is SafeUint`

Type guard to check if a value is a SafeUint.

###### Parameters

###### a

`number`

###### Returns

`a is SafeUint`

`true` if the value is a non-negative safe integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `SafeUint`

Returns the larger of two SafeUint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`SafeUint`, `40`\>[]

###### Returns

`SafeUint`

The maximum value as a SafeUint.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `SafeUint`

The maximum safe integer value (2^53 - 1).

##### min()

> `readonly` **min**: (...`values`) => `SafeUint`

Returns the smaller of two SafeUint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`SafeUint`, `40`\>[]

###### Returns

`SafeUint`

The minimum value as a SafeUint.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a safe unsigned integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `SafeUint`

Multiplies two SafeUint values.

###### Parameters

###### x

`WithSmallInt`\<`SafeUint`, `40`\>

###### y

`WithSmallInt`\<`SafeUint`, `40`\>

###### Returns

`SafeUint`

`a * b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `SafeUint`

Raises a SafeUint to the power of another SafeUint.

###### Parameters

###### x

`WithSmallInt`\<`SafeUint`, `40`\>

###### y

`WithSmallInt`\<`SafeUint`, `40`\>

###### Returns

`SafeUint`

`a ** b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `SafeUint`

Generates a random SafeUint value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`SafeUint`, `40`\>

###### max?

`WithSmallInt`\<`SafeUint`, `40`\>

###### Returns

`SafeUint`

A random SafeUint between 0 and MAX_SAFE_INTEGER.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `SafeUint`

Subtracts one SafeUint from another.

###### Parameters

###### x

`WithSmallInt`\<`SafeUint`, `40`\>

###### y

`WithSmallInt`\<`SafeUint`, `40`\>

###### Returns

`SafeUint`

`a - b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint (minimum 0).

#### Example

```typescript
const a = asSafeUint(9007199254740000); // Near MAX_SAFE_INTEGER
const b = asSafeUint(1000);

// Arithmetic operations with safe unsigned range clamping
const sum = SafeUint.add(a, b); // SafeUint (clamped to MAX_SAFE_INTEGER)
const diff = SafeUint.sub(b, a); // SafeUint (0 - clamped to MIN_VALUE)
const product = SafeUint.mul(a, b); // SafeUint (clamped to MAX_SAFE_INTEGER)

// Range operations
const clamped = SafeUint.clamp(-100); // SafeUint (0)
const minimum = SafeUint.min(a, b); // SafeUint (1000)
const maximum = SafeUint.max(a, b); // SafeUint (a)

// Utility operations
const random = SafeUint.random(); // SafeUint (random safe unsigned integer)
const power = SafeUint.pow(asSafeUint(2), asSafeUint(20)); // SafeUint (1048576)
```

---

### Uint

> `const` **Uint**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint.d.mts:59

Namespace providing type-safe arithmetic operations for unsigned integers.

All operations maintain the non-negative constraint by clamping negative results to 0.
This ensures that all arithmetic preserves the unsigned integer property.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `NonNegativeInt`

Adds two Uint values.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### Returns

`NonNegativeInt`

`a + b` clamped to [0, +∞) as a Uint.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonNegativeInt`

Clamps a number to the Uint range (non-negative).

###### Parameters

###### x

`number`

###### Returns

`NonNegativeInt`

The value clamped to [0, +∞) as a Uint.

##### div()

> `readonly` **div**: (`x`, `y`) => `NonNegativeInt`

Divides one Uint by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`NonNegativeInt`

`⌊a / b⌋` clamped to [0, +∞) as a Uint.

##### is()

> `readonly` **is**: (`a`) => `a is NonNegativeInt`

Type guard to check if a value is a Uint.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeInt`

`true` if the value is a non-negative integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt`

Returns the larger of two Uint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt`, `40`\>[]

###### Returns

`NonNegativeInt`

The maximum value as a Uint.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeInt`

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

> `readonly` **mul**: (`x`, `y`) => `NonNegativeInt`

Multiplies two Uint values.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### Returns

`NonNegativeInt`

`a * b` clamped to [0, +∞) as a Uint.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `NonNegativeInt`

Raises a Uint to the power of another Uint.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### Returns

`NonNegativeInt`

`a ** b` clamped to [0, +∞) as a Uint.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `NonNegativeInt`

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

> `readonly` **sub**: (`x`, `y`) => `NonNegativeInt`

Subtracts one Uint from another.

###### Parameters

###### x

`WithSmallInt`\<`NonNegativeInt`, `40`\>

###### y

`WithSmallInt`\<`NonNegativeInt`, `40`\>

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

---

### Uint16

> `const` **Uint16**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint16.d.mts:63

Namespace providing type-safe arithmetic operations for 16-bit unsigned integers.

All operations automatically clamp results to the valid Uint16 range [0, 65535].
This ensures that all arithmetic maintains the 16-bit unsigned integer constraint,
with negative results clamped to 0 and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `Uint16`

Adds two Uint16 values.

###### Parameters

###### x

`WithSmallInt`\<`Uint16`, `40`\>

###### y

`WithSmallInt`\<`Uint16`, `40`\>

###### Returns

`Uint16`

`a + b` clamped to [0, 65535] as a Uint16.

##### clamp()

> `readonly` **clamp**: (`x`) => `Uint16`

Clamps a number to the Uint16 range.

###### Parameters

###### x

`number`

###### Returns

`Uint16`

The value clamped to [0, 65535] as a Uint16.

##### div()

> `readonly` **div**: (`x`, `y`) => `Uint16`

Divides one Uint16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`\<`Uint16`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`Uint16`

`⌊a / b⌋` clamped to [0, 65535] as a Uint16.

##### is()

> `readonly` **is**: (`a`) => `a is Uint16`

Type guard to check if a value is a Uint16.

###### Parameters

###### a

`number`

###### Returns

`a is Uint16`

`true` if the value is a 16-bit unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Uint16`

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

> `readonly` **min**: (...`values`) => `Uint16`

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

> `readonly` **mul**: (`x`, `y`) => `Uint16`

Multiplies two Uint16 values.

###### Parameters

###### x

`WithSmallInt`\<`Uint16`, `40`\>

###### y

`WithSmallInt`\<`Uint16`, `40`\>

###### Returns

`Uint16`

`a * b` clamped to [0, 65535] as a Uint16.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Uint16`

Raises a Uint16 to the power of another Uint16.

###### Parameters

###### x

`WithSmallInt`\<`Uint16`, `40`\>

###### y

`WithSmallInt`\<`Uint16`, `40`\>

###### Returns

`Uint16`

`a ** b` clamped to [0, 65535] as a Uint16.

##### random()

> `readonly` **random**: (`min?`, `max?`) => `Uint16`

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

> `readonly` **sub**: (`x`, `y`) => `Uint16`

Subtracts one Uint16 from another.

###### Parameters

###### x

`WithSmallInt`\<`Uint16`, `40`\>

###### y

`WithSmallInt`\<`Uint16`, `40`\>

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

---

### Uint32

> `const` **Uint32**: `object`

Defined in: node_modules/ts-data-forge/dist/number/branded-types/uint32.d.mts:67

Utility functions for working with Uint32 (32-bit unsigned integer) branded types.
Provides type-safe operations that ensure results remain within the valid range [0, 2^32).
All arithmetic operations are clamped to maintain the Uint32 constraint.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `Uint32`

Adds two Uint32 values, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`\<`Uint32`, `40`\>

###### y

`WithSmallInt`\<`Uint32`, `40`\>

###### Returns

`Uint32`

`a + b` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.add(asUint32(1000000), asUint32(500000)); // Uint32 (1500000)
```

##### clamp()

> `readonly` **clamp**: (`x`) => `Uint32`

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

> `readonly` **div**: (`x`, `y`) => `Uint32`

Divides two Uint32 values using floor division, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`\<`Uint32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`Uint32`

`⌊a / b⌋` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.div(asUint32(1000000), asUint32(500000)); // Uint32 (2)
Uint32.div(asUint32(7), asUint32(3)); // Uint32 (2) - floor division
```

##### is()

> `readonly` **is**: (`a`) => `a is Uint32`

Type guard that checks if a value is a 32-bit unsigned integer.

###### Parameters

###### a

`number`

###### Returns

`a is Uint32`

`true` if the value is within the range [0, 2^32), `false` otherwise

##### max()

> `readonly` **max**: (...`values`) => `Uint32`

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

> `readonly` **min**: (...`values`) => `Uint32`

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

> `readonly` **mul**: (`x`, `y`) => `Uint32`

Multiplies two Uint32 values, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`\<`Uint32`, `40`\>

###### y

`WithSmallInt`\<`Uint32`, `40`\>

###### Returns

`Uint32`

`a * b` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.mul(asUint32(1000), asUint32(500)); // Uint32 (500000)
```

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Uint32`

Raises a Uint32 to a power, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`\<`Uint32`, `40`\>

###### y

`WithSmallInt`\<`Uint32`, `40`\>

###### Returns

`Uint32`

`a ** b` as a Uint32, clamped to valid range

###### Example

```typescript
Uint32.pow(asUint32(2), asUint32(10)); // Uint32 (1024)
```

##### random()

> `readonly` **random**: (`min?`, `max?`) => `Uint32`

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

> `readonly` **sub**: (`x`, `y`) => `Uint32`

Subtracts two Uint32 values, with result clamped to [0, 2^32).

###### Parameters

###### x

`WithSmallInt`\<`Uint32`, `40`\>

###### y

`WithSmallInt`\<`Uint32`, `40`\>

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

---

### Uint8

> `const` **Uint8**: `object`

Defined in: node_modules/ts-data-forge/dist/number/enum/uint8.d.mts:50

Namespace providing type-safe arithmetic operations for 8-bit unsigned integers.

All operations automatically clamp results to the valid Uint8 range [0, 255].
This ensures that all arithmetic maintains the 8-bit unsigned integer constraint,
with negative results clamped to 0 and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `Uint8`

Adds two Uint8 values.

###### Parameters

###### x

`Uint8`

###### y

`Uint8`

###### Returns

`Uint8`

`a + b` clamped to [0, 255] as a Uint8.

##### clamp()

> `readonly` **clamp**: (`a`) => `Uint8`

Clamps a number to the Uint8 range.

###### Parameters

###### a

`number`

###### Returns

`Uint8`

The value clamped to [0, 255] as a Uint8.

##### div()

> `readonly` **div**: (`x`, `y`) => `Uint8`

Divides one Uint8 by another using floor division.

###### Parameters

###### x

`Uint8`

###### y

`Exclude`\<`Uint8`, `0`\>

###### Returns

`Uint8`

`⌊a / b⌋` clamped to [0, 255] as a Uint8.

##### is()

> `readonly` **is**: (`x`) => `x is Uint8`

Type guard to check if a value is a Uint8.

###### Parameters

###### x

`number`

###### Returns

`x is Uint8`

`true` if the value is an 8-bit unsigned integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Uint8`

Returns the larger of the given Uint8 values.

###### Parameters

###### values

...readonly `Uint8`[]

The Uint8 values to compare.

###### Returns

`Uint8`

The maximum value as a Uint8.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `255`

The maximum value for an 8-bit unsigned integer.

##### min()

> `readonly` **min**: (...`values`) => `Uint8`

Returns the smaller of the given Uint8 values.

###### Parameters

###### values

...readonly `Uint8`[]

The Uint8 values to compare.

###### Returns

`Uint8`

The minimum value as a Uint8.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for an 8-bit unsigned integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `Uint8`

Multiplies two Uint8 values.

###### Parameters

###### x

`Uint8`

###### y

`Uint8`

###### Returns

`Uint8`

`a * b` clamped to [0, 255] as a Uint8.

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Uint8`

Raises a Uint8 to the power of another Uint8.

###### Parameters

###### x

`Uint8`

###### y

`Uint8`

###### Returns

`Uint8`

`a ** b` clamped to [0, 255] as a Uint8.

##### random()

> `readonly` **random**: (`min`, `max`) => `Uint8`

Generates a random Uint8 value within the specified range.

###### Parameters

###### min

`Uint8`

The minimum value (inclusive).

###### max

`Uint8`

The maximum value (inclusive).

###### Returns

`Uint8`

A random Uint8 between min and max.

##### sub()

> `readonly` **sub**: (`x`, `y`) => `Uint8`

Subtracts one Uint8 from another.

###### Parameters

###### x

`Uint8`

###### y

`Uint8`

###### Returns

`Uint8`

`a - b` clamped to [0, 255] as a Uint8 (minimum 0).

#### Example

```typescript
const a = asUint8(200);
const b = asUint8(100);

// Arithmetic operations with automatic clamping
const sum = Uint8.add(a, b); // Uint8 (255 - clamped to MAX_VALUE)
const diff = Uint8.sub(a, b); // Uint8 (100)
const reverseDiff = Uint8.sub(b, a); // Uint8 (0 - clamped to MIN_VALUE)
const product = Uint8.mul(a, b); // Uint8 (255 - clamped due to overflow)

// Range operations
const clamped = Uint8.clamp(-10); // Uint8 (0)
const minimum = Uint8.min(a, b); // Uint8 (100)
const maximum = Uint8.max(a, b); // Uint8 (200)

// Utility operations
const random = Uint8.random(asUint8(50), asUint8(150)); // Uint8 (random value in [50, 150])
const power = Uint8.pow(asUint8(2), asUint8(7)); // Uint8 (128)
```

## References

### array

Re-exports [array](../array/array.md#array)

---

### arrayOfLength

Re-exports [arrayOfLength](../array/array-of-length.md#arrayoflength)

---

### bigint

Re-exports [bigint](../primitives/bigint.md#bigint)

---

### bigintLiteral

Re-exports [bigintLiteral](../primitives/bigint.md#bigintliteral)

---

### boolean

Re-exports [boolean](../primitives/boolean.md#boolean)

---

### booleanLiteral

Re-exports [booleanLiteral](../primitives/boolean.md#booleanliteral)

---

### brand

Re-exports [brand](../branded/brand.md#brand)

---

### createAssertFn

Re-exports [createAssertFn](../utils/create-assert-fn.md#createassertfn)

---

### createCastFn

Re-exports [createCastFn](../utils/create-cast-fn.md#createcastfn)

---

### createIsFn

Re-exports [createIsFn](../utils/create-is-fn.md#createisfn)

---

### createPrimitiveType

Re-exports [createPrimitiveType](../utils/create-primitive-type.md#createprimitivetype)

---

### createPrimitiveValidationError

Re-exports [createPrimitiveValidationError](../utils/validation-error.md#createprimitivevalidationerror)

---

### createType

Re-exports [createType](../utils/create-type.md#createtype)

---

### enumType

Re-exports [enumType](../enum/enum.md#enumtype)

---

### finiteNumber

Re-exports [finiteNumber](../branded/number/finite-number.md#finitenumber)

---

### int

Re-exports [int](../branded/number/int.md#int)

---

### int16

Re-exports [int16](../branded/number/int16.md#int16)

---

### int32

Re-exports [int32](../branded/number/int32.md#int32)

---

### int8

Re-exports [int8](../predefined/int8.md#int8)

---

### intersection

Re-exports [intersection](../compose/intersection.md#intersection)

---

### intRange

Re-exports [intRange](../enum/int-range.md#intrange)

---

### isOptionalProperty

Re-exports [isOptionalProperty](../record/optional.md#isoptionalproperty)

---

### JsonObject

Re-exports [JsonObject](../predefined/json.md#jsonobject)

---

### JsonPrimitive

Re-exports [JsonPrimitive](../predefined/json.md#jsonprimitive)

---

### JsonValue

Re-exports [JsonValue](../predefined/json.md#jsonvalue)

---

### keyof

Re-exports [keyof](../record/keyof.md#keyof)

---

### keyValueRecord

Re-exports [keyValueRecord](../record/key-value-record.md#keyvaluerecord)

---

### literal

Re-exports [literal](../other-types/literal.md#literal)

---

### MapType

Re-exports [MapType](../other-types/map.md#maptype)

---

### mergeRecords

Re-exports [mergeRecords](../compose/merge-records.md#mergerecords)

---

### nonEmptyArray

Re-exports [nonEmptyArray](../array/non-empty-array.md#nonemptyarray)

---

### nonNegativeFiniteNumber

Re-exports [nonNegativeFiniteNumber](../branded/number/non-negative-finite-number.md#nonnegativefinitenumber)

---

### nonZeroFiniteNumber

Re-exports [nonZeroFiniteNumber](../branded/number/non-zero-finite-number.md#nonzerofinitenumber)

---

### nonZeroInt

Re-exports [nonZeroInt](../branded/number/non-zero-int.md#nonzeroint)

---

### nonZeroSafeInt

Re-exports [nonZeroSafeInt](../branded/number/non-zero-safe-int.md#nonzerosafeint)

---

### nullable

Re-exports [nullable](../predefined/nullable.md#nullable)

---

### nullType

Re-exports [nullType](../primitives/null.md#nulltype)

---

### number

Re-exports [number](../primitives/number.md#number)

---

### numberLiteral

Re-exports [numberLiteral](../primitives/number.md#numberliteral)

---

### omit

Re-exports [omit](../record/omit.md#omit)

---

### OmittedType

Re-exports [OmittedType](../record/omit.md#omittedtype)

---

### optional

Re-exports [optional](../record/optional.md#optional)

---

### OptionalPropertyType

Re-exports [OptionalPropertyType](../record/optional.md#optionalpropertytype)

---

### OptionalType

Re-exports [OptionalType](../type/README.md#optionaltype)

---

### partial

Re-exports [partial](../record/partial.md#partial)

---

### PartialType

Re-exports [PartialType](../record/partial.md#partialtype)

---

### pick

Re-exports [pick](../record/pick.md#pick)

---

### PickedType

Re-exports [PickedType](../record/pick.md#pickedtype)

---

### positiveFiniteNumber

Re-exports [positiveFiniteNumber](../branded/number/positive-finite-number.md#positivefinitenumber)

---

### positiveInt

Re-exports [positiveInt](../branded/number/positive-int.md#positiveint)

---

### positiveSafeInt

Re-exports [positiveSafeInt](../branded/number/positive-safe-int.md#positivesafeint)

---

### prependIndexToValidationErrors

Re-exports [prependIndexToValidationErrors](../utils/validation-error.md#prependindextovalidationerrors)

---

### prependPathToValidationErrors

Re-exports [prependPathToValidationErrors](../utils/validation-error.md#prependpathtovalidationerrors)

---

### record

Re-exports [record](../record/record.md#record)

---

### RecordType

Re-exports [RecordType](../type/README.md#recordtype)

---

### recursion

Re-exports [recursion](../compose/recursion.md#recursion)

---

### refine

Re-exports [refine](../other-types/refine.md#refine)

---

### safeInt

Re-exports [safeInt](../branded/number/safe-int.md#safeint)

---

### safeUint

Re-exports [safeUint](../branded/number/safe-uint.md#safeuint)

---

### SetType

Re-exports [SetType](../other-types/set.md#settype)

---

### simpleBrandedNumber

Re-exports [simpleBrandedNumber](../branded/simple-branded-number.md#simplebrandednumber)

---

### simpleBrandedString

Re-exports [simpleBrandedString](../branded/simple-branded-string.md#simplebrandedstring)

---

### strictRecord

Re-exports [strictRecord](../record/record.md#strictrecord)

---

### string

Re-exports [string](../primitives/string.md#string)

---

### stringLiteral

Re-exports [stringLiteral](../primitives/string.md#stringliteral)

---

### symbol

Re-exports [symbol](../primitives/symbol.md#symbol)

---

### toIntersectionString

Re-exports [toIntersectionString](../utils/to-union-string.md#tointersectionstring)

---

### toUnionString

Re-exports [toUnionString](../utils/to-union-string.md#tounionstring)

---

### TsFortressInternal

Re-exports [TsFortressInternal](../type/namespaces/TsFortressInternal.md)

---

### tuple

Re-exports [tuple](../array/tuple.md#tuple)

---

### Type

Re-exports [Type](../type/README.md#type)

---

### TypeOf

Re-exports [TypeOf](../type/README.md#typeof)

---

### uint

Re-exports [uint](../branded/number/uint.md#uint)

---

### uint16

Re-exports [uint16](../branded/number/uint16.md#uint16)

---

### uint32

Re-exports [uint32](../branded/number/uint32.md#uint32)

---

### uint8

Re-exports [uint8](../predefined/uint8.md#uint8)

---

### uintRange

Re-exports [uintRange](../enum/uint-range.md#uintrange)

---

### undefinedType

Re-exports [undefinedType](../primitives/undefined.md#undefinedtype)

---

### union

Re-exports [union](../compose/union.md#union)

---

### unknown

Re-exports [unknown](../other-types/unknown.md#unknown)

---

### ValidationError

Re-exports [ValidationError](../utils/validation-error.md#validationerror)

---

### validationErrorsToMessages

Re-exports [validationErrorsToMessages](../utils/validation-error.md#validationerrorstomessages)

---

### validationErrorToMessage

Re-exports [validationErrorToMessage](../utils/validation-error.md#validationerrortomessage)

---

### ValidationErrorWithMessage

Re-exports [ValidationErrorWithMessage](../utils/validation-error.md#validationerrorwithmessage)

---

### valueof

Re-exports [valueof](../record/valueof.md#valueof)
