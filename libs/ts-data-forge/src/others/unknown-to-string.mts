import { isNonNullish } from '../guard/index.mjs';

/**
 * Converts an unknown value to its string representation in a type-safe manner.
 *
 * This function handles all JavaScript types and provides consistent string conversion
 * with proper error handling for edge cases like circular references. Unlike naive
 * toString() calls, this function never throws and handles all value types gracefully.
 *
 * **Type conversion rules:**
 * - Strings: returned as-is
 * - Numbers, booleans, bigints: converted via toString()
 * - Symbols: converted to their description string
 * - Functions: converted to their string representation
 * - null: returns "null" (not "null" from JSON)
 * - undefined: returns "undefined"
 * - Objects: JSON stringified (with optional pretty printing)
 *
 * @param value - The unknown value to convert to string
 * @param options - Optional configuration for the conversion
 * @param options.prettyPrintObject - If true, objects are formatted with 2-space indentation
 * @returns The string representation of the value. For circular references or non-serializable objects, returns an error message string
 *
 * @example Basic type conversions
 * ```typescript
 * // Primitive types
 * unknownToString('hello');        // 'hello'
 * unknownToString(123);            // '123'
 * unknownToString(true);           // 'true'
 * unknownToString(null);           // 'null'
 * unknownToString(undefined);      // 'undefined'
 * unknownToString(Symbol('test')); // 'Symbol(test)'
 * unknownToString(123n);           // '123'
 *
 * // Function conversion
 * const fn = () => 'test';
 * unknownToString(fn); // "() => 'test'"
 * ```
 *
 * @example Object stringification
 * ```typescript
 * // Simple object
 * const obj = { a: 1, b: 'hello', c: [1, 2, 3] };
 * const result = unknownToString(obj);
 * console.log(result); // '{"a":1,"b":"hello","c":[1,2,3]}'
 *
 * // Pretty printing
 * const prettyResult = unknownToString(obj, { prettyPrintObject: true });
 * console.log(prettyResult);
 * // {
 * //   "a": 1,
 * //   "b": "hello",
 * //   "c": [
 * //     1,
 * //     2,
 * //     3
 * //   ]
 * // }
 * ```
 *
 * @example Error handling for circular references
 * ```typescript
 * // Circular reference
 * const circular: any = { name: 'parent' };
 * circular.self = circular;
 *
 * const result = unknownToString(circular);
 * console.log(result); // "Converting circular structure to JSON"
 *
 * @example Logging and debugging utilities
 * ```typescript
 * // Type-safe logger
 * class Logger {
 *   log(message: string, data?: unknown): void {
 *     const timestamp = new Date().toISOString();
 *     const dataStr = data !== undefined
 *       ? unknownToString(data, { prettyPrintObject: true })
 *       : '';
 *
 *     console.log(`[${timestamp}] ${message}`, dataStr);
 *   }
 * }
 *
 * const logger = new Logger();
 * logger.log('User data:', { id: 123, name: 'John' });
 * ```
 *
 * @example API response formatting
 * ```typescript
 * // Safe error response formatting
 * function formatErrorResponse(error: unknown): string {
 *   const errorStr = unknownToString(error, { prettyPrintObject: true });
 *
 *   return JSON.stringify({
 *     success: false,
 *     error: errorStr
 *   });
 * }
 *
 * try {
 *   // some operation
 * } catch (error) {
 *   const response = formatErrorResponse(error);
 *   res.status(500).send(response);
 * }
 * ```
 *
 * @example Working with special objects
 * ```typescript
 * // Date objects
 * unknownToString(new Date('2023-01-01'));
 * // '"2023-01-01T00:00:00.000Z"' - JSON stringified
 *
 * // Regular expressions
 * unknownToString(/test/gi);
 * // '{}' - RegExp has no enumerable properties
 *
 * // Arrays
 * unknownToString([1, 'two', { three: 3 }]);
 * // '[1,"two",{"three":3}]'
 *
 * // Map and Set (converted to empty objects by JSON.stringify)
 * unknownToString(new Map([['a', 1]])); // '{}'
 * unknownToString(new Set([1, 2, 3]));   // '{}'
 * ```
 *
 * @example Using with validation
 * ```typescript
 * // Simple validation helper
 * function validateAndStringify(input: unknown): string {
 *   const str = unknownToString(input);
 *   const trimmed = str.trim();
 *
 *   if (trimmed.length === 0) {
 *     throw new Error('Empty string');
 *   }
 *
 *   return trimmed;
 * }
 * ```
 *
 * **Error Handling:**
 * Circular references and non-serializable objects return descriptive error messages instead of throwing
 * @see JSON.stringify - Underlying serialization for objects
 */
export const unknownToString = (
  value: unknown,
  options?: Partial<Readonly<{ prettyPrintObject: boolean }>>,
): string => {
  switch (typeof value) {
    case 'string':
      return value;

    case 'bigint':
      return `${value.toString()}n`;

    case 'number':
    case 'boolean':
    case 'symbol':
    case 'function':
      return value.toString();

    case 'object':
      if (!isNonNullish(value)) {
        return 'null';
      }
      try {
        const stringified =
          options?.prettyPrintObject === true
            ? JSON.stringify(value, undefined, 2)
            : JSON.stringify(value);
        return stringified;
      } catch (error) {
        return Error.isError(error)
          ? error.message
          : '[Circular or Non-serializable]';
      }

    case 'undefined':
      return 'undefined';
  }
};
