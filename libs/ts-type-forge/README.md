# ts-type-forge

[![npm version](https://img.shields.io/npm/v/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![npm downloads](https://img.shields.io/npm/dm/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![License](https://img.shields.io/npm/l/ts-type-forge.svg)](./LICENSE)

A collection of type utilities to enhance your TypeScript development.

## Installation

```bash
npm install ts-type-forge
# or
yarn add ts-type-forge
# or
pnpm add ts-type-forge
```

## Usage Examples

Here we have picked out some examples of using `DeepReadonly`, `JsonValue`, and `UintRange`, but for a list of all other APIs, please refer to the [API reference](./docs/README.md).

### `DeepReadonly`

Make all properties of a nested object readonly.

```ts
import type { DeepReadonly } from 'ts-type-forge';

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

### `JsonValue`

Safely handle JSON parsing results. `JsonValue` represents any valid JSON value (string, number, boolean, null, array of `JsonValue`, or object with string keys and `JsonValue` values).

```ts
import type { JsonValue } from 'ts-type-forge';

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

Define precise numeric ranges for function parameters. `UintRange<Start, End>` creates a union of integer literals from `Start` (inclusive) up to `End` (exclusive).

```ts
import type { UintRange } from 'ts-type-forge';

/**
 * Converts a number to its string representation in the specified radix.
 * @param n The number to convert.
 * @param radix The base to use for representing numeric values. Must be between 2 and 36 (inclusive).
 *              UintRange<2, 37> represents the union 2 | 3 | ... | 36.
 */
declare function numToStr(n: number, radix?: UintRange<2, 37>): string;

// Valid usages:
numToStr(10); // radix defaults (usually 10)
numToStr(10, 2); // Binary
numToStr(255, 16); // Hexadecimal
numToStr(123, 36);

// Invalid usages (TypeScript will error):
// numToStr(10, 1);  // Error: Argument of type '1' is not assignable to parameter of type 'UintRange<2, 37>'.
// numToStr(10, 37); // Error: Argument of type '37' is not assignable to parameter of type 'UintRange<2, 37>'.
```

## API

[API reference](./docs/README.md)

### Type definition list (source code link)

<!-- AUTO-GENERATED TYPES START -->

- [TypeEq](./src/condition/eq.d.mts#L23)
- [TypeExtends](./src/condition/extends.d.mts#L22)
- [IsFixedLengthList](./src/condition/is-fixed-length-list.d.mts#L19)
- [IsNotFixedLengthList](./src/condition/is-fixed-length-list.d.mts#L37)
- [IsNever](./src/condition/is-never.d.mts#L18)
- [IsUnion](./src/condition/is-union.d.mts#L26)
- [LowerAlphabet](./src/constants/alphabet.d.mts#L6)
- [UpperAlphabet](./src/constants/alphabet.d.mts#L18)
- [Alphabet](./src/constants/alphabet.d.mts#L24)
- [FalsyValue](./src/constants/falsy-value.d.mts#L6)
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
- [ToMutableMap](./src/others/mutable.d.mts#L17)
- [ToMutableSet](./src/others/mutable.d.mts#L27)
- [MutableSet](./src/others/mutable.d.mts#L34)
- [MutableMap](./src/others/mutable.d.mts#L41)
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
- [DeepMutable](./src/record/deep.d.mts#L45)
- [DeepPartial](./src/record/deep.d.mts#L80)
- [DeepRequired](./src/record/deep.d.mts#L109)
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
- [ReadonlyRecord](./src/record/std.d.mts#L28)
- [MutableRecord](./src/record/std.d.mts#L33)
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
