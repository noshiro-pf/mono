import { isDate, isError, isMap, isRegExp, isSet } from '@sindresorhus/is';

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
 * - Date: converted to ISO string
 * - RegExp: converted to regex literal string
 * - Map: converted to Map representation with entries
 * - Set: converted to Set representation with values
 * - Error: returns error message
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

    case 'undefined':
      return 'undefined';

    case 'object': {
      if (value === null) {
        return 'null';
      }

      try {
        // Special handling for Date
        if (isDate(value)) {
          return value.toISOString();
        }

        // Special handling for RegExp
        if (isRegExp(value)) {
          return value.toString();
        }

        if (isError(value)) {
          return value.message;
        }

        const prettyPrintObject = options?.prettyPrintObject === true;

        // Special handling for Map
        if (isMap(value)) {
          const entries = Array.from(value.entries());

          const entriesStr = prettyPrintObject
            ? JSON.stringify(entries, undefined, 2)
            : JSON.stringify(entries);

          return `Map(${entriesStr})`;
        }

        // Special handling for Set
        if (isSet(value)) {
          const values = Array.from(value.values());

          const valuesStr = prettyPrintObject
            ? JSON.stringify(values, undefined, 2)
            : JSON.stringify(values);

          return `Set(${valuesStr})`;
        }

        return prettyPrintObject
          ? JSON.stringify(value, undefined, 2)
          : JSON.stringify(value);
      } catch (error) {
        return isError(error)
          ? error.message
          : '[Circular or Non-serializable]';
      }
    }
  }
};
