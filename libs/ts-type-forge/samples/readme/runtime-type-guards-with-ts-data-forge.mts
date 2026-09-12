/* eslint-disable @typescript-eslint/consistent-type-imports, import-x/first */
// The README shows this snippet with ambient access to ts-type-forge's types
// (`/// <reference types="ts-type-forge/global" />`), which this program
// deliberately does not load — see `setup-ambient-triple-slash.mts`. The two
// aliases below stand in for it. They are `import()` types rather than an
// import statement because the import organizer would sort a hidden
// `ts-type-forge` import below the visible `ts-data-forge` one, taking the
// directive and the marker with it. Placed after them, the directive is an
// ordinary comment. The two rules disabled above object to exactly this shape.
type MinLengthTuple<
  N extends number,
  Elm,
> = import('ts-type-forge').MinLengthTuple<N, Elm>;

type JsonValue = import('ts-type-forge').JsonValue;
// embed-sample-code-ignore-above

/// <reference types="ts-type-forge/global" />

// Runtime validation with ts-data-forge
import { Arr, expectType, hasKey, isRecord, Json, Result } from 'ts-data-forge';

const numbers: readonly number[] = [1, 2, 3, 4, 5, 2, 3];

// Type-safe length checking
if (Arr.isMinLengthTuple(2, numbers)) {
  // numbers is now guaranteed to have at least 2 elements
  expectType<typeof numbers, MinLengthTuple<2, number>>('=');
  console.log(numbers[1]); // Array access to index 0, 1 is now safe even with noUncheckedIndexedAccess enabled
}

// Safe JSON parsing
const jsonString = '{"count": 42, "items": [1, 2, 3]}';
const parsed: Result<JsonValue, string> = Json.parse(jsonString); // Never throws

// Use the data with confidence
if (
  Result.isOk(parsed) &&
  isRecord(parsed.value) &&
  hasKey(parsed.value, 'count')
) {
  console.log(parsed.value.count); // Safe access
}
