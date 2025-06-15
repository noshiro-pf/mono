[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/enum/int8

# number/enum/int8

## Variables

### asInt8()

> `const` **asInt8**: (`x`) => `Int8` = `castType`

Defined in: [src/number/enum/int8.mts:168](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/enum/int8.mts#L168)

Casts a number to an Int8 branded type.

This function validates that the input is within the Int8 range [-128, 127]
and is an integer, then returns it with the Int8 brand.

Converts a number to Int8, throwing an error if invalid.

#### Parameters

##### x

`number`

The number to convert

#### Returns

`Int8`

The number as Int8

#### Throws

TypeError if x is not a valid Int8

#### Param

The value to cast

#### Returns

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

### Int8

> `const` **Int8**: `object`

Defined in: [src/number/enum/int8.mts:211](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/enum/int8.mts#L211)

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

#### Type declaration

##### abs()

> **abs**: \<`N`\>(`x`) => `AbsoluteValue`\<`N`\>

Returns the absolute value of an Int8.

Returns the absolute value of an Int8.

###### Type Parameters

###### N

`N` _extends_ `Int8`

###### Parameters

###### x

`N`

The Int8 value

###### Returns

`AbsoluteValue`\<`N`\>

The absolute value

###### Param

The Int8 value.

###### Returns

The absolute value as an Int8, clamped to valid range.

##### add()

> **add**: (`x`, `y`) => `Int8`

Adds two Int8 values.

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

x + y clamped to [-128, 127]

###### Param

The first Int8.

###### Param

The second Int8.

###### Returns

`a + b` clamped to [-128, 127] as an Int8.

##### clamp()

> **clamp**: (`a`) => `Int8`

Clamps a number to the Int8 range.

Clamps a number to the Int8 range [-128, 127].

###### Parameters

###### a

`number`

The number to clamp

###### Returns

`Int8`

The clamped value as Int8

###### Param

The number to clamp.

###### Returns

The value clamped to [-128, 127] as an Int8.

##### div()

> **div**: (`x`, `y`) => `Int8`

Divides one Int8 by another using floor division.

Divides two Int8 values, clamped to Int8 range.

###### Parameters

###### x

`Int8`

The dividend

###### y

The divisor (cannot be 0)

`-128` | `-127` | `-126` | `-125` | `-124` | `-123` | `-122` | `-121` | `-120` | `-119` | `-118` | `-117` | `-116` | `-115` | `-114` | `-113` | `-112` | `-111` | `-110` | `-109` | `-108` | `-107` | `-106` | `-105` | `-104` | `-103` | `-102` | `-101` | `-100` | `-99` | `-98` | `-97` | `-96` | `-95` | `-94` | `-93` | `-92` | `-91` | `-90` | `-89` | `-88` | `-87` | `-86` | `-85` | `-84` | `-83` | `-82` | `-81` | `-80` | `-79` | `-78` | `-77` | `-76` | `-75` | `-74` | `-73` | `-72` | `-71` | `-70` | `-69` | `-68` | `-67` | `-66` | `-65` | `-64` | `-63` | `-62` | `-61` | `-60` | `-59` | `-58` | `-57` | `-56` | `-55` | `-54` | `-53` | `-52` | `-51` | `-50` | `-49` | `-48` | `-47` | `-46` | `-45` | `-44` | `-43` | `-42` | `-41` | `-40` | `-39` | `-38` | `-37` | `-36` | `-35` | `-34` | `-33` | `-32` | `-31` | `-30` | `-29` | `-28` | `-27` | `-26` | `-25` | `-24` | `-23` | `-22` | `-21` | `-20` | `-19` | `-18` | `-17` | `-16` | `-15` | `-14` | `-13` | `-12` | `-11` | `-10` | `-9` | `-8` | `-7` | `-6` | `-5` | `-4` | `-3` | `-2` | `-1` | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10` | `11` | `12` | `13` | `14` | `15` | `16` | `17` | `18` | `19` | `20` | `21` | `22` | `23` | `24` | `25` | `26` | `27` | `28` | `29` | `30` | `31` | `32` | `33` | `34` | `35` | `36` | `37` | `38` | `39` | `40` | `41` | `42` | `43` | `44` | `45` | `46` | `47` | `48` | `49` | `50` | `51` | `52` | `53` | `54` | `55` | `56` | `57` | `58` | `59` | `60` | `61` | `62` | `63` | `64` | `65` | `66` | `67` | `68` | `69` | `70` | `71` | `72` | `73` | `74` | `75` | `76` | `77` | `78` | `79` | `80` | `81` | `82` | `83` | `84` | `85` | `86` | `87` | `88` | `89` | `90` | `91` | `92` | `93` | `94` | `95` | `96` | `97` | `98` | `99` | `100` | `101` | `102` | `103` | `104` | `105` | `106` | `107` | `108` | `109` | `110` | `111` | `112` | `113` | `114` | `115` | `116` | `117` | `118` | `119` | `120` | `121` | `122` | `123` | `124` | `125` | `126` | `127`

###### Returns

`Int8`

⌊x / y⌋ clamped to [-128, 127]

###### Param

The dividend Int8.

###### Param

The divisor Int8 (cannot be 0).

###### Returns

`⌊a / b⌋` clamped to [-128, 127] as an Int8.

##### is()

> **is**: (`x`) => `x is Int8`

Type guard that checks if a value is an 8-bit signed integer.

Checks if a number is a valid Int8 (integer in [-128, 127]).

###### Parameters

###### x

`number`

The number to check

###### Returns

`x is Int8`

True if x is a valid Int8

###### Param

The value to check

###### Returns

`true` if the value is in range [-128, 127] and is an integer

###### See

[isInt8](#isint8) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `Int8` = `max_`

Returns the maximum value from a list of Int8 values.

Returns the maximum of the given Int8 values.

###### Parameters

###### values

...readonly `Int8`[]

The Int8 values to compare

###### Returns

`Int8`

The maximum value

###### Param

The Int8 values to compare (at least one required)

###### Returns

The largest value as an Int8

###### Example

```typescript
Int8.max(asInt8(50), asInt8(-30), asInt8(100)); // Int8 (100)
```

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `127`

The maximum value for an 8-bit signed integer.

##### min()

> `readonly` **min**: (...`values`) => `Int8` = `min_`

Returns the minimum value from a list of Int8 values.

Returns the minimum of the given Int8 values.

###### Parameters

###### values

...readonly `Int8`[]

The Int8 values to compare

###### Returns

`Int8`

The minimum value

###### Param

The Int8 values to compare (at least one required)

###### Returns

The smallest value as an Int8

###### Example

```typescript
Int8.min(asInt8(50), asInt8(-30), asInt8(100)); // Int8 (-30)
```

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `-128`

The minimum value for an 8-bit signed integer.

##### mul()

> **mul**: (`x`, `y`) => `Int8`

Multiplies two Int8 values.

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

x \* y clamped to [-128, 127]

###### Param

The first Int8.

###### Param

The second Int8.

###### Returns

`a * b` clamped to [-128, 127] as an Int8.

##### pow()

> **pow**: (`x`, `y`) => `Int8`

Raises an Int8 to the power of another Int8.

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

x^y clamped to [-128, 127]

###### Param

The base Int8.

###### Param

The exponent Int8.

###### Returns

`a ** b` clamped to [-128, 127] as an Int8.

##### random()

> **random**: (`min`, `max`) => `Int8`

Generates a random Int8 value within the specified range (inclusive).

Both bounds are inclusive. If min > max, they are automatically swapped.

Generates a random Int8 value within the specified range.

###### Parameters

###### min

`Int8`

The minimum value (inclusive)

###### max

`Int8`

The maximum value (inclusive)

###### Returns

`Int8`

A random Int8 between min and max

###### Param

The minimum value (inclusive)

###### Param

The maximum value (inclusive)

###### Returns

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

> **sub**: (`x`, `y`) => `Int8`

Subtracts one Int8 from another.

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

x - y clamped to [-128, 127]

###### Param

The minuend Int8.

###### Param

The subtrahend Int8.

###### Returns

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

### isInt8()

> `const` **isInt8**: (`x`) => `x is Int8` = `is`

Defined in: [src/number/enum/int8.mts:142](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/enum/int8.mts#L142)

Type guard that checks if a value is an 8-bit signed integer.

An Int8 is a signed integer in the range [-128, 127], representing
values that fit in exactly 8 bits of memory.

Checks if a number is a valid Int8 (integer in [-128, 127]).

#### Parameters

##### x

`number`

The number to check

#### Returns

`x is Int8`

True if x is a valid Int8

#### Param

The value to check

#### Returns

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
