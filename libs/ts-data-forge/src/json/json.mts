import { Arr } from '../array/index.mjs';
import { pipe, Result } from '../functional/index.mjs';
import { isRecord } from '../guard/index.mjs';
import { castMutable, unknownToString } from '../others/index.mjs';

/**
 * A collection of type-safe JSON utility functions that provide safe parsing,
 * stringification, and manipulation of JSON data. All functions return `Result`
 * types to handle errors without throwing exceptions.
 */
export namespace Json {
  /**
   * Safely converts a JSON string into a JavaScript value without throwing
   * exceptions.
   *
   * This function provides type-safe JSON parsing by wrapping the native
   * `JSON.parse` in a `Result` type, allowing you to handle parsing errors
   * gracefully without try-catch blocks.
   *
   * @example
   *
   * ```ts
   * const validJson = '{"name": "Alice", "age": 30}';
   *
   * const invalidJson = '{invalid json}';
   *
   * const parsed = Json.parse(validJson);
   *
   * const failed = Json.parse(invalidJson);
   *
   * assert.isTrue(Result.isOk(parsed));
   *
   * if (Result.isOk(parsed)) {
   *   assert.deepStrictEqual(parsed.value, { name: 'Alice', age: 30 });
   * }
   *
   * assert.isTrue(Result.isErr(failed));
   *
   * // With reviver
   * const jsonWithDate = '{"created": "2024-01-01T00:00:00.000Z"}';
   *
   * const withReviver = Json.parse(jsonWithDate, (key, value) => {
   *   if (key === 'created' && typeof value === 'string') {
   *     return new Date(value);
   *   }
   *
   *   return value;
   * });
   *
   * assert.isTrue(Result.isOk(withReviver));
   * ```
   *
   * @param text - A valid JSON string to parse. Can contain any valid JSON data
   *   type: primitives (string, number, boolean, null), arrays, or objects.
   * @param reviver - Optional function that transforms parsed values. Called
   *   for each key-value pair in the JSON. The function receives the key name
   *   and parsed value, and should return the transformed value. For nested
   *   objects, inner objects are processed before outer objects.
   * @returns A `Result<JsonValue, string>` containing:
   *
   *   - On success: `Result.ok(parsedValue)` where `parsedValue` is the parsed JSON
   *   - On failure: `Result.err(errorMessage)` where `errorMessage` describes the
   *       parsing error
   */
  export const parse = (
    text: string,
    reviver?: (this: unknown, key: string, value: JsonValue) => unknown,
  ): Result<JsonValue, string> => {
    try {
      return Result.ok(
        JSON.parse(
          text,
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          reviver as (this: unknown, key: string, value: unknown) => unknown,
        ),
      );
    } catch (error: unknown) {
      const errStr = unknownToString(error);

      return Result.err(errStr);
    }
  };

  /**
   * Safely converts a JavaScript value to a JSON string without throwing
   * exceptions.
   *
   * This function provides type-safe JSON stringification by wrapping the
   * native `JSON.stringify` in a `Result` type, allowing you to handle
   * serialization errors gracefully (such as circular references or BigInt
   * values).
   *
   * @example
   *
   * ```ts
   * const data = { name: 'Bob', age: 25, active: true };
   *
   * // Basic stringify
   * const basic = Json.stringify(data);
   *
   * assert.isTrue(Result.isOk(basic));
   *
   * if (Result.isOk(basic)) {
   *   assert.isTrue(basic.value === '{"name":"Bob","age":25,"active":true}');
   * }
   *
   * // With formatting
   * const formatted = Json.stringify(data, undefined, 2);
   *
   * assert.isTrue(Result.isOk(formatted));
   *
   * // With replacer
   * const filtered = Json.stringify(data, (key, value) => {
   *   if (key === 'age') return undefined; // omit age field
   *
   *   return value;
   * });
   *
   * assert.isTrue(Result.isOk(filtered));
   *
   * if (Result.isOk(filtered)) {
   *   assert.isTrue(isString(filtered.value));
   *
   *   assert.isFalse(filtered.value.includes('age'));
   * }
   * ```
   *
   * @param value - The JavaScript value to serialize. Can be any value that
   *   JSON.stringify accepts: primitives, objects, arrays. Non-serializable
   *   values (functions, undefined, symbols) will be omitted or converted to
   *   null according to JSON.stringify behavior.
   * @param replacer - Optional function that transforms values during
   *   serialization. Called for each key-value pair. Should return the value to
   *   be serialized, or undefined to omit the property from the result.
   * @param space - Optional parameter for formatting the output JSON:
   *
   *   - Number (1-10): Number of spaces to indent each level
   *   - String: String to use for indentation (first 10 characters)
   *   - Undefined/null: No formatting (compact output)
   *
   * @returns A `Result<string, string>` containing:
   *
   *   - On success: `Result.ok(jsonString)` where `jsonString` is the serialized
   *       JSON
   *   - On failure: `Result.err(errorMessage)` where `errorMessage` describes the
   *       error
   */
  export const stringify = (
    value: unknown,
    replacer?: (this: unknown, key: string, val: unknown) => unknown,
    space?: UintRangeInclusive<1, 10> | string,
  ): Result<string | undefined, string> => {
    try {
      return Result.ok(JSON.stringify(value, replacer, space));
    } catch (error) {
      const errStr = unknownToString(error);

      return Result.err(errStr);
    }
  };

  /**
   * Safely converts a JavaScript value to a JSON string, including only the
   * specified properties.
   *
   * This function provides selective serialization by allowing you to specify
   * exactly which object properties should be included in the resulting JSON.
   * It's useful for creating filtered or minimal representations of objects,
   * such as for API responses or logging.
   *
   * @example
   *
   * ```ts
   * const user = {
   *   id: 1,
   *   name: 'Charlie',
   *   email: 'charlie@example.com',
   *   password: 'secret123',
   *   role: 'admin',
   * };
   *
   * // Select only safe properties to serialize
   * const safeJson = Json.stringifySelected(user, ['id', 'name', 'role']);
   *
   * assert.isTrue(Result.isOk(safeJson));
   *
   * if (Result.isOk(safeJson)) {
   *   assert.isTrue(isString(safeJson.value));
   *
   *   const parsed: unknown = JSON.parse(safeJson.value);
   *
   *   assert.deepStrictEqual(parsed, {
   *     id: 1,
   *     name: 'Charlie',
   *     role: 'admin',
   *   });
   *
   *   assert.isFalse(safeJson.value.includes('password'));
   *
   *   assert.isFalse(safeJson.value.includes('email'));
   * }
   *
   * // With formatting
   * const formatted = Json.stringifySelected(user, ['id', 'name'], 2);
   *
   * assert.isTrue(Result.isOk(formatted));
   * ```
   *
   * @param value - The JavaScript value to serialize. While any value is
   *   accepted, the property filtering only applies to objects and nested
   *   objects.
   * @param propertiesToBeSelected - Optional array of property names (strings)
   *   and array indices (numbers) to include in the serialization. If provided,
   *   only these properties will appear in the output JSON. If undefined, all
   *   properties are included.
   * @param space - Optional formatting parameter:
   *
   *   - Number (1-10): Number of spaces to indent each level
   *   - String: String to use for indentation (first 10 characters)
   *   - Undefined/null: No formatting (compact output)
   *
   * @returns A `Result<string, string>` containing:
   *
   *   - On success: `Result.ok(jsonString)` with only selected properties
   *   - On failure: `Result.err(errorMessage)` describing the serialization error
   */
  export const stringifySelected = (
    value: unknown,
    propertiesToBeSelected?: readonly (number | string)[],
    space?: UintRangeInclusive<1, 10> | string,
  ): Result<string | undefined, string> => {
    try {
      return Result.ok(
        JSON.stringify(value, castMutable(propertiesToBeSelected), space),
      );
    } catch (error) {
      const errStr = unknownToString(error);

      return Result.err(errStr);
    }
  };

  /**
   * Safely converts a JavaScript record to a JSON string with keys sorted
   * alphabetically at all levels.
   *
   * This function creates deterministic JSON output by ensuring that object
   * keys appear in alphabetical order at every level of nesting. This is
   * particularly useful for creating consistent output for comparison, hashing,
   * caching, or when you need reproducible JSON representations across
   * different JavaScript engines or runs.
   *
   * @example
   *
   * ```ts
   * const unorderedData = {
   *   zebra: 1,
   *   apple: 2,
   *   mango: 3,
   *   nested: {
   *     zulu: 'z',
   *     alpha: 'a',
   *     beta: 'b',
   *   },
   * };
   *
   * // Keys will be sorted alphabetically at all levels
   * const sorted = Json.stringifySortedKey(unorderedData);
   *
   * assert.isTrue(Result.isOk(sorted));
   *
   * if (Result.isOk(sorted)) {
   *   // Keys should appear in alphabetical order
   *   const expected =
   *     '{"apple":2,"mango":3,"nested":{"alpha":"a","beta":"b","zulu":"z"},"zebra":1}';
   *
   *   assert.isTrue(sorted.value === expected);
   * }
   *
   * // With formatting
   * const formatted = Json.stringifySortedKey(unorderedData, 2);
   *
   * assert.isTrue(Result.isOk(formatted));
   *
   * if (Result.isOk(formatted)) {
   *   assert.isTrue(isString(formatted.value));
   *
   *   // Check that keys are in order (first key should be "apple")
   *   assert.isTrue(
   *     formatted.value.indexOf('"apple"') < formatted.value.indexOf('"mango"'),
   *   );
   *
   *   assert.isTrue(
   *     formatted.value.indexOf('"mango"') <
   *       formatted.value.indexOf('"nested"'),
   *   );
   *
   *   assert.isTrue(
   *     formatted.value.indexOf('"nested"') <
   *       formatted.value.indexOf('"zebra"'),
   *   );
   * }
   * ```
   *
   * @param value - An object (`UnknownRecord`) to serialize. Must be a plain
   *   object (not an array, primitive, or null). Nested objects and arrays
   *   within the object will also have their keys sorted alphabetically.
   * @param space - Optional formatting parameter:
   *
   *   - Number (1-10): Number of spaces to indent each level
   *   - String: String to use for indentation (first 10 characters)
   *   - Undefined/null: No formatting (compact output)
   *
   * @returns A `Result<string, string>` containing:
   *
   *   - On success: `Result.ok(jsonString)` with all object keys sorted
   *       alphabetically
   *   - On failure: `Result.err(errorMessage)` describing the serialization error
   */
  export const stringifySortedKey = (
    value: UnknownRecord,
    space?: UintRangeInclusive<1, 10> | string,
  ): Result<string | undefined, string> => {
    const allKeys = pipe(keysDeep(value))
      .map((keys) => Arr.uniq(keys))
      .map((ks) => ks.toSorted()).value;

    return stringifySelected(value, allKeys, space);
  };
}

/**
 * @param obj - The record to extract keys from. Must be a plain object.
 * @param mut_keys - A mutable array to accumulate the collected keys. This
 *   array will be modified in-place by the function for performance reasons.
 * @internal
 * Recursively collects all property keys from a nested object structure.
 *
 * This helper function traverses an object and its nested objects and arrays,
 * collecting all string keys found at any level of nesting. The function mutates
 * the provided keys array for performance reasons.
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
 * @param obj - The record to extract keys from. Must be a plain object.
 * @returns A readonly array of all string keys found in the object and its
 *   nested objects/arrays. May contain duplicates if the same key appears at
 *   multiple levels.
 * @internal
 * Extracts all property keys from a nested object structure into a flat array.
 *
 * This function serves as a safe wrapper around `keysDeepImpl`, creating a new
 * mutable array and passing it to the recursive implementation. The result
 * contains all keys found at any level of nesting within the input object.
 */
const keysDeep = (obj: UnknownRecord): readonly string[] => {
  const mut_keys: string[] = [];

  keysDeepImpl(obj, mut_keys);

  return mut_keys;
};
