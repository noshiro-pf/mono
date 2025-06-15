import { Result } from '../functional/index.mjs';
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
 * @returns A Result containing either the string representation or an Error for failures
 *
 * @example Basic type conversions
 * ```typescript
 * // Primitive types
 * unknownToString('hello');        // Ok('hello')
 * unknownToString(123);            // Ok('123')
 * unknownToString(true);           // Ok('true')
 * unknownToString(null);           // Ok('null')
 * unknownToString(undefined);      // Ok('undefined')
 * unknownToString(Symbol('test')); // Ok('Symbol(test)')
 * unknownToString(123n);           // Ok('123')
 *
 * // Function conversion
 * const fn = () => 'test';
 * unknownToString(fn); // Ok('() => 'test'')
 * ```
 *
 * @example Object stringification
 * ```typescript
 * // Simple object
 * const obj = { a: 1, b: 'hello', c: [1, 2, 3] };
 * const result = unknownToString(obj);
 * if (Result.isOk(result)) {
 *   console.log(result.value); // '{"a":1,"b":"hello","c":[1,2,3]}'
 * }
 *
 * // Pretty printing
 * const prettyResult = unknownToString(obj, { prettyPrintObject: true });
 * if (Result.isOk(prettyResult)) {
 *   console.log(prettyResult.value);
 *   // {
 *   //   "a": 1,
 *   //   "b": "hello",
 *   //   "c": [
 *   //     1,
 *   //     2,
 *   //     3
 *   //   ]
 *   // }
 * }
 * ```
 *
 * @example Error handling for circular references
 * ```typescript
 * // Circular reference
 * const circular: any = { name: 'parent' };
 * circular.self = circular;
 *
 * const result = unknownToString(circular);
 * if (Result.isErr(result)) {
 *   console.log(result.value.message);
 *   // "Converting circular structure to JSON"
 * }
 *
 * // Handle with custom serialization
 * const safeStringify = (value: unknown): string => {
 *   const result = unknownToString(value);
 *   return Result.isOk(result)
 *     ? result.value
 *     : `[Error: ${result.value.message}]`;
 * };
 * ```
 *
 * @example Logging and debugging utilities
 * ```typescript
 * // Type-safe logger
 * class Logger {
 *   log(message: string, data?: unknown): void {
 *     const timestamp = new Date().toISOString();
 *     const dataStr = data !== undefined
 *       ? unknownToString(data, { prettyPrintObject: true })
 *       : Result.ok('');
 *
 *     if (Result.isOk(dataStr)) {
 *       console.log(`[${timestamp}] ${message}`, dataStr.value);
 *     } else {
 *       console.log(`[${timestamp}] ${message} [Unstringifiable data]`);
 *     }
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
 *   const result = unknownToString(error, { prettyPrintObject: true });
 *
 *   if (Result.isOk(result)) {
 *     return JSON.stringify({
 *       success: false,
 *       error: result.value
 *     });
 *   }
 *
 *   // Fallback for unstringifiable errors
 *   return JSON.stringify({
 *     success: false,
 *     error: 'An unknown error occurred'
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
 * // Ok('"2023-01-01T00:00:00.000Z"') - JSON stringified
 *
 * // Regular expressions
 * unknownToString(/test/gi);
 * // Ok('{}') - RegExp has no enumerable properties
 *
 * // Arrays
 * unknownToString([1, 'two', { three: 3 }]);
 * // Ok('[1,"two",{"three":3}]')
 *
 * // Map and Set (converted to empty objects by JSON.stringify)
 * unknownToString(new Map([['a', 1]])); // Ok('{}')
 * unknownToString(new Set([1, 2, 3]));   // Ok('{}')
 * ```
 *
 * @example Integration with Result type
 * ```typescript
 * import { Result, pipe } from '../functional';
 *
 * // Chain with other Result operations
 * function processUserInput(input: unknown): Result<string, Error> {
 *   return pipe(input)
 *     .map(val => unknownToString(val))
 *     .map(Result.flatten) // Flatten Result<Result<string, Error>, never>
 *     .map(str => Result.map(str, s => s.trim()))
 *     .map(Result.flatten)
 *     .map(str => Result.flatMap(str, s =>
 *       s.length > 0
 *         ? Result.ok(s)
 *         : Result.err(new Error('Empty string'))
 *     ))
 *     .value;
 * }
 * ```
 *
 * @see Result - For error handling pattern used by this function
 * @see JSON.stringify - Underlying serialization for objects
 */
export const unknownToString = (
  value: unknown,
  options?: Partial<Readonly<{ prettyPrintObject: boolean }>>,
): Result<string, Error> => {
  switch (typeof value) {
    case 'string':
      return Result.ok(value);

    case 'number':
    case 'bigint':
    case 'boolean':
    case 'symbol':
    case 'function':
      return Result.ok(value.toString());

    case 'object':
      if (!isNonNullish(value)) {
        return Result.ok('null');
      }
      try {
        const stringified =
          options?.prettyPrintObject === true
            ? JSON.stringify(value, undefined, 2)
            : JSON.stringify(value);
        return Result.ok(stringified);
      } catch (error) {
        return Result.err(
          error instanceof Error
            ? error
            : new Error('Failed to stringify object'),
        );
      }

    case 'undefined':
      return Result.ok('undefined');
  }
};
