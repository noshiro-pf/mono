# ts-type-forge

[![npm version](https://img.shields.io/npm/v/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![npm downloads](https://img.shields.io/npm/dm/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![License](https://img.shields.io/npm/l/ts-type-forge.svg)](./LICENSE)

A collection of type utilities to enhance your TypeScript development.

## Features

- Provides enhanced built-in types such as [`StrictExclude`](./src/record/std.d.mts#L16), [`StrictOmit`](./src/record/std.d.mts#L22), [`ReadonlyRecord`](./src/record/std.d.mts#L29), etc.
- No need for import statements for utility types when using Triple-Slash Directives. See [How to use](#how-to-use) section.
- No runtime cost – it's type-level only.
- Secure and minimal – no third-party dependencies.
- Quality – thoroughly tested for type correctness with type-testing.

## Installation

```bash
npm install ts-type-forge
# or
yarn add ts-type-forge
# or
pnpm add ts-type-forge
```

## How to use

There are two ways to use the types provided by `ts-type-forge`:

1. **Triple-Slash Directive (Recommended for global availability):**
   Add `/// <reference types="ts-type-forge" />` to any `.ts` file in your project (e.g., `globals.d.ts` or at the top of a frequently used file). This makes all types from `ts-type-forge` globally available without needing explicit imports.

    ```ts
    // src/globals.d.ts or any other .ts file
    /// <reference types="ts-type-forge" />

    // src/types/dice.ts
    // No import needed
    export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
    ```

2. **Explicit Imports:**
   Alternatively, you can import types explicitly if you prefer more granular control or are not using triple-slash directives.

    ```ts
    // src/types/dice.ts
    import { type UintRange } from 'ts-type-forge';

    export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
    ```

## Usage Examples

Below are a few examples featuring `DeepReadonly`, `JsonValue`, and `UintRange`. For a comprehensive list of all available types and their detailed documentation, please refer to the [API Reference](#api-reference) section.

### `DeepReadonly`

Make all properties of a nested object readonly.

```ts
// No import needed if using triple-slash directive
// import type { DeepReadonly } from 'ts-type-forge'; // if importing explicitly

type Config = {
    port: number;
    database: {
        host: string;
        port: number;
        credentials?: {
            user: string;
            pass: string;
        };
    };
    features: string[];
};

// Create a type where all properties, nested or not, are readonly.
type ReadonlyConfig = DeepReadonly<Config>;

// Example usage:
const config: ReadonlyConfig = {
    port: 8080,
    database: {
        host: 'localhost',
        port: 5432,
        credentials: {
            user: 'admin',
            pass: 'secret',
        },
    },
    features: ['featureA', 'featureB'],
};

// config.port = 8081; // Error: Cannot assign to 'port' because it is a read-only property.
// config.database.host = 'remote'; // Error: Cannot assign to 'host' because it is a read-only property.
// config.database.credentials.user = 'guest'; // Error: Cannot assign to 'user' because it is a read-only property.
// config.features.push('featureC'); // Error: Property 'push' does not exist on type 'readonly string[]'.
```

### `StrictOmit`

Create a new type by omitting specified keys from an existing type, ensuring that the keys to be omitted actually exist in the original type. This provides stricter type checking than the built-in `Omit`.

```ts
// No import needed if using triple-slash directive
// import type { StrictOmit } from 'ts-type-forge'; // if importing explicitly

type UserProfile = Readonly<{
    id: string;
    username: string;
    email: string;
    lastLogin: Date;
    bio?: string;
}>;

// Create a type for user data that should not include 'lastLogin' or 'id'.
type UserCreationData = StrictOmit<UserProfile, 'id' | 'lastLogin'>;
// Result:
// type UserCreationData = Readonly<{
//     username: string;
//     email: string;
//     bio?: string | undefined;
// }>;

const newUser: UserCreationData = {
    username: 'jane_doe',
    email: 'jane@example.com',
    // bio: 'Software Developer' // Optional
};

// The following would cause a type error because 'nonExistentKey' is not in UserProfile:
// type InvalidOmit = StrictOmit<UserProfile, 'id' | 'nonExistentKey'>; // Error
```

### `NonEmptyArray`

Represent an array that is guaranteed to have at least one element. This is useful for functions or types that require a collection to be non-empty.

```ts
// No import needed if using triple-slash directive
// import type { NonEmptyArray } from 'ts-type-forge'; // if importing explicitly

type Post = Readonly<{
    title: string;
    content: string;
}>;

// A blog must have at least one post.
type Blog = Readonly<{
    name: string;
    posts: NonEmptyArray<Post>; // Ensures posts array is never empty
}>;

const myBlog: Blog = {
    name: 'My Tech Journey',
    posts: [
        // This array must have at least one element
        { title: 'First Post', content: 'Hello world!' },
        { title: 'Understanding TypeScript', content: '...' },
    ],
};

// // This would cause a type error
// const emptyBlog: Blog = {
//     name: 'Empty Thoughts',
//     posts: [], // Error: Source has 0 element(s) but target requires 1.
// };

const getFirstPostTitle = (posts: NonEmptyArray<Post>): string =>
    posts[0].title; // Safe to access posts[0]

console.log(getFirstPostTitle(myBlog.posts));

const processPosts = (posts: readonly Post[]) => {
    if (posts.length > 0) {
        const firstPost = posts[0]; // Need to check length for regular arrays
        // ...
    }
};
```

### `JsonValue`

Safely handle JSON parsing results. `JsonValue` represents any valid JSON value (string, number, boolean, null, array of `JsonValue`, or object with string keys and `JsonValue` values).

```ts
// No import needed if using triple-slash directive
// import type { JsonValue } from 'ts-type-forge'; // if importing explicitly

const jsonString =
    '{"name": "Alice", "age": 30, "isAdmin": false, "tags": ["user", "active"], "metadata": null}';

try {
    // Cast the result of JSON.parse to JsonValue
    const parsedData = JSON.parse(jsonString) as JsonValue;

    // Now you can work with parsedData.
    // Type guards are recommended to narrow down the type for specific operations.
    if (
        typeof parsedData === 'object' &&
        parsedData !== null &&
        !Array.isArray(parsedData)
    ) {
        // parsedData is now known to be a JSON object (Record<string, JsonValue>)
        console.log(parsedData['name']); // Access properties

        if (typeof parsedData['age'] === 'number') {
            console.log(`Age: ${parsedData['age']}`);
        }
    } else if (Array.isArray(parsedData)) {
        // parsedData is now known to be a JSON array (JsonValue[])
        parsedData.forEach((item) => console.log(item));
    }
} catch (error) {
    console.error('Failed to parse JSON:', error);
}
```

### `UintRange`

Define precise numeric ranges for function parameters. `UintRange<Start, End>` creates a union of integer literals from `Start` (inclusive) up to `End` (exclusive). You can also use the version where both are inclusive: `UintRangeInclusive`.

```ts
// No import needed if using triple-slash directive
// import type { UintRange } from 'ts-type-forge'; // if importing explicitly

/**
 * Converts a string to an integer.
 * @param str A string to convert into a number.
 * @param radix A value between 2 and 36 that specifies the base of the number in `str`.
 * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
 * All other strings are considered decimal.
 */
export const parseInteger = (str: string, radix?: UintRange<2, 37>): number =>
    Number.parseInt(str, radix);
// or
// export const parseInteger = (str: string, radix?: UintRangeInclusive<2, 36>): number =>
//     Number.parseInt(str, radix);

// Valid usages:
parseInteger('10'); // radix defaults (usually 10)
parseInteger('10', 2); // Binary
parseInteger('255', 16); // Hexadecimal
parseInteger('123', 36);

// Invalid usages (TypeScript will error):
// parseInteger('10', 1); // Error: Argument of type '1' is not assignable to parameter of type 'UintRange<2, 37> | undefined'.
// parseInteger('10', 37); // Error: Argument of type '37' is not assignable to parameter of type 'UintRange<2, 37> | undefined'.
```

## API Reference

For detailed information on all types, see the [Full API Reference](./docs/README.md).

### Overview of All Types (with source code links)

<!-- AUTO-GENERATED TYPES START -->

- [UnknownBrand](./src/branded-types/brand.d.mts#L9)
- [Brand](./src/branded-types/brand.d.mts#L76)
- [UnwrapBrandTrueKeys](./src/branded-types/brand.d.mts#L93)
- [UnwrapBrandFalseKeys](./src/branded-types/brand.d.mts#L108)
- [UnwrapBrandBooleanKeys](./src/branded-types/brand.d.mts#L126)
- [UnwrapBrandKeys](./src/branded-types/brand.d.mts#L141)
- [GetBrandKeysPart](./src/branded-types/brand.d.mts#L158)
- [GetBrandValuePart](./src/branded-types/brand.d.mts#L175)
- [ExtendBrand](./src/branded-types/brand.d.mts#L206)
- [ChangeBaseBrand](./src/branded-types/brand.d.mts#L237)
- [IntersectBrand](./src/branded-types/brand.d.mts#L264)
- [NormalizeBrandUnion](./src/branded-types/brand.d.mts#L286)
- [NaNType](./src/branded-types/branded-number-types.d.mts#L150)
- [ValidNumber](./src/branded-types/branded-number-types.d.mts#L170)
- [FiniteNumber](./src/branded-types/branded-number-types.d.mts#L191)
- [InfiniteNumber](./src/branded-types/branded-number-types.d.mts#L211)
- [NonZeroNumber](./src/branded-types/branded-number-types.d.mts#L231)
- [NonNegativeNumber](./src/branded-types/branded-number-types.d.mts#L247)
- [PositiveNumber](./src/branded-types/branded-number-types.d.mts#L266)
- [NegativeNumber](./src/branded-types/branded-number-types.d.mts#L282)
- [POSITIVE_INFINITY](./src/branded-types/branded-number-types.d.mts#L302)
- [NEGATIVE_INFINITY](./src/branded-types/branded-number-types.d.mts#L322)
- [NonZeroFiniteNumber](./src/branded-types/branded-number-types.d.mts#L341)
- [NonNegativeFiniteNumber](./src/branded-types/branded-number-types.d.mts#L356)
- [PositiveFiniteNumber](./src/branded-types/branded-number-types.d.mts#L371)
- [NegativeFiniteNumber](./src/branded-types/branded-number-types.d.mts#L386)
- [Int](./src/branded-types/branded-number-types.d.mts#L405)
- [Uint](./src/branded-types/branded-number-types.d.mts#L422)
- [PositiveInt](./src/branded-types/branded-number-types.d.mts#L439)
- [NegativeInt](./src/branded-types/branded-number-types.d.mts#L454)
- [NonZeroInt](./src/branded-types/branded-number-types.d.mts#L472)
- [SafeInt](./src/branded-types/branded-number-types.d.mts#L490)
- [SafeUint](./src/branded-types/branded-number-types.d.mts#L505)
- [PositiveSafeInt](./src/branded-types/branded-number-types.d.mts#L520)
- [NegativeSafeInt](./src/branded-types/branded-number-types.d.mts#L534)
- [NonZeroSafeInt](./src/branded-types/branded-number-types.d.mts#L549)
- [Int32](./src/branded-types/branded-number-types.d.mts#L568)
- [Int16](./src/branded-types/branded-number-types.d.mts#L586)
- [Uint32](./src/branded-types/branded-number-types.d.mts#L607)
- [Uint16](./src/branded-types/branded-number-types.d.mts#L622)
- [NegativeInt32](./src/branded-types/branded-number-types.d.mts#L639)
- [NegativeInt16](./src/branded-types/branded-number-types.d.mts#L656)
- [Float32](./src/branded-types/branded-number-types.d.mts#L677)
- [Float64](./src/branded-types/branded-number-types.d.mts#L695)
- [BigInt64](./src/branded-types/branded-number-types.d.mts#L714)
- [BigUint64](./src/branded-types/branded-number-types.d.mts#L729)
- [SmallInt](./src/branded-types/branded-number-types.d.mts#L752)
- [SmallUint](./src/branded-types/branded-number-types.d.mts#L785)
- [CastToInt](./src/branded-types/branded-number-types.d.mts#L801)
- [WithSmallInt](./src/branded-types/branded-number-types.d.mts#L830)
- [IntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L842)
- [SafeIntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L848)
- [UintWithSmallInt](./src/branded-types/branded-number-types.d.mts#L854)
- [SafeUintWithSmallInt](./src/branded-types/branded-number-types.d.mts#L860)
- [PositiveIntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L866)
- [PositiveSafeIntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L872)
- [NegativeIntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L878)
- [NegativeSafeIntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L884)
- [NonZeroIntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L890)
- [NonZeroSafeIntWithSmallInt](./src/branded-types/branded-number-types.d.mts#L896)
- [Int32WithSmallInt](./src/branded-types/branded-number-types.d.mts#L902)
- [Int16WithSmallInt](./src/branded-types/branded-number-types.d.mts#L908)
- [Uint32WithSmallInt](./src/branded-types/branded-number-types.d.mts#L914)
- [Uint16WithSmallInt](./src/branded-types/branded-number-types.d.mts#L920)
- [NegativeInt32WithSmallInt](./src/branded-types/branded-number-types.d.mts#L926)
- [NegativeInt16WithSmallInt](./src/branded-types/branded-number-types.d.mts#L932)
- [RemoveSmallInt](./src/branded-types/branded-number-types.d.mts#L955)
- [TypeEq](./src/condition/eq.d.mts#L23)
- [TypeExtends](./src/condition/extends.d.mts#L22)
- [IsFixedLengthList](./src/condition/is-fixed-length-list.d.mts#L19)
- [IsNotFixedLengthList](./src/condition/is-fixed-length-list.d.mts#L37)
- [IsNever](./src/condition/is-never.d.mts#L18)
- [IsUnion](./src/condition/is-union.d.mts#L26)
- [LowerAlphabet](./src/constants/alphabet.d.mts#L6)
- [UpperAlphabet](./src/constants/alphabet.d.mts#L18)
- [Alphabet](./src/constants/alphabet.d.mts#L24)
- [FalsyValue](./src/constants/falsy-value.d.mts#L7)
- [Uint8](./src/constants/int-enum.d.mts#L5)
- [Uint9](./src/constants/int-enum.d.mts#L11)
- [Uint10](./src/constants/int-enum.d.mts#L17)
- [Int8](./src/constants/int-enum.d.mts#L23)
- [Int9](./src/constants/int-enum.d.mts#L29)
- [Int10](./src/constants/int-enum.d.mts#L35)
- [MonthEnum](./src/constants/int-enum.d.mts#L41)
- [MonthIndexEnum](./src/constants/int-enum.d.mts#L47)
- [DateEnum](./src/constants/int-enum.d.mts#L53)
- [DayOfWeekIndex](./src/constants/int-enum.d.mts#L59)
- [DayOfWeekName](./src/constants/int-enum.d.mts#L65)
- [HoursEnum](./src/constants/int-enum.d.mts#L71)
- [MinutesEnum](./src/constants/int-enum.d.mts#L77)
- [SecondsEnum](./src/constants/int-enum.d.mts#L83)
- [MillisecondsEnum](./src/constants/int-enum.d.mts#L89)
- [Sexagesimal](./src/constants/int-enum.d.mts#L95)
- [Percent](./src/constants/int-enum.d.mts#L101)
- [Primitive](./src/constants/primitive.d.mts#L5)
- [UnknownRecord](./src/constants/record.d.mts#L6)
- [HTTPRequestMethod](./src/constants/web.d.mts#L6)
- [BivariantHack](./src/others/bivariant-hack.d.mts#L26)
- [BoolNot](./src/others/boolean.d.mts#L8)
- [BoolAnd](./src/others/boolean.d.mts#L25)
- [BoolOr](./src/others/boolean.d.mts#L50)
- [BoolEq](./src/others/boolean.d.mts#L76)
- [BoolNand](./src/others/boolean.d.mts#L101)
- [BoolNor](./src/others/boolean.d.mts#L113)
- [BoolNeq](./src/others/boolean.d.mts#L126)
- [JsonPrimitive](./src/others/json.d.mts#L4)
- [MutableJsonValue](./src/others/json.d.mts#L11)
- [JsonValue](./src/others/json.d.mts#L24)
- [JsonObject](./src/others/json.d.mts#L35)
- [MutableJsonObject](./src/others/json.d.mts#L41)
- [Mutable](./src/others/mutable.d.mts#L8)
- [ToMutableMap](./src/others/mutable.d.mts#L18)
- [ToMutableSet](./src/others/mutable.d.mts#L29)
- [MutableSet](./src/others/mutable.d.mts#L36)
- [MutableMap](./src/others/mutable.d.mts#L43)
- [ToString](./src/others/utils.d.mts#L10)
- [ToNumber](./src/others/utils.d.mts#L21)
- [ValueOf](./src/others/utils.d.mts#L31)
- [Length](./src/others/utils.d.mts#L43)
- [FunctionType](./src/others/utils.d.mts#L51)
- [Fn](./src/others/utils.d.mts#L59)
- [MonoTypeFunction](./src/others/utils.d.mts#L65)
- [Reducer](./src/others/utils.d.mts#L73)
- [UnionToIntersection](./src/others/utils.d.mts#L81)
- [MergeIntersection](./src/others/utils.d.mts#L94)
- [ExcludeFalsyValue](./src/others/utils.d.mts#L103)
- [Intersection](./src/others/utils.d.mts#L111)
- [WidenLiteral](./src/others/widen-literal.d.mts#L17)
- [DeepReadonly](./src/record/deep.d.mts#L17)
- [DeepMutable](./src/record/deep.d.mts#L46)
- [DeepPartial](./src/record/deep.d.mts#L82)
- [DeepRequired](./src/record/deep.d.mts#L112)
- [PartiallyPartial](./src/record/partial.d.mts#L12)
- [PartiallyOptional](./src/record/partial.d.mts#L26)
- [PartiallyNullable](./src/record/partial.d.mts#L39)
- [PartiallyRequired](./src/record/partial.d.mts#L54)
- [PickUndefined](./src/record/partial.d.mts#L66)
- [MapToNever](./src/record/partial.d.mts#L77)
- [OptionalKeys](./src/record/partial.d.mts#L98)
- [RequiredKeys](./src/record/partial.d.mts#L116)
- [RecordPathsWithIndex](./src/record/record-path.d.mts#L11)
- [RecordPaths](./src/record/record-path.d.mts#L25)
- [RecordPathAndValueTypeTuple](./src/record/record-path.d.mts#L70)
- [RecordLeafPaths](./src/record/record-path.d.mts#L83)
- [RecordLeafPathsWithIndex](./src/record/record-path.d.mts#L137)
- [RecordUpdated](./src/record/record-path.d.mts#L195)
- [RecordValueAtPath](./src/record/record-path.d.mts#L266)
- [RecordValueAtPathWithIndex](./src/record/record-path.d.mts#L290)
- [StrictExtract](./src/record/std.d.mts#L2)
- [RelaxedExtract](./src/record/std.d.mts#L5)
- [StrictPick](./src/record/std.d.mts#L8)
- [RelaxedPick](./src/record/std.d.mts#L13)
- [StrictExclude](./src/record/std.d.mts#L16)
- [RelaxedExclude](./src/record/std.d.mts#L19)
- [StrictOmit](./src/record/std.d.mts#L22)
- [RelaxedOmit](./src/record/std.d.mts#L25)
- [ReadonlyRecord](./src/record/std.d.mts#L29)
- [MutableRecord](./src/record/std.d.mts#L35)
- [MutableNonEmptyArray](./src/tuple-and-list/array.d.mts#L12)
- [NonEmptyArray](./src/tuple-and-list/array.d.mts#L24)
- [ArrayElement](./src/tuple-and-list/array.d.mts#L37)
- [ArrayOfLength](./src/tuple-and-list/array.d.mts#L51)
- [MutableArrayOfLength](./src/tuple-and-list/array.d.mts#L61)
- [MutableArrayAtLeastLen](./src/tuple-and-list/array.d.mts#L80)
- [ArrayAtLeastLen](./src/tuple-and-list/array.d.mts#L95)
- [IndexOfTuple](./src/tuple-and-list/index-of-tuple.d.mts#L14)
- [List.Head](./src/tuple-and-list/list.d.mts#L15)
- [List.Last](./src/tuple-and-list/list.d.mts#L28)
- [List.ButLast](./src/tuple-and-list/list.d.mts#L41)
- [List.Tail](./src/tuple-and-list/list.d.mts#L54)
- [List.Reverse](./src/tuple-and-list/list.d.mts#L67)
- [List.Take](./src/tuple-and-list/list.d.mts#L87)
- [List.Skip](./src/tuple-and-list/list.d.mts#L102)
- [List.TakeLast](./src/tuple-and-list/list.d.mts#L117)
- [List.SkipLast](./src/tuple-and-list/list.d.mts#L132)
- [List.SetAt](./src/tuple-and-list/list.d.mts#L148)
- [List.Flatten](./src/tuple-and-list/list.d.mts#L163)
- [List.Concat](./src/tuple-and-list/list.d.mts#L176)
- [List.Zip](./src/tuple-and-list/list.d.mts#L195)
- [List.Partition](./src/tuple-and-list/list.d.mts#L221)
- [MakeTuple](./src/tuple-and-list/make-tuple.d.mts#L13)
- [Tuple.Head](./src/tuple-and-list/tuple.d.mts#L13)
- [Tuple.Last](./src/tuple-and-list/tuple.d.mts#L30)
- [Tuple.ButLast](./src/tuple-and-list/tuple.d.mts#L48)
- [Tuple.Tail](./src/tuple-and-list/tuple.d.mts#L66)
- [Tuple.Reverse](./src/tuple-and-list/tuple.d.mts#L80)
- [Tuple.Take](./src/tuple-and-list/tuple.d.mts#L107)
- [Tuple.Skip](./src/tuple-and-list/tuple.d.mts#L122)
- [Tuple.TakeLast](./src/tuple-and-list/tuple.d.mts#L137)
- [Tuple.SkipLast](./src/tuple-and-list/tuple.d.mts#L152)
- [Tuple.SetAt](./src/tuple-and-list/tuple.d.mts#L167)
- [Tuple.Flatten](./src/tuple-and-list/tuple.d.mts#L182)
- [Tuple.Concat](./src/tuple-and-list/tuple.d.mts#L195)
- [Tuple.Zip](./src/tuple-and-list/tuple.d.mts#L212)
- [Tuple.Partition](./src/tuple-and-list/tuple.d.mts#L231)
- [Tuple.ReverseImpl](./src/tuple-and-list/tuple.d.mts#L243)
- [Tuple.TakeImpl](./src/tuple-and-list/tuple.d.mts#L256)
- [Tuple.SkipImpl](./src/tuple-and-list/tuple.d.mts#L271)
- [Tuple.TakeLastImpl](./src/tuple-and-list/tuple.d.mts#L287)
- [Tuple.SkipLastImpl](./src/tuple-and-list/tuple.d.mts#L303)
- [Tuple.SetAtImpl](./src/tuple-and-list/tuple.d.mts#L320)
- [Tuple.FlattenImpl](./src/tuple-and-list/tuple.d.mts#L341)
- [Tuple.ConcatImpl](./src/tuple-and-list/tuple.d.mts#L359)
- [Tuple.PartitionImpl](./src/tuple-and-list/tuple.d.mts#L376)
- [AbsoluteValue](./src/type-level-integer/abs.d.mts#L15)
- [Abs](./src/type-level-integer/abs.d.mts#L32)
- [Increment](./src/type-level-integer/increment.d.mts#L11)
- [Decrement](./src/type-level-integer/increment.d.mts#L24)
- [Index](./src/type-level-integer/index-type.d.mts#L13)
- [IndexInclusive](./src/type-level-integer/index-type.d.mts#L26)
- [NegativeIndex](./src/type-level-integer/index-type.d.mts#L40)
- [Max](./src/type-level-integer/max.d.mts#L13)
- [Min](./src/type-level-integer/min.d.mts#L12)
- [Seq](./src/type-level-integer/seq.d.mts#L12)
- [UintRange](./src/type-level-integer/uint-range.d.mts#L13)
- [UintRangeInclusive](./src/type-level-integer/uint-range.d.mts#L30)

<!-- AUTO-GENERATED TYPES END -->

## Compatibility Notes

This library requires TypeScript version 4.8 or higher.

## License

Apache-2.0
