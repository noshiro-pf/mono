[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / entry-point

# entry-point

## Namespaces

- [Result](namespaces/Result.md)

## Variables

### asFiniteNumber()

> `const` **asFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/finite-number.d.mts:25

Casts a number to a FiniteNumber branded type.

This function validates that the input is finite (not NaN, Infinity, or
-Infinity) and returns it with the FiniteNumber brand. This ensures type
safety for operations that require finite numeric values.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a FiniteNumber branded type

#### Throws

If the value is NaN, Infinity, or -Infinity

***

### asInt()

> `const` **asInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int.d.mts:41

Casts a number to an Int branded type.

This function validates that the input is an integer and returns it with the
Int brand. Throws a TypeError if the value has a fractional component or is
not a finite number.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int branded type

#### Example

```ts
const branded = asInt(42);

assert(branded === 42);
assert.ok(Int.is(branded));
```

#### Throws

If the value is not an integer

***

### asInt16()

> `const` **asInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int16.d.mts:17

Casts a number to an Int16 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int16 type.

#### Throws

If the value is not an integer in [-2^15, 2^15).

***

### asInt32()

> `const` **asInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int32.d.mts:17

Casts a number to an Int32 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as an Int32 type.

#### Throws

If the value is not an integer in [-2^31, 2^31).

***

### asInt8()

> `const` **asInt8**: (`x`) => `Int8`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/enum/int8.d.mts:21

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

***

### asNonNegativeFiniteNumber()

> `const` **asNonNegativeFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-finite-number.d.mts:17

Casts a number to a NonNegativeFiniteNumber type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeFiniteNumber type.

#### Throws

If the value is not a non-negative finite number.

***

### asNonNegativeInt16()

> `const` **asNonNegativeInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-int16.d.mts:16

Casts a number to a NonNegativeInt16 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeInt16 type.

#### Throws

If the value is not a non-negative integer in [0, 2^15).

***

### asNonNegativeInt32()

> `const` **asNonNegativeInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-int32.d.mts:16

Casts a number to a NonNegativeInt32 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeInt32 type.

#### Throws

If the value is not a non-negative integer in [0, 2^31).

***

### asNonZeroFiniteNumber()

> `const` **asNonZeroFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-finite-number.d.mts:17

Casts a number to a NonZeroFiniteNumber type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroFiniteNumber type.

#### Throws

If the value is not a non-zero finite number.

***

### asNonZeroInt()

> `const` **asNonZeroInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int.d.mts:16

Casts a number to a NonZeroInt type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt type.

#### Throws

If the value is not a non-zero integer.

***

### asNonZeroInt16()

> `const` **asNonZeroInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int16.d.mts:17

Casts a number to a NonZeroInt16 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt16 type.

#### Throws

If the value is not a non-zero integer in [-2^15, 2^15).

***

### asNonZeroInt32()

> `const` **asNonZeroInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int32.d.mts:17

Casts a number to a NonZeroInt32 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroInt32 type.

#### Throws

If the value is not a non-zero integer in [-2^31, 2^31).

***

### asNonZeroSafeInt()

> `const` **asNonZeroSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-safe-int.d.mts:17

Casts a number to a NonZeroSafeInt type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroSafeInt type.

#### Throws

If the value is not a non-zero safe integer.

***

### asNonZeroUint16()

> `const` **asNonZeroUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-uint16.d.mts:16

Casts a number to a NonZeroUint16 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroUint16 type.

#### Throws

If the value is not a non-zero integer in [1, 2^16).

***

### asNonZeroUint32()

> `const` **asNonZeroUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-uint32.d.mts:16

Casts a number to a NonZeroUint32 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroUint32 type.

#### Throws

If the value is not a non-zero integer in [1, 2^32).

***

### asPositiveFiniteNumber()

> `const` **asPositiveFiniteNumber**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-finite-number.d.mts:17

Casts a number to a PositiveFiniteNumber type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveFiniteNumber type.

#### Throws

If the value is not a positive finite number.

***

### asPositiveInt()

> `const` **asPositiveInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int.d.mts:39

Casts a number to a PositiveInt branded type.

This function validates that the input is a positive integer (>= 1) and
returns it with the PositiveInt brand. This ensures type safety for
operations that require strictly positive integer values.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt branded type

#### Example

```ts
const branded = asPositiveInt(7);

assert(branded === 7);
assert.ok(PositiveInt.is(branded));
```

#### Throws

If the value is not a positive integer

***

### asPositiveInt16()

> `const` **asPositiveInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int16.d.mts:16

Casts a number to a PositiveInt16 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt16 type.

#### Throws

If the value is not a positive integer in [1, 2^15).

***

### asPositiveInt32()

> `const` **asPositiveInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int32.d.mts:16

Casts a number to a PositiveInt32 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt32 type.

#### Throws

If the value is not a positive integer in [1, 2^31).

***

### asPositiveSafeInt()

> `const` **asPositiveSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-safe-int.d.mts:34

Casts a number to a PositiveSafeInt type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveSafeInt type.

#### Example

```ts
const branded = asPositiveSafeInt(128);

assert(branded === 128);
assert.ok(PositiveSafeInt.is(branded));
```

#### Throws

If the value is not a positive safe integer.

***

### asPositiveUint16()

> `const` **asPositiveUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-uint16.d.mts:16

Casts a number to a PositiveUint16 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveUint16 type.

#### Throws

If the value is not a positive integer in [1, 2^16).

***

### asPositiveUint32()

> `const` **asPositiveUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-uint32.d.mts:16

Casts a number to a PositiveUint32 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveUint32 type.

#### Throws

If the value is not a positive integer in [1, 2^32).

***

### asSafeInt()

> `const` **asSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/safe-int.d.mts:40

Casts a number to a SafeInt branded type.

This function validates that the input is a safe integer (within ±(2^53 - 1))
and returns it with the SafeInt brand. This ensures type safety for
operations that require precise integer arithmetic.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a SafeInt branded type

#### Example

```ts
const branded = asSafeInt(123);

assert(branded === 123);
assert.ok(SafeInt.is(branded));
```

#### Throws

If the value is not a safe integer

***

### asSafeUint()

> `const` **asSafeUint**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/safe-uint.d.mts:15

Casts a number to a SafeUint type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a SafeUint type.

#### Throws

If the value is not a non-negative safe integer.

***

### asUint()

> `const` **asUint**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint.d.mts:32

Casts a number to a Uint type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a Uint type.

#### Example

```ts
const branded = asUint(12);

assert(branded === 12);
assert.ok(Uint.is(branded));
```

#### Throws

If the value is not a non-negative integer.

***

### asUint16()

> `const` **asUint16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint16.d.mts:17

Casts a number to a Uint16 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a Uint16 type.

#### Throws

If the value is not a non-negative integer less than
  2^16.

***

### asUint32()

> `const` **asUint32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint32.d.mts:17

Casts a number to a Uint32 type.

#### Type Parameters

##### N

`N` *extends* `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a Uint32 type.

#### Throws

If the value is not a non-negative integer less than
  2^32.

***

### asUint8()

> `const` **asUint8**: (`x`) => `Uint8`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/enum/uint8.d.mts:17

Casts a number to a Uint8 type. This function validates that the input is
within the Uint8 range [0, 255] and is an integer, then returns it with the
Uint8 brand.

#### Parameters

##### x

`number`

#### Returns

`Uint8`

The value as a Uint8 type.

#### Throws

If the value is not a valid 8-bit unsigned integer.

***

### FiniteNumber

> `const` **FiniteNumber**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/finite-number.d.mts:44

Namespace providing type-safe operations for FiniteNumber branded types.

The FiniteNumber type represents any finite numeric value, excluding the
special values NaN, Infinity, and -Infinity. All operations are guaranteed to
maintain the finite constraint when given finite inputs.

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

##### ceil()

> `readonly` **ceil**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

Returns the smallest integer greater than or equal to the given finite
number.

###### Parameters

###### x

`ElementType`

The finite number to ceil

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToInt`\<`ElementType`\>

The ceiling value as an Int

##### div()

> `readonly` **div**: (`x`, `y`) => `FiniteNumber`

Divides two finite numbers.

The divisor must be non-zero (enforced by type constraints). The result is
guaranteed to be finite when both inputs are finite and the divisor is
non-zero.

###### Parameters

###### x

`FiniteNumber`

###### y

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>

###### Returns

`FiniteNumber`

The quotient `a / b` as a FiniteNumber

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

##### random()

> `readonly` **random**: (`min?`, `max?`) => `FiniteNumber`

Generates a random finite number within the specified range.

The generated value is uniformly distributed in the range [min, max]. Both
bounds are inclusive.

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

***

### Int

> `const` **Int**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int.d.mts:59

Namespace providing type-safe operations for Int branded types.

The Int type represents any integer value (no fractional component) without
range restrictions. All operations preserve the integer constraint, using
floor division for division operations.

Unlike SafeInt, Int allows values outside the safe integer range (±2^53 - 1),
but be aware that very large integers may lose precision in JavaScript's
number type.

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int`\>

Returns the absolute value of an integer.

The result is always non-negative and maintains the Int brand. Note that
Math.abs(Number.MIN_SAFE_INTEGER) exceeds Number.MAX_SAFE_INTEGER, so use
SafeInt for guaranteed precision.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`Int`\>

The absolute value as a non-negative Int

###### Example

```ts
const negative = asInt(-12);
const absolute = Int.abs(negative);

assert(absolute === 12);
assert.ok(Int.is(absolute));
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

```ts
const sum = Int.add(asInt(12), asInt(8));

assert(sum === 20);
```

##### div()

> `readonly` **div**: (`x`, `y`) => `Int`

Divides two integers using floor division.

Performs mathematical floor division: `⌊a / b⌋`. The result is always an
integer, rounding toward negative infinity.

###### Parameters

###### x

`WithSmallInt`\<`Int`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`Int`

The integer quotient as an Int

###### Example

```ts
const dividend = asInt(17);
const divisor = asInt(5);
const quotient = Int.div(dividend, divisor);

assert(quotient === 3);
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

###### Example

```ts
assert.ok(isInt(5));
assert.notOk(isInt(5.25));
assert.ok(Int.is(-10));
```

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

```ts
const largest = Int.max(asInt(7), asInt(-3), asInt(2));

assert(largest === 7);
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

```ts
const smallest = Int.min(asInt(7), asInt(-3), asInt(2));

assert(smallest === -3);
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

```ts
const product = Int.mul(asInt(-4), asInt(6));

assert(product === -24);
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

```ts
const base = asInt(2);
const exponent = asInt(5);
const power = Int.pow(base, exponent);

assert(power === 32);
```

##### random()

> `readonly` **random**: (`min?`, `max?`) => `Int`

Generates a random integer within the specified range (inclusive).

The range is inclusive on both ends, so random(1, 6) can return any of: 1,
2, 3, 4, 5, or 6.

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

```ts
const min = asInt(1);
const max = asInt(6);
const randomValue = Int.random(min, max);

assert.ok(Int.is(randomValue));
assert.ok(randomValue >= 1 && randomValue <= 6);
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

```ts
const difference = Int.sub(asInt(12), asInt(8));

assert(difference === 4);
```

***

### Int16

> `const` **Int16**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int16.d.mts:41

Namespace providing type-safe arithmetic operations for 16-bit signed
integers.

All operations automatically clamp results to the valid Int16 range [-32768,
32767]. This ensures that all arithmetic maintains the 16-bit signed integer
constraint.

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

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `number`

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

***

### Int32

> `const` **Int32**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int32.d.mts:37

Namespace providing type-safe arithmetic operations for 32-bit signed
integers.

All operations automatically clamp results to the valid Int32 range
[-2147483648, 2147483647]. This ensures that all arithmetic maintains the
32-bit signed integer constraint, preventing overflow.

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

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `number`

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

***

### Int8

> `const` **Int8**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/enum/int8.d.mts:38

Namespace providing type-safe operations for Int8 (8-bit signed integer)
branded types.

Int8 represents signed integers in the range [-128, 127], equivalent to a
signed byte in many programming languages. All operations automatically clamp
results to stay within this range, preventing overflow/underflow issues.

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

`N` *extends* `Int8`

###### Parameters

###### x

`N`

###### Returns

`AbsoluteValue`\<`N`\>

The absolute value as an Int8, clamped to valid range.

##### add()

> `readonly` **add**: (`x`, `y`) => `Int8`

Adds two Int8 values, clamped to Int8 range.

###### Parameters

###### x

`Int8`

First operand

###### y

`Int8`

Second operand

###### Returns

`Int8`

`x + y` clamped to [-128, 127]

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

Divides two Int8 values, clamped to Int8 range.

###### Parameters

###### x

`Int8`

The dividend

###### y

`Exclude`\<`Int8`, `0`\>

The divisor (cannot be 0)

###### Returns

`Int8`

`⌊x / y⌋` clamped to [-128, 127]

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

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `127`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `-128`

The minimum value for an 8-bit signed integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `Int8`

Multiplies two Int8 values, clamped to Int8 range.

###### Parameters

###### x

`Int8`

First operand

###### y

`Int8`

Second operand

###### Returns

`Int8`

`x * y` clamped to [-128, 127]

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Int8`

Raises x to the power of y, clamped to Int8 range.

###### Parameters

###### x

`Int8`

The base

###### y

`Int8`

The exponent

###### Returns

`Int8`

`x ** y` clamped to [-128, 127]

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

##### sub()

> `readonly` **sub**: (`x`, `y`) => `Int8`

Subtracts two Int8 values, clamped to Int8 range.

###### Parameters

###### x

`Int8`

First operand

###### y

`Int8`

Second operand

###### Returns

`Int8`

`x - y` clamped to [-128, 127]

***

### isBigint()

> `const` **isBigint**: (`u`) => `u is bigint`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/guard/is-type.d.mts:166

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

`true` if `u` is a bigint, `false` otherwise. When `true`,
  TypeScript narrows the type to `bigint`.

#### Example

```ts
const values: unknown[] = [1n, 2, 3n];

const bigints = values.filter(isBigint);

assert.deepStrictEqual(bigints, [1n, 3n]);
```

***

### isFiniteNumber()

> `const` **isFiniteNumber**: (`a`) => `a is FiniteNumber`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/finite-number.d.mts:13

Type guard that checks if a value is a finite number.

Returns `true` if the value is a finite number (not NaN, Infinity, or
-Infinity). This is stricter than the standard number type, which includes
these special values.

#### Parameters

##### a

`number`

#### Returns

`a is FiniteNumber`

`true` if the value is finite, `false` otherwise

***

### isInt()

> `const` **isInt**: (`a`) => `a is Int`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int.d.mts:20

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

```ts
assert.ok(isInt(5));
assert.notOk(isInt(5.25));
assert.ok(Int.is(-10));
```

***

### isInt16()

> `const` **isInt16**: (`a`) => `a is Int16`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int16.d.mts:9

Checks if a number is an Int16 (16-bit signed integer in the range [-2^15,
2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is Int16`

`true` if the value is an Int16, `false` otherwise.

***

### isInt32()

> `const` **isInt32**: (`a`) => `a is Int32`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/int32.d.mts:9

Checks if a number is an Int32 (32-bit signed integer in the range [-2^31,
2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is Int32`

`true` if the value is an Int32, `false` otherwise.

***

### isInt8()

> `const` **isInt8**: (`x`) => `x is Int8`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/enum/int8.d.mts:10

Type guard that checks if a value is an 8-bit signed integer.

An Int8 is a signed integer in the range [-128, 127], representing values
that fit in exactly 8 bits of memory.

#### Parameters

##### x

`number`

#### Returns

`x is Int8`

`true` if the value is an Int8, `false` otherwise

***

### isNonNegativeFiniteNumber()

> `const` **isNonNegativeFiniteNumber**: (`a`) => `a is NonNegativeFiniteNumber`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-finite-number.d.mts:9

Checks if a number is a NonNegativeFiniteNumber (a finite number >= 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeFiniteNumber`

`true` if the value is a NonNegativeFiniteNumber, `false` otherwise.

***

### isNonNegativeInt16()

> `const` **isNonNegativeInt16**: (`a`) => `a is NonNegativeInt16`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-int16.d.mts:8

Checks if a number is a NonNegativeInt16 (16-bit non-negative signed integer
in the range [0, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt16`

`true` if the value is a NonNegativeInt16, `false` otherwise.

***

### isNonNegativeInt32()

> `const` **isNonNegativeInt32**: (`a`) => `a is NonNegativeInt32`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-int32.d.mts:8

Checks if a number is a NonNegativeInt32 (32-bit non-negative signed integer
in the range [0, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt32`

`true` if the value is a NonNegativeInt32, `false` otherwise.

***

### isNonZeroFiniteNumber()

> `const` **isNonZeroFiniteNumber**: (`a`) => `a is NonZeroFiniteNumber`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-finite-number.d.mts:9

Checks if a number is a NonZeroFiniteNumber (a finite number that is not 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroFiniteNumber`

`true` if the value is a NonZeroFiniteNumber, `false` otherwise.

***

### isNonZeroInt()

> `const` **isNonZeroInt**: (`a`) => `a is NonZeroInt`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int.d.mts:8

Checks if a number is a NonZeroInt.

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt`

`true` if the value is a NonZeroInt, `false` otherwise.

***

### isNonZeroInt16()

> `const` **isNonZeroInt16**: (`a`) => `a is NonZeroInt16`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int16.d.mts:9

Checks if a number is a NonZeroInt16 (16-bit non-zero signed integer in the
range [-2^15, 2^15) excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt16`

`true` if the value is a NonZeroInt16, `false` otherwise.

***

### isNonZeroInt32()

> `const` **isNonZeroInt32**: (`a`) => `a is NonZeroInt32`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int32.d.mts:9

Checks if a number is a NonZeroInt32 (32-bit non-zero signed integer in the
range [-2^31, 2^31) excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroInt32`

`true` if the value is a NonZeroInt32, `false` otherwise.

***

### isNonZeroSafeInt()

> `const` **isNonZeroSafeInt**: (`a`) => `a is NonZeroSafeInt`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-safe-int.d.mts:9

Checks if a number is a NonZeroSafeInt (a non-zero safe integer in the range
[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroSafeInt`

`true` if the value is a NonZeroSafeInt, `false` otherwise.

***

### isNonZeroUint16()

> `const` **isNonZeroUint16**: (`a`) => `a is PositiveUint16`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-uint16.d.mts:8

Checks if a number is a NonZeroUint16 (16-bit non-zero unsigned integer in
the range [1, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint16`

`true` if the value is a NonZeroUint16, `false` otherwise.

***

### isNonZeroUint32()

> `const` **isNonZeroUint32**: (`a`) => `a is PositiveUint32`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-uint32.d.mts:8

Checks if a number is a NonZeroUint32 (32-bit non-zero unsigned integer in
the range [1, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint32`

`true` if the value is a NonZeroUint32, `false` otherwise.

***

### isPositiveFiniteNumber()

> `const` **isPositiveFiniteNumber**: (`a`) => `a is PositiveFiniteNumber`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-finite-number.d.mts:9

Checks if a number is a PositiveFiniteNumber (a finite number > 0).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveFiniteNumber`

`true` if the value is a PositiveFiniteNumber, `false` otherwise.

***

### isPositiveInt()

> `const` **isPositiveInt**: (`a`) => `a is PositiveInt`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int.d.mts:18

Type guard that checks if a value is a positive integer.

A positive integer is any integer greater than zero (>= 1). This excludes
zero, negative numbers, and non-integers.

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt`

`true` if the value is a positive integer, `false` otherwise

#### Example

```ts
assert.ok(isPositiveInt(5));
assert.notOk(isPositiveInt(0));
assert.ok(PositiveInt.is(10));
```

***

### isPositiveInt16()

> `const` **isPositiveInt16**: (`a`) => `a is PositiveInt16`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int16.d.mts:8

Checks if a number is a PositiveInt16 (16-bit positive signed integer in the
range [1, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt16`

`true` if the value is a PositiveInt16, `false` otherwise.

***

### isPositiveInt32()

> `const` **isPositiveInt32**: (`a`) => `a is PositiveInt32`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int32.d.mts:8

Checks if a number is a PositiveInt32 (32-bit positive signed integer in the
range [1, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt32`

`true` if the value is a PositiveInt32, `false` otherwise.

***

### isPositiveSafeInt()

> `const` **isPositiveSafeInt**: (`a`) => `a is PositiveSafeInt`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-safe-int.d.mts:17

Checks if a number is a PositiveSafeInt (a positive safe integer in the range
[1, MAX_SAFE_INTEGER]).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveSafeInt`

`true` if the value is a PositiveSafeInt, `false` otherwise.

#### Example

```ts
assert.ok(isPositiveSafeInt(1));
assert.ok(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));
assert.notOk(isPositiveSafeInt(0));
assert.ok(PositiveSafeInt.is(42));
```

***

### isPositiveUint16()

> `const` **isPositiveUint16**: (`a`) => `a is PositiveUint16`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-uint16.d.mts:8

Checks if a number is a PositiveUint16 (16-bit positive unsigned integer in
the range [1, 2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint16`

`true` if the value is a PositiveUint16, `false` otherwise.

***

### isPositiveUint32()

> `const` **isPositiveUint32**: (`a`) => `a is PositiveUint32`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-uint32.d.mts:8

Checks if a number is a PositiveUint32 (32-bit positive unsigned integer in
the range [1, 2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveUint32`

`true` if the value is a PositiveUint32, `false` otherwise.

***

### isSafeInt()

> `const` **isSafeInt**: (`a`) => `a is SafeInt`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/safe-int.d.mts:19

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

```ts
assert.ok(isSafeInt(Number.MAX_SAFE_INTEGER));
assert.notOk(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));
assert.ok(SafeInt.is(Number.MIN_SAFE_INTEGER));
```

***

### isSafeUint()

> `const` **isSafeUint**: (`a`) => `a is SafeUint`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/safe-uint.d.mts:7

Checks if a number is a SafeUint.

#### Parameters

##### a

`number`

#### Returns

`a is SafeUint`

`true` if the value is a SafeUint, `false` otherwise.

***

### isUint()

> `const` **isUint**: (`a`) => `a is NonNegativeInt`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint.d.mts:15

Checks if a number is a Uint.

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt`

`true` if the value is a Uint, `false` otherwise.

#### Example

```ts
assert.ok(isUint(4));
assert.notOk(isUint(-1));
assert.ok(Uint.is(0));
```

***

### isUint16()

> `const` **isUint16**: (`a`) => `a is Uint16`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint16.d.mts:8

Checks if a number is a Uint16 (16-bit unsigned integer in the range [0,
2^16)).

#### Parameters

##### a

`number`

#### Returns

`a is Uint16`

`true` if the value is a Uint16, `false` otherwise.

***

### isUint32()

> `const` **isUint32**: (`a`) => `a is Uint32`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint32.d.mts:8

Checks if a number is a Uint32 (32-bit unsigned integer in the range [0,
2^32)).

#### Parameters

##### a

`number`

#### Returns

`a is Uint32`

`true` if the value is a Uint32, `false` otherwise.

***

### isUint8()

> `const` **isUint8**: (`x`) => `x is Uint8`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/enum/uint8.d.mts:7

Checks if a number is a Uint8 (8-bit unsigned integer in the range [0, 255]).

#### Parameters

##### x

`number`

#### Returns

`x is Uint8`

`true` if the value is a Uint8, `false` otherwise.

***

### NonNegativeFiniteNumber

> `const` **NonNegativeFiniteNumber**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-finite-number.d.mts:37

Namespace providing type-safe arithmetic operations for non-negative finite
numbers.

All operations maintain the non-negative constraint by clamping negative
results to 0, while ensuring results remain finite (excluding NaN and
Infinity). This type is useful for representing measurements, distances,
weights, and other inherently non-negative values.

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

`true` if the value is a non-negative finite number, `false`
  otherwise.

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

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

Raises a NonNegativeFiniteNumber to the power of another
NonNegativeFiniteNumber.

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

`a - b` clamped to [0, +∞) as a NonNegativeFiniteNumber (minimum
  0).

***

### NonNegativeInt16

> `const` **NonNegativeInt16**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-int16.d.mts:42

Namespace providing type-safe arithmetic operations for 16-bit non-negative
integers.

All operations automatically clamp results to the valid NonNegativeInt16
range [0, 32767]. This ensures that all arithmetic maintains the 16-bit
non-negative integer constraint, with negative results clamped to 0 and
overflow results clamped to MAX_VALUE.

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

`true` if the value is a 16-bit non-negative integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt16`

Returns the larger of two NonNegativeInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt16`, `40`\>[]

###### Returns

`NonNegativeInt16`

The maximum value as a NonNegativeInt16.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

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

***

### NonNegativeInt32

> `const` **NonNegativeInt32**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-negative-int32.d.mts:40

Namespace providing type-safe arithmetic operations for 32-bit non-negative
integers.

All operations automatically clamp results to the valid NonNegativeInt32
range [0, 2147483647]. This ensures that all arithmetic maintains the 32-bit
non-negative integer constraint, with negative results clamped to 0 and
overflow results clamped to MAX_VALUE.

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

`true` if the value is a 32-bit non-negative integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt32`

Returns the larger of two NonNegativeInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt32`, `40`\>[]

###### Returns

`NonNegativeInt32`

The maximum value as a NonNegativeInt32.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

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

`a - b` clamped to [0, 2147483647] as a NonNegativeInt32 (minimum
  0).

***

### NonZeroFiniteNumber

> `const` **NonZeroFiniteNumber**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-finite-number.d.mts:32

Namespace providing type-safe arithmetic operations for non-zero finite
numbers.

All operations maintain the non-zero constraint while ensuring results remain
finite (excluding NaN and Infinity). This type is useful for values that must
never be zero, such as denominators, scaling factors, and ratios.

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

`true` if the value is a non-zero finite number, `false`
  otherwise.

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

***

### NonZeroInt

> `const` **NonZeroInt**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int.d.mts:31

Namespace providing type-safe arithmetic operations for non-zero integers.

All operations maintain the non-zero constraint, ensuring that results are
always valid NonZeroInt values. Division operations return floor division
results, and all arithmetic maintains integer precision.

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

***

### NonZeroInt16

> `const` **NonZeroInt16**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int16.d.mts:43

Namespace providing type-safe arithmetic operations for 16-bit non-zero
signed integers.

All operations automatically clamp results to the valid NonZeroInt16 range
[-32768, 32767] excluding 0. This ensures that all arithmetic maintains the
16-bit non-zero signed integer constraint, preventing zero results and
overflow.

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

`true` if the value is a 16-bit non-zero signed integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt16`

Returns the larger of two NonZeroInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt16`, `40`\>[]

###### Returns

`NonZeroInt16`

The maximum value as a NonZeroInt16.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `number`

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

A random NonZeroInt16 between MIN_VALUE and MAX_VALUE (excluding
  0).

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

***

### NonZeroInt32

> `const` **NonZeroInt32**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-int32.d.mts:39

Namespace providing type-safe arithmetic operations for 32-bit non-zero
signed integers.

All operations automatically clamp results to the valid NonZeroInt32 range
[-2147483648, 2147483647] excluding 0. This ensures that all arithmetic
maintains the 32-bit non-zero signed integer constraint, preventing zero
results and overflow.

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

The value clamped to [-2147483648, 2147483647] \ {0} as a
  NonZeroInt32.

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

`true` if the value is a 32-bit non-zero signed integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroInt32`

Returns the larger of two NonZeroInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroInt32`, `40`\>[]

###### Returns

`NonZeroInt32`

The maximum value as a NonZeroInt32.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `number`

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

A random NonZeroInt32 between MIN_VALUE and MAX_VALUE (excluding
  0).

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

***

### NonZeroSafeInt

> `const` **NonZeroSafeInt**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-safe-int.d.mts:35

Namespace providing type-safe arithmetic operations for non-zero safe
integers.

All operations automatically clamp results to the non-zero safe integer
range, excluding zero. This ensures that all arithmetic maintains both the
non-zero constraint and IEEE 754 precision guarantees, preventing precision
loss while ensuring results are never zero.

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

`a + b` clamped to non-zero safe integer range as a
  NonZeroSafeInt.

##### clamp()

> `readonly` **clamp**: (`x`) => `NonZeroSafeInt`

Clamps a number to the non-zero safe integer range.

###### Parameters

###### x

`number`

###### Returns

`NonZeroSafeInt`

The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] \ {0} as
  a NonZeroSafeInt.

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

`⌊a / b⌋` clamped to non-zero safe integer range as a
  NonZeroSafeInt.

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

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `SafeUint`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `SafeInt`

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

`a * b` clamped to non-zero safe integer range as a
  NonZeroSafeInt.

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

`a ** b` clamped to non-zero safe integer range as a
  NonZeroSafeInt.

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

A random non-zero safe integer between MIN_SAFE_INTEGER and
  MAX_SAFE_INTEGER.

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

`a - b` clamped to non-zero safe integer range as a
  NonZeroSafeInt.

***

### NonZeroUint16

> `const` **NonZeroUint16**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-uint16.d.mts:42

Namespace providing type-safe arithmetic operations for 16-bit non-zero
unsigned integers.

All operations automatically clamp results to the valid NonZeroUint16 range
[1, 65535]. This ensures that all arithmetic maintains the 16-bit non-zero
unsigned integer constraint, with results below 1 clamped to MIN_VALUE and
overflow results clamped to MAX_VALUE.

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

`true` if the value is a 16-bit non-zero unsigned integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint16`

Returns the larger of two NonZeroUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The maximum value as a NonZeroUint16.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

***

### NonZeroUint32

> `const` **NonZeroUint32**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/non-zero-uint32.d.mts:40

Namespace providing type-safe arithmetic operations for 32-bit non-zero
unsigned integers.

All operations automatically clamp results to the valid NonZeroUint32 range
[1, 4294967295]. This ensures that all arithmetic maintains the 32-bit
non-zero unsigned integer constraint, with results below 1 clamped to
MIN_VALUE and overflow results clamped to MAX_VALUE.

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

`true` if the value is a 32-bit non-zero unsigned integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint32`

Returns the larger of two NonZeroUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The maximum value as a NonZeroUint32.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

***

### PositiveFiniteNumber

> `const` **PositiveFiniteNumber**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-finite-number.d.mts:38

Namespace providing type-safe arithmetic operations for positive finite
numbers.

All operations maintain the positive constraint by clamping non-positive
results to MIN_VALUE, while ensuring results remain finite (excluding NaN and
Infinity). This type is useful for representing quantities that must always
be positive, such as probabilities, magnitudes, and physical measurements.

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

`true` if the value is a positive finite number, `false`
  otherwise.

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `number`

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

`a - b` clamped to (0, +∞) as a PositiveFiniteNumber (minimum
  MIN_VALUE).

***

### PositiveInt

> `const` **PositiveInt**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int.d.mts:68

Namespace providing type-safe operations for PositiveInt branded types.

PositiveInt represents integers that are strictly greater than zero (>= 1).
All operations automatically clamp results to maintain the positive
constraint, ensuring that arithmetic operations never produce zero or
negative values.

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

```ts
const sum = PositiveInt.add(asPositiveInt(4), asPositiveInt(5));

assert(sum === 9);
```

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveInt`

Clamps a number to the positive integer range.

Since PositiveInt has a minimum value of 1, this function ensures that any
input less than 1 is clamped to 1.

###### Parameters

###### x

`number`

###### Returns

`PositiveInt`

The value clamped to >= 1 as a PositiveInt

###### Example

```ts
const belowRange = PositiveInt.clamp(0);
const withinRange = PositiveInt.clamp(10);

assert(belowRange === 1);
assert(withinRange === 10);
```

##### div()

> `readonly` **div**: (`x`, `y`) => `PositiveInt`

Divides two positive integers using floor division, clamping to remain
positive.

Performs mathematical floor division: `⌊a / b⌋`. If the result would be 0
(when a < b), it is clamped to 1 to maintain the positive integer
constraint.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`PositiveInt`

`max(1, ⌊a / b⌋)` as a PositiveInt

###### Example

```ts
const quotient = PositiveInt.div(asPositiveInt(9), asPositiveInt(2));
const clamped = PositiveInt.div(asPositiveInt(3), asPositiveInt(10));

assert(quotient === 4);
assert(clamped === 1);
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

###### Example

```ts
assert.ok(isPositiveInt(5));
assert.notOk(isPositiveInt(0));
assert.ok(PositiveInt.is(10));
```

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

```ts
const largest = PositiveInt.max(
  asPositiveInt(9),
  asPositiveInt(3),
  asPositiveInt(12),
);

assert(largest === 12);
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

```ts
const smallest = PositiveInt.min(
  asPositiveInt(9),
  asPositiveInt(3),
  asPositiveInt(12),
);

assert(smallest === 3);
```

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

```ts
const product = PositiveInt.mul(asPositiveInt(3), asPositiveInt(7));

assert(product === 21);
```

##### pow()

> `readonly` **pow**: (`x`, `y`) => `PositiveInt`

Raises a positive integer to a power, ensuring the result is never less
than 1.

###### Parameters

###### x

`WithSmallInt`\<`PositiveInt`, `40`\>

###### y

`WithSmallInt`\<`PositiveInt`, `40`\>

###### Returns

`PositiveInt`

`a ** b` as a PositiveInt, but never less than 1

###### Example

```ts
const base = asPositiveInt(2);
const exponent = asPositiveInt(4);
const power = PositiveInt.pow(base, exponent);

assert(power === 16);
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

```ts
const min = asPositiveInt(3);
const max = asPositiveInt(6);
const randomValue = PositiveInt.random(min, max);

assert.ok(PositiveInt.is(randomValue));
assert.ok(randomValue >= 3 && randomValue <= 6);
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

```ts
const difference = PositiveInt.sub(asPositiveInt(5), asPositiveInt(7));

assert(difference === 1);
```

***

### PositiveInt16

> `const` **PositiveInt16**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int16.d.mts:43

Namespace providing type-safe arithmetic operations for 16-bit positive
integers.

All operations automatically clamp results to the valid PositiveInt16 range
[1, 32767]. This ensures that all arithmetic maintains the 16-bit positive
integer constraint, with results below 1 clamped to MIN_VALUE and overflow
results clamped to MAX_VALUE.

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

`true` if the value is a 16-bit positive integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt16`

Returns the larger of two PositiveInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt16`, `40`\>[]

###### Returns

`PositiveInt16`

The maximum value as a PositiveInt16.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

***

### PositiveInt32

> `const` **PositiveInt32**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-int32.d.mts:41

Namespace providing type-safe arithmetic operations for 32-bit positive
integers.

All operations automatically clamp results to the valid PositiveInt32 range
[1, 2147483647]. This ensures that all arithmetic maintains the 32-bit
positive integer constraint, with results below 1 clamped to MIN_VALUE and
overflow results clamped to MAX_VALUE.

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

`true` if the value is a 32-bit positive integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt32`

Returns the larger of two PositiveInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt32`, `40`\>[]

###### Returns

`PositiveInt32`

The maximum value as a PositiveInt32.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

***

### PositiveSafeInt

> `const` **PositiveSafeInt**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-safe-int.d.mts:57

Namespace providing type-safe arithmetic operations for positive safe
integers.

All operations automatically clamp results to the positive safe integer range
[1, MAX_SAFE_INTEGER]. This ensures that all arithmetic maintains both the
positive constraint and IEEE 754 precision guarantees, preventing precision
loss and ensuring results are always positive.

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

###### Example

```ts
const sum = PositiveSafeInt.add(
  asPositiveSafeInt(1000),
  asPositiveSafeInt(2048),
);

assert(sum === 3048);
assert.ok(PositiveSafeInt.is(sum));
```

##### clamp()

> `readonly` **clamp**: (`x`) => `PositiveSafeInt`

Clamps a number to the positive safe integer range.

###### Parameters

###### x

`number`

###### Returns

`PositiveSafeInt`

The value clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.

###### Example

```ts
const belowRange = PositiveSafeInt.clamp(0);
const withinRange = PositiveSafeInt.clamp(123);
const aboveRange = PositiveSafeInt.clamp(Number.MAX_SAFE_INTEGER + 10);

assert(belowRange === 1);
assert(withinRange === 123);
assert(aboveRange === Number.MAX_SAFE_INTEGER);
```

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

###### Example

```ts
const quotient = PositiveSafeInt.div(
  asPositiveSafeInt(25),
  asPositiveSafeInt(4),
);
const clamped = PositiveSafeInt.div(
  asPositiveSafeInt(5),
  asPositiveSafeInt(50),
);

assert(quotient === 6);
assert(clamped === 1);
```

##### is()

> `readonly` **is**: (`a`) => `a is PositiveSafeInt`

Type guard to check if a value is a PositiveSafeInt.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveSafeInt`

`true` if the value is a positive safe integer, `false` otherwise.

###### Example

```ts
assert.ok(isPositiveSafeInt(1));
assert.ok(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));
assert.notOk(isPositiveSafeInt(0));
assert.ok(PositiveSafeInt.is(42));
```

###### See

[isPositiveSafeInt](#ispositivesafeint) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `PositiveSafeInt`

Returns the larger of two PositiveSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveSafeInt`, `40`\>[]

###### Returns

`PositiveSafeInt`

The maximum value as a PositiveSafeInt.

###### Example

```ts
const largest = PositiveSafeInt.max(
  asPositiveSafeInt(10),
  asPositiveSafeInt(5),
);

assert(largest === 10);
```

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `SafeUint`

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

###### Example

```ts
const smallest = PositiveSafeInt.min(
  asPositiveSafeInt(10),
  asPositiveSafeInt(5),
);

assert(smallest === 5);
```

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

###### Example

```ts
const product = PositiveSafeInt.mul(
  asPositiveSafeInt(50),
  asPositiveSafeInt(20),
);

assert(product === 1000);
assert.ok(PositiveSafeInt.is(product));
```

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

###### Example

```ts
const base = asPositiveSafeInt(3);
const exponent = asPositiveSafeInt(3);
const power = PositiveSafeInt.pow(base, exponent);

assert(power === 27);
```

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

###### Example

```ts
const min = asPositiveSafeInt(1);
const max = asPositiveSafeInt(6);
const randomValue = PositiveSafeInt.random(min, max);

assert.ok(PositiveSafeInt.is(randomValue));
assert.ok(randomValue >= 1 && randomValue <= 6);
```

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

`a - b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt
  (minimum 1).

###### Example

```ts
const difference = PositiveSafeInt.sub(
  asPositiveSafeInt(10),
  asPositiveSafeInt(20),
);

assert(difference === 1);
assert.ok(PositiveSafeInt.is(difference));
```

***

### PositiveUint16

> `const` **PositiveUint16**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-uint16.d.mts:42

Namespace providing type-safe arithmetic operations for 16-bit positive
unsigned integers.

All operations automatically clamp results to the valid PositiveUint16 range
[1, 65535]. This ensures that all arithmetic maintains the 16-bit positive
unsigned integer constraint, with results below 1 clamped to MIN_VALUE and
overflow results clamped to MAX_VALUE.

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

`true` if the value is a 16-bit positive unsigned integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint16`

Returns the larger of two PositiveUint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint16`, `40`\>[]

###### Returns

`PositiveUint16`

The maximum value as a PositiveUint16.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

***

### PositiveUint32

> `const` **PositiveUint32**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/positive-uint32.d.mts:40

Namespace providing type-safe arithmetic operations for 32-bit positive
unsigned integers.

All operations automatically clamp results to the valid PositiveUint32 range
[1, 4294967295]. This ensures that all arithmetic maintains the 32-bit
positive unsigned integer constraint, with results below 1 clamped to
MIN_VALUE and overflow results clamped to MAX_VALUE.

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

`true` if the value is a 32-bit positive unsigned integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveUint32`

Returns the larger of two PositiveUint32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveUint32`, `40`\>[]

###### Returns

`PositiveUint32`

The maximum value as a PositiveUint32.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `1`

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

`a - b` clamped to [1, 4294967295] as a PositiveUint32 (minimum
  1).

***

### SafeInt

> `const` **SafeInt**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/safe-int.d.mts:64

Namespace providing type-safe operations for SafeInt branded types.

SafeInt represents integers that can be exactly represented in JavaScript's
number type without precision loss. The range is [±(2^53 - 1)], which covers
approximately ±9 quadrillion.

All operations automatically clamp results to stay within the safe range,
preventing precision loss that occurs with larger integers. This makes
SafeInt ideal for:

- Financial calculations requiring exact cents
- Database IDs and counters
- Array indices and sizes
- Any integer arithmetic requiring precision guarantees

#### Type Declaration

##### abs()

> `readonly` **abs**: (`x`) => `TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`SafeInt`\>

Returns the absolute value of a safe integer.

Note: `Math.abs(MIN_SAFE_INTEGER)` would exceed `MAX_SAFE_INTEGER`, so this
function clamps the result to maintain the safe integer guarantee.

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### Returns

`TsDataForgeInternals.RefinedNumberUtils.ToNonNegative`\<`SafeInt`\>

The absolute value as a SafeInt, clamped if necessary

###### Example

```ts
const negative = asSafeInt(-900);
const absolute = SafeInt.abs(negative);

assert(absolute === 900);
assert.ok(SafeInt.is(absolute));
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

###### Example

```ts
const sum = SafeInt.add(asSafeInt(9), asSafeInt(4));

assert(sum === 13);
assert.ok(SafeInt.is(sum));
```

##### clamp()

> `readonly` **clamp**: (`x`) => `SafeInt`

Clamps a number to the safe integer range.

###### Parameters

###### x

`number`

###### Returns

`SafeInt`

The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] as a
  SafeInt.

###### Example

```ts
const aboveRange = SafeInt.clamp(1e20);
const withinRange = SafeInt.clamp(123);
const belowRange = SafeInt.clamp(-1e20);

assert(aboveRange === Number.MAX_SAFE_INTEGER);
assert(withinRange === 123);
assert(belowRange === Number.MIN_SAFE_INTEGER);
```

##### div()

> `readonly` **div**: (`x`, `y`) => `SafeInt`

Divides one SafeInt by another using floor division.

Performs mathematical floor division: `⌊a / b⌋`. The divisor must be
non-zero (enforced by type constraints).

###### Parameters

###### x

`WithSmallInt`\<`SafeInt`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `-1` | `-2` | `-3` | `-32` | `-4` | `-5` | `-6` | `-7` | `-8` | `-9` | `-11` | `-10` | `-24` | `-14` | `-34` | `-12` | `-13` | `-15` | `-16` | `-17` | `-18` | `-19` | `-20` | `-21` | `-22` | `-23` | `-25` | `-26` | `-27` | `-28` | `-29` | `-30` | `-31` | `-33` | `-35` | `-36` | `-37` | `-38` | `-39` | `-40` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`SafeInt`

The integer quotient as a SafeInt

###### Example

```ts
const quotient = SafeInt.div(asSafeInt(-17), asSafeInt(5));

assert(quotient === -4);
assert.ok(SafeInt.is(quotient));
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

###### Example

```ts
assert.ok(isSafeInt(Number.MAX_SAFE_INTEGER));
assert.notOk(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));
assert.ok(SafeInt.is(Number.MIN_SAFE_INTEGER));
```

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

```ts
const largest = SafeInt.max(asSafeInt(25), asSafeInt(-14), asSafeInt(99));

assert(largest === 99);
```

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `SafeUint`

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

```ts
const smallest = SafeInt.min(asSafeInt(25), asSafeInt(-14), asSafeInt(99));

assert(smallest === -14);
```

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `SafeInt`

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

###### Example

```ts
const product = SafeInt.mul(asSafeInt(-8), asSafeInt(7));

assert(product === -56);
assert.ok(SafeInt.is(product));
```

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

###### Example

```ts
const base = asSafeInt(3);
const exponent = asSafeInt(5);
const power = SafeInt.pow(base, exponent);

assert(power === 243);
assert.ok(SafeInt.is(power));
```

##### random()

> `readonly` **random**: (`min?`, `max?`) => `SafeInt`

Generates a random safe integer within the specified range (inclusive).

The range is inclusive on both ends. If min > max, they are automatically
swapped.

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

```ts
const min = asSafeInt(-10);
const max = asSafeInt(10);
const randomValue = SafeInt.random(min, max);

assert.ok(SafeInt.is(randomValue));
assert.ok(randomValue >= -10 && randomValue <= 10);
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

###### Example

```ts
const difference = SafeInt.sub(asSafeInt(9), asSafeInt(14));

assert(difference === -5);
assert.ok(SafeInt.is(difference));
```

***

### SafeUint

> `const` **SafeUint**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/safe-uint.d.mts:37

Namespace providing type-safe arithmetic operations for safe unsigned
integers.

All operations automatically clamp results to the safe unsigned integer range
[0, MAX_SAFE_INTEGER]. This ensures that all arithmetic maintains both the
non-negative constraint and IEEE 754 precision guarantees, preventing
precision loss while ensuring results are never negative.

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

`true` if the value is a non-negative safe integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `SafeUint`

Returns the larger of two SafeUint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`SafeUint`, `40`\>[]

###### Returns

`SafeUint`

The maximum value as a SafeUint.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `SafeUint`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

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

`a - b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint (minimum
  0).

***

### Uint

> `const` **Uint**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint.d.mts:51

Namespace providing type-safe arithmetic operations for unsigned integers.

All operations maintain the non-negative constraint by clamping negative
results to 0. This ensures that all arithmetic preserves the unsigned integer
property.

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

###### Example

```ts
const sum = Uint.add(asUint(5), asUint(8));

assert(sum === 13);
```

##### clamp()

> `readonly` **clamp**: (`x`) => `NonNegativeInt`

Clamps a number to the Uint range (non-negative).

###### Parameters

###### x

`number`

###### Returns

`NonNegativeInt`

The value clamped to [0, +∞) as a Uint.

###### Example

```ts
const clampedNegative = Uint.clamp(-5);
const clampedPositive = Uint.clamp(42);

assert(clampedNegative === 0);
assert(clampedPositive === 42);
```

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

###### Example

```ts
const quotient = Uint.div(asUint(10), asUint(4));

assert(quotient === 2);
```

##### is()

> `readonly` **is**: (`a`) => `a is NonNegativeInt`

Type guard to check if a value is a Uint.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeInt`

`true` if the value is a non-negative integer, `false` otherwise.

###### Example

```ts
assert.ok(isUint(4));
assert.notOk(isUint(-1));
assert.ok(Uint.is(0));
```

###### See

[isUint](#isuint) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt`

Returns the larger of two Uint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt`, `40`\>[]

###### Returns

`NonNegativeInt`

The maximum value as a Uint.

###### Example

```ts
const largest = Uint.max(asUint(7), asUint(3));

assert(largest === 7);
```

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeInt`

Returns the smaller of two Uint values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt`, `40`\>[]

###### Returns

`NonNegativeInt`

The minimum value as a Uint.

###### Example

```ts
const smallest = Uint.min(asUint(7), asUint(3));

assert(smallest === 3);
```

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

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

###### Example

```ts
const product = Uint.mul(asUint(7), asUint(6));

assert(product === 42);
```

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

###### Example

```ts
const base = asUint(2);
const exponent = asUint(5);
const power = Uint.pow(base, exponent);

assert(power === 32);
```

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

###### Example

```ts
const min = asUint(0);
const max = asUint(3);
const randomValue = Uint.random(min, max);

assert.ok(Uint.is(randomValue));
assert.ok(randomValue >= 0 && randomValue <= 3);
```

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

###### Example

```ts
const difference = Uint.sub(asUint(5), asUint(8));

assert(difference === 0);
```

***

### Uint16

> `const` **Uint16**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint16.d.mts:42

Namespace providing type-safe arithmetic operations for 16-bit unsigned
integers.

All operations automatically clamp results to the valid Uint16 range [0,
65535]. This ensures that all arithmetic maintains the 16-bit unsigned
integer constraint, with negative results clamped to 0 and overflow results
clamped to MAX_VALUE.

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

`true` if the value is a 16-bit unsigned integer, `false`
  otherwise.

##### max()

> `readonly` **max**: (...`values`) => `Uint16`

Returns the larger of two Uint16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`Uint16`, `40`\>[]

###### Returns

`Uint16`

The maximum value as a Uint16.

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

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

***

### Uint32

> `const` **Uint32**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/branded-types/uint32.d.mts:37

Utility functions for working with Uint32 (32-bit unsigned integer) branded
types. Provides type-safe operations that ensure results remain within the
valid range [0, 2^32). All arithmetic operations are clamped to maintain the
Uint32 constraint.

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

##### clamp()

> `readonly` **clamp**: (`x`) => `Uint32`

Clamps a Uint32 to be within the specified range.

###### Parameters

###### x

`number`

###### Returns

`Uint32`

The clamped value as a Uint32

##### div()

> `readonly` **div**: (`x`, `y`) => `Uint32`

Divides two Uint32 values using floor division, with result clamped to [0,
2^32).

###### Parameters

###### x

`WithSmallInt`\<`Uint32`, `40`\>

###### y

`1` | `2` | `3` | `32` | `4` | `5` | `6` | `7` | `8` | `9` | `11` | `10` | `24` | `14` | `34` | `12` | `13` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `33` | `35` | `36` | `37` | `38` | `39` | `NormalizeBrandUnion`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\>\>

###### Returns

`Uint32`

`⌊a / b⌋` as a Uint32, clamped to valid range

##### is()

> `readonly` **is**: (`a`) => `a is Uint32`

Type guard that checks if a value is a 32-bit unsigned integer.

###### Parameters

###### a

`number`

###### Returns

`a is Uint32`

`true` if the value is within the range [0, 2^32), `false`
  otherwise

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

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `number`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

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

***

### Uint8

> `const` **Uint8**: `object`

Defined in: node\_modules/.pnpm/ts-data-forge@5.0.0\_typescript@5.9.3/node\_modules/ts-data-forge/dist/number/enum/uint8.d.mts:27

Namespace providing type-safe arithmetic operations for 8-bit unsigned
integers.

All operations automatically clamp results to the valid Uint8 range [0, 255].
This ensures that all arithmetic maintains the 8-bit unsigned integer
constraint, with negative results clamped to 0 and overflow results clamped
to MAX_VALUE.

#### Type Declaration

##### add()

> `readonly` **add**: (`x`, `y`) => `Uint8`

Adds two Uint8 values, clamped to Uint8 range.

###### Parameters

###### x

`Uint8`

First operand

###### y

`Uint8`

Second operand

###### Returns

`Uint8`

`x + y` clamped to [0, 255]

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

Divides two Uint8 values, clamped to Uint8 range.

###### Parameters

###### x

`Uint8`

The dividend

###### y

`Exclude`\<`Uint8`, `0`\>

The divisor (cannot be 0)

###### Returns

`Uint8`

`⌊x / y⌋` clamped to [0, 255]

##### is()

> `readonly` **is**: (`x`) => `x is Uint8`

Type guard that checks if a value is an 8-bit unsigned integer.

###### Parameters

###### x

`number`

###### Returns

`x is Uint8`

`true` if the value is an 8-bit unsigned integer, `false`
  otherwise.

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

##### MAX\_VALUE

> `readonly` **MAX\_VALUE**: `255`

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

##### MIN\_VALUE

> `readonly` **MIN\_VALUE**: `0`

The minimum value for an 8-bit unsigned integer.

##### mul()

> `readonly` **mul**: (`x`, `y`) => `Uint8`

Multiplies two Uint8 values, clamped to Uint8 range.

###### Parameters

###### x

`Uint8`

First operand

###### y

`Uint8`

Second operand

###### Returns

`Uint8`

`x * y` clamped to [0, 255]

##### pow()

> `readonly` **pow**: (`x`, `y`) => `Uint8`

Raises x to the power of y, clamped to Uint8 range.

###### Parameters

###### x

`Uint8`

The base

###### y

`Uint8`

The exponent

###### Returns

`Uint8`

`x ** y` clamped to [0, 255]

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

Subtracts two Uint8 values, clamped to Uint8 range.

###### Parameters

###### x

`Uint8`

First operand

###### y

`Uint8`

Second operand

###### Returns

`Uint8`

`x - y` clamped to [0, 255]

## References

### array

Re-exports [array](../array/array.md#array)

***

### arrayAtLeastLength

Re-exports [arrayAtLeastLength](../array/array-at-least-length.md#arrayatleastlength)

***

### arrayOfLength

Re-exports [arrayOfLength](../array/array-of-length.md#arrayoflength)

***

### bigint

Re-exports [bigint](../primitives/bigint.md#bigint)

***

### boolean

Re-exports [boolean](../primitives/boolean.md#boolean)

***

### brand

Re-exports [brand](../brand/brand.md#brand)

***

### brandedNumber

Re-exports [brandedNumber](../brand/branded-number.md#brandednumber)

***

### brandedString

Re-exports [brandedString](../brand/branded-string.md#brandedstring)

***

### createAssertFn

Re-exports [createAssertFn](../utils/create-assert-fn.md#createassertfn)

***

### createCastFn

Re-exports [createCastFn](../utils/create-cast-fn.md#createcastfn)

***

### createIsFn

Re-exports [createIsFn](../utils/create-is-fn.md#createisfn)

***

### createPrimitiveType

Re-exports [createPrimitiveType](../utils/create-primitive-type.md#createprimitivetype)

***

### createPrimitiveValidationError

Re-exports [createPrimitiveValidationError](../utils/validation-error.md#createprimitivevalidationerror)

***

### createType

Re-exports [createType](../utils/create-type.md#createtype)

***

### email

Re-exports [email](../predefined/brand/string/email.md#email)

***

### enumType

Re-exports [enumType](../enum/enum.md#enumtype)

***

### ExcessPropertyBehavior

Re-exports [ExcessPropertyBehavior](../type/README.md#excesspropertybehavior)

***

### ExcessPropertyFillBehavior

Re-exports [ExcessPropertyFillBehavior](../type/README.md#excesspropertyfillbehavior)

***

### finiteNumber

Re-exports [finiteNumber](../predefined/brand/number/finite-number.md#finitenumber)

***

### int

Re-exports [int](../predefined/brand/number/int.md#int)

***

### int16

Re-exports [int16](../predefined/brand/number/int16.md#int16)

***

### int32

Re-exports [int32](../predefined/brand/number/int32.md#int32)

***

### int8

Re-exports [int8](../predefined/int8.md#int8)

***

### intersection

Re-exports [intersection](../compose/intersection.md#intersection)

***

### intRange

Re-exports [intRange](../enum/int-range.md#intrange)

***

### iso8601

Re-exports [iso8601](../predefined/brand/string/iso-8601.md#iso8601)

***

### isOptionalProperty

Re-exports [isOptionalProperty](../record/optional.md#isoptionalproperty)

***

### JsonObject

Re-exports [JsonObject](../predefined/json.md#jsonobject)

***

### JsonPrimitive

Re-exports [JsonPrimitive](../predefined/json.md#jsonprimitive)

***

### jsonString

Re-exports [jsonString](../predefined/brand/string/json-string.md#jsonstring)

***

### JsonValue

Re-exports [JsonValue](../predefined/json.md#jsonvalue)

***

### keyof

Re-exports [keyof](../record/keyof.md#keyof)

***

### keyValueRecord

Re-exports [keyValueRecord](../record/key-value-record.md#keyvaluerecord)

***

### literal

Re-exports [literal](../other-types/literal.md#literal)

***

### MapType

Re-exports [MapType](../other-types/map.md#maptype)

***

### mergeRecords

Re-exports [mergeRecords](../compose/merge-records.md#mergerecords)

***

### nonEmptyArray

Re-exports [nonEmptyArray](../array/non-empty-array.md#nonemptyarray)

***

### nonNegativeFiniteNumber

Re-exports [nonNegativeFiniteNumber](../predefined/brand/number/non-negative-finite-number.md#nonnegativefinitenumber)

***

### nonZeroFiniteNumber

Re-exports [nonZeroFiniteNumber](../predefined/brand/number/non-zero-finite-number.md#nonzerofinitenumber)

***

### nonZeroInt

Re-exports [nonZeroInt](../predefined/brand/number/non-zero-int.md#nonzeroint)

***

### nonZeroSafeInt

Re-exports [nonZeroSafeInt](../predefined/brand/number/non-zero-safe-int.md#nonzerosafeint)

***

### nullable

Re-exports [nullable](../predefined/nullable.md#nullable)

***

### nullType

Re-exports [nullType](../primitives/null.md#nulltype)

***

### number

Re-exports [number](../primitives/number.md#number)

***

### omit

Re-exports [omit](../record/omit.md#omit)

***

### OmittedType

Re-exports [OmittedType](../record/omit.md#omittedtype)

***

### optional

Re-exports [optional](../record/optional.md#optional)

***

### OptionalPropertyType

Re-exports [OptionalPropertyType](../record/optional.md#optionalpropertytype)

***

### OptionalType

Re-exports [OptionalType](../type/README.md#optionaltype)

***

### partial

Re-exports [partial](../record/partial.md#partial)

***

### PartialType

Re-exports [PartialType](../record/partial.md#partialtype)

***

### pick

Re-exports [pick](../record/pick.md#pick)

***

### PickedType

Re-exports [PickedType](../record/pick.md#pickedtype)

***

### positiveFiniteNumber

Re-exports [positiveFiniteNumber](../predefined/brand/number/positive-finite-number.md#positivefinitenumber)

***

### positiveInt

Re-exports [positiveInt](../predefined/brand/number/positive-int.md#positiveint)

***

### positiveSafeInt

Re-exports [positiveSafeInt](../predefined/brand/number/positive-safe-int.md#positivesafeint)

***

### prependIndexToValidationErrors

Re-exports [prependIndexToValidationErrors](../utils/validation-error.md#prependindextovalidationerrors)

***

### prependPathToValidationErrors

Re-exports [prependPathToValidationErrors](../utils/validation-error.md#prependpathtovalidationerrors)

***

### record

Re-exports [record](../record/record.md#record)

***

### RecordType

Re-exports [RecordType](../type/README.md#recordtype)

***

### recursion

Re-exports [recursion](../other-types/recursion.md#recursion)

***

### refine

Re-exports [refine](../other-types/refine.md#refine)

***

### required

Re-exports [required](../record/required.md#required)

***

### RequiredPropertyType

Re-exports [RequiredPropertyType](../record/optional.md#requiredpropertytype)

***

### RequiredType

Re-exports [RequiredType](../record/required.md#requiredtype)

***

### safeInt

Re-exports [safeInt](../predefined/brand/number/safe-int.md#safeint)

***

### safeUint

Re-exports [safeUint](../predefined/brand/number/safe-uint.md#safeuint)

***

### SetType

Re-exports [SetType](../other-types/set.md#settype)

***

### simpleBrandedNumber

Re-exports [simpleBrandedNumber](../brand/branded-number.md#simplebrandednumber)

***

### simpleBrandedString

Re-exports [simpleBrandedString](../brand/branded-string.md#simplebrandedstring)

***

### strictRecord

Re-exports [strictRecord](../record/record.md#strictrecord)

***

### string

Re-exports [string](../primitives/string.md#string)

***

### symbol

Re-exports [symbol](../primitives/symbol.md#symbol)

***

### toIntersectionString

Re-exports [toIntersectionString](../utils/to-union-string.md#tointersectionstring)

***

### toUnionKeyString

Re-exports [toUnionKeyString](../utils/to-union-string.md#tounionkeystring)

***

### toUnionString

Re-exports [toUnionString](../utils/to-union-string.md#tounionstring)

***

### TsFortressInternal

Re-exports [TsFortressInternal](../type/namespaces/TsFortressInternal.md)

***

### tuple

Re-exports [tuple](../array/tuple.md#tuple)

***

### Type

Re-exports [Type](../type/README.md#type)

***

### TypeOf

Re-exports [TypeOf](../type/README.md#typeof)

***

### uint

Re-exports [uint](../predefined/brand/number/uint.md#uint)

***

### uint16

Re-exports [uint16](../predefined/brand/number/uint16.md#uint16)

***

### uint32

Re-exports [uint32](../predefined/brand/number/uint32.md#uint32)

***

### uint8

Re-exports [uint8](../predefined/uint8.md#uint8)

***

### uintRange

Re-exports [uintRange](../enum/uint-range.md#uintrange)

***

### undefinedType

Re-exports [undefinedType](../primitives/undefined.md#undefinedtype)

***

### union

Re-exports [union](../compose/union.md#union)

***

### unknown

Re-exports [unknown](../other-types/unknown.md#unknown)

***

### uuid

Re-exports [uuid](../predefined/brand/string/uuid.md#uuid)

***

### uuidV4

Re-exports [uuidV4](../predefined/brand/string/uuid.md#uuidv4)

***

### uuidV6

Re-exports [uuidV6](../predefined/brand/string/uuid.md#uuidv6)

***

### uuidV7

Re-exports [uuidV7](../predefined/brand/string/uuid.md#uuidv7)

***

### ValidationError

Re-exports [ValidationError](../utils/validation-error.md#validationerror)

***

### ValidationErrorDetails

Re-exports [ValidationErrorDetails](../utils/validation-error.md#validationerrordetails)

***

### validationErrorsToMessages

Re-exports [validationErrorsToMessages](../utils/validation-error.md#validationerrorstomessages)

***

### validationErrorToMessage

Re-exports [validationErrorToMessage](../utils/validation-error.md#validationerrortomessage)

***

### valueof

Re-exports [valueof](../record/valueof.md#valueof)
