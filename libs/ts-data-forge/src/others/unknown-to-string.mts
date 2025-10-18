import { isNonNullish } from '../guard/index.mjs';

/**
 * Converts an unknown value to its string representation in a type-safe manner.
 *
 * This function handles all JavaScript types and provides consistent string
 * conversion with proper error handling for edge cases like circular
 * references. Unlike naive toString() calls, this function never throws and
 * handles all value types gracefully.
 *
 * **Type conversion rules:**
 *
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
 * @param options.prettyPrintObject - If true, objects are formatted with
 *   2-space indentation
 * @returns The string representation of the value. For circular references or
 *   non-serializable objects, returns an error message string
 *
 *   **Error Handling:** Circular references and non-serializable objects return
 *   descriptive error messages instead of throwing
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
