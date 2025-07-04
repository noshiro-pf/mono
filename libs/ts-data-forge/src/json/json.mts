import { Arr } from '../array/index.mjs';
import { pipe, Result } from '../functional/index.mjs';
import { isRecord } from '../guard/index.mjs';
import { castMutable } from '../others/index.mjs';
import { unknownToString } from '../others/unknown-to-string.mjs';

/**
 * A collection of type-safe JSON utility functions that provide safe parsing,
 * stringification, and manipulation of JSON data. All functions return `Result`
 * types to handle errors without throwing exceptions.
 *
 * @example Basic usage
 * ```typescript
 * import { Json, Result } from 'ts-data-forge';
 *
 * // Parse JSON safely
 * const parseResult = Json.parse('{"name": "Alice", "age": 30}');
 * if (Result.isOk(parseResult)) {
 *   console.log(parseResult.value); // { name: 'Alice', age: 30 }
 * }
 *
 * // Stringify with error handling
 * const stringifyResult = Json.stringify({ name: 'Bob', age: 25 });
 * if (Result.isOk(stringifyResult)) {
 *   console.log(stringifyResult.value); // '{"name":"Bob","age":25}'
 * }
 * ```
 */
export namespace Json {
  /**
   * Safely converts a JSON string into a JavaScript value without throwing exceptions.
   *
   * This function provides type-safe JSON parsing by wrapping the native `JSON.parse`
   * in a `Result` type, allowing you to handle parsing errors gracefully without
   * try-catch blocks.
   *
   * @param text - A valid JSON string to parse. Can contain any valid JSON data type:
   *   primitives (string, number, boolean, null), arrays, or objects.
   * @param reviver - Optional function that transforms parsed values. Called for each
   *   key-value pair in the JSON. The function receives the key name and parsed value,
   *   and should return the transformed value. For nested objects, inner objects are
   *   processed before outer objects.
   * @returns A `Result<JsonValue, string>` containing:
   *   - On success: `Result.ok(parsedValue)` where `parsedValue` is the parsed JSON
   *   - On failure: `Result.err(errorMessage)` where `errorMessage` describes the parsing error
   *
   * @example
   * ```typescript
   * const result = Json.parse('{"name": "John", "age": 30}');
   * if (Result.isOk(result)) {
   *   console.log(result.value.name); // 'John'
   * }
   * ```
   *
   * @example
   * ```typescript
   * const invalid = Json.parse('invalid json');
   * if (Result.isErr(invalid)) {
   *   console.log('Parse failed:', invalid.value);
   * }
   * ```
   */
  export const parse = (
    text: string,
    reviver?: (this: unknown, key: string, value: JsonValue) => unknown,
  ): Result<JsonValue, string> => {
    try {
      return Result.ok(
        JSON.parse(
          text,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          reviver as (this: unknown, key: string, value: unknown) => unknown,
        ),
      );
    } catch (error: unknown) {
      const errStr = unknownToString(error);
      return Result.err(
        Result.isOk(errStr) ? errStr.value : 'Failed to parse JSON',
      );
    }
  };

  /**
   * Safely converts a JavaScript value to a JSON string without throwing exceptions.
   *
   * This function provides type-safe JSON stringification by wrapping the native
   * `JSON.stringify` in a `Result` type, allowing you to handle serialization errors
   * gracefully (such as circular references or BigInt values).
   *
   * @param value - The JavaScript value to serialize. Can be any value that JSON.stringify
   *   accepts: primitives, objects, arrays. Non-serializable values (functions, undefined,
   *   symbols) will be omitted or converted to null according to JSON.stringify behavior.
   * @param replacer - Optional function that transforms values during serialization.
   *   Called for each key-value pair. Should return the value to be serialized, or
   *   undefined to omit the property from the result.
   * @param space - Optional parameter for formatting the output JSON:
   *   - Number (1-10): Number of spaces to indent each level
   *   - String: String to use for indentation (first 10 characters)
   *   - undefined/null: No formatting (compact output)
   * @returns A `Result<string, string>` containing:
   *   - On success: `Result.ok(jsonString)` where `jsonString` is the serialized JSON
   *   - On failure: `Result.err(errorMessage)` where `errorMessage` describes the error
   *
   * @example
   * ```typescript
   * const obj = { name: 'John', age: 30 };
   * const result = Json.stringify(obj);
   * if (Result.isOk(result)) {
   *   console.log(result.value); // '{"name":"John","age":30}'
   * }
   * ```
   *
   * @example Error handling
   * ```typescript
   * const circular: any = { name: 'test' };
   * circular.self = circular;
   * const error = Json.stringify(circular);
   * if (Result.isErr(error)) {
   *   console.log('Stringify failed:', error.value);
   * }
   * ```
   */
  export const stringify = (
    value: unknown,
    replacer?: (this: unknown, key: string, val: unknown) => unknown,
    space?: UintRangeInclusive<1, 10> | string,
  ): Result<string, string> => {
    try {
      return Result.ok(JSON.stringify(value, replacer, space));
    } catch (error) {
      const errStr = unknownToString(error);
      return Result.err(
        Result.isOk(errStr) ? errStr.value : 'Failed to stringify JSON',
      );
    }
  };

  /**
   * Safely converts a JavaScript value to a JSON string, including only the specified properties.
   *
   * This function provides selective serialization by allowing you to specify exactly which
   * object properties should be included in the resulting JSON. It's useful for creating
   * filtered or minimal representations of objects, such as for API responses or logging.
   *
   * @param value - The JavaScript value to serialize. While any value is accepted,
   *   the property filtering only applies to objects and nested objects.
   * @param propertiesToBeSelected - Optional array of property names (strings) and array
   *   indices (numbers) to include in the serialization. If provided, only these properties
   *   will appear in the output JSON. If undefined, all properties are included.
   * @param space - Optional formatting parameter:
   *   - Number (1-10): Number of spaces to indent each level
   *   - String: String to use for indentation (first 10 characters)
   *   - undefined/null: No formatting (compact output)
   * @returns A `Result<string, string>` containing:
   *   - On success: `Result.ok(jsonString)` with only selected properties
   *   - On failure: `Result.err(errorMessage)` describing the serialization error
   *
   * @example
   * ```typescript
   * const user = {
   *   id: 1,
   *   name: 'Alice',
   *   email: 'alice@example.com',
   *   password: 'secret123'
   * };
   *
   * const publicFields = Json.stringifySelected(user, ['id', 'name', 'email']);
   * if (Result.isOk(publicFields)) {
   *   console.log(publicFields.value);
   *   // '{"id":1,"name":"Alice","email":"alice@example.com"}'
   * }
   * ```
   */
  export const stringifySelected = (
    value: unknown,
    propertiesToBeSelected?: readonly (number | string)[],
    space?: UintRangeInclusive<1, 10> | string,
  ): Result<string, string> => {
    try {
      return Result.ok(
        JSON.stringify(value, castMutable(propertiesToBeSelected), space),
      );
    } catch (error) {
      const errStr = unknownToString(error);
      return Result.err(
        Result.isOk(errStr) ? errStr.value : 'Failed to stringify JSON',
      );
    }
  };

  /**
   * Safely converts a JavaScript record to a JSON string with keys sorted alphabetically at all levels.
   *
   * This function creates deterministic JSON output by ensuring that object keys appear in
   * alphabetical order at every level of nesting. This is particularly useful for creating
   * consistent output for comparison, hashing, caching, or when you need reproducible JSON
   * representations across different JavaScript engines or runs.
   *
   * @param value - An object (`UnknownRecord`) to serialize. Must be a plain object
   *   (not an array, primitive, or null). Nested objects and arrays within the object
   *   will also have their keys sorted alphabetically.
   * @param space - Optional formatting parameter:
   *   - Number (1-10): Number of spaces to indent each level
   *   - String: String to use for indentation (first 10 characters)
   *   - undefined/null: No formatting (compact output)
   * @returns A `Result<string, string>` containing:
   *   - On success: `Result.ok(jsonString)` with all object keys sorted alphabetically
   *   - On failure: `Result.err(errorMessage)` describing the serialization error
   *
   * @example
   * ```typescript
   * const unsortedObj = {
   *   zebra: 'animal',
   *   apple: 'fruit',
   *   banana: 'fruit'
   * };
   *
   * const sorted = Json.stringifySortedKey(unsortedObj);
   * if (Result.isOk(sorted)) {
   *   console.log(sorted.value);
   *   // '{"apple":"fruit","banana":"fruit","zebra":"animal"}'
   * }
   * ```
   */
  export const stringifySortedKey = (
    value: UnknownRecord,
    space?: UintRangeInclusive<1, 10> | string,
  ): Result<string, string> => {
    const allKeys = pipe(keysDeep(value))
      .map((keys) => Arr.uniq(keys))
      .map((ks) => ks.toSorted()).value;

    return stringifySelected(value, allKeys, space);
  };
}

/**
 * @internal
 * Recursively collects all property keys from a nested object structure.
 *
 * This helper function traverses an object and its nested objects and arrays,
 * collecting all string keys found at any level of nesting. The function mutates
 * the provided keys array for performance reasons.
 *
 * @param obj - The record to extract keys from. Must be a plain object.
 * @param mut_keys - A mutable array to accumulate the collected keys. This array
 *   will be modified in-place by the function for performance reasons.
 */
const keysDeepImpl = (
  obj: UnknownRecord,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_keys: string[],
): void => {
  for (const k of Object.keys(obj)) {
    mut_keys.push(k);
    const o = obj[k];
    if (isRecord(o)) {
      keysDeepImpl(o, mut_keys);
    }
    if (Array.isArray(o)) {
      for (const li of o) {
        if (isRecord(li)) {
          keysDeepImpl(li, mut_keys);
        }
      }
    }
  }
};

/**
 * @internal
 * Extracts all property keys from a nested object structure into a flat array.
 *
 * This function serves as a safe wrapper around `keysDeepImpl`, creating a new
 * mutable array and passing it to the recursive implementation. The result
 * contains all keys found at any level of nesting within the input object.
 *
 * @param obj - The record to extract keys from. Must be a plain object.
 * @returns A readonly array of all string keys found in the object and its
 *   nested objects/arrays. May contain duplicates if the same key appears
 *   at multiple levels.
 */
const keysDeep = (obj: UnknownRecord): readonly string[] => {
  const mut_keys: string[] = [];
  keysDeepImpl(obj, mut_keys);
  return mut_keys;
};
