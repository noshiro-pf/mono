/**
 * Represents the primitive types allowed in JSON: boolean, number, string, or null.
 */
type JsonPrimitive = boolean | number | string | null;

/**
 * Represents any valid JSON value, including primitives, mutable arrays of JSON values,
 * or mutable objects where keys are strings and values are JSON values.
 * Use this type when you need to build or modify JSON structures.
 */
type MutableJsonValue =
  | JsonPrimitive
  | MutableJsonValue[]
  | {
      [k: string]: MutableJsonValue;
    };

/**
 * Represents any valid, immutable JSON value.
 * This includes primitives, readonly arrays of JSON values,
 * or readonly objects where keys are strings and values are JSON values.
 * Use this type for representing parsed or received JSON data that should not be modified.
 */
type JsonValue =
  | JsonPrimitive
  | Readonly<{
      [k: string]: JsonValue;
    }>
  | readonly JsonValue[];

/**
 * Represents an immutable JSON object, which is a record with string keys and `JsonValue` values.
 * Ensures the object itself is readonly.
 */
type JsonObject = Readonly<Record<string, JsonValue>>;

/**
 * Represents a mutable JSON object, which is a record with string keys and `MutableJsonValue` values.
 * Allows modification of the object's properties.
 */
type MutableJsonObject = MutableRecord<string, MutableJsonValue>; // Assuming MutableRecord is similar to Record
