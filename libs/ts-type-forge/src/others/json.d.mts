/**
 * Represents the primitive types allowed in JSON according to RFC 7159.
 * JSON primitives are: `boolean`, `number`, `string`, and `null`.
 * Note that `undefined` is not a valid JSON primitive.
 *
 * @example
 * ```ts
 * const jsonString: JsonPrimitive = "hello";     // ✓ valid
 * const jsonNumber: JsonPrimitive = 42;          // ✓ valid
 * const jsonBoolean: JsonPrimitive = true;       // ✓ valid
 * const jsonNull: JsonPrimitive = null;          // ✓ valid
 * // const invalid: JsonPrimitive = undefined;   // ✗ error
 * ```
 */
type JsonPrimitive = boolean | number | string | null;

/**
 * Represents any valid JSON value that can be modified after creation.
 * This includes primitives, mutable arrays of JSON values, or mutable objects
 * where keys are strings and values are JSON values.
 *
 * Use this type when you need to build, modify, or manipulate JSON structures
 * programmatically, such as constructing API payloads or transforming data.
 *
 * @example
 * ```ts
 * const apiPayload: MutableJsonValue = {
 *   user: {
 *     name: "John Doe",
 *     age: 30,
 *     preferences: ["dark-mode", "notifications"]
 *   }
 * };
 *
 * // Can modify the structure
 * if (typeof apiPayload === 'object' && apiPayload !== null && 'user' in apiPayload) {
 *   const user = apiPayload.user as MutableJsonValue;
 *   if (typeof user === 'object' && user !== null && 'age' in user) {
 *     (user as any).age = 31; // Update age
 *   }
 * }
 * ```
 */
type MutableJsonValue =
  | JsonPrimitive
  | MutableJsonValue[]
  | {
      [k: string]: MutableJsonValue;
    };

/**
 * Represents any valid JSON value in its immutable form.
 * This includes primitives, readonly arrays of JSON values, or readonly objects
 * where keys are strings and values are JSON values.
 *
 * Use this type for representing parsed JSON data that should not be modified,
 * such as configuration files, API responses that should remain unchanged,
 * or when enforcing immutability in your application.
 *
 * @example
 * ```ts
 * // API response that should remain immutable
 * const apiResponse: JsonValue = {
 *   data: {
 *     users: [
 *       { id: 1, name: "Alice" },
 *       { id: 2, name: "Bob" }
 *     ]
 *   },
 *   meta: { total: 2, page: 1 }
 * };
 *
 * // Type-safe JSON parsing
 * const parseConfig = (jsonString: string): JsonValue => {
 *   return JSON.parse(jsonString) as JsonValue;
 * };
 *
 * // apiResponse.data.users.push({...}); // ✗ Error: readonly array
 * ```
 */
type JsonValue =
  | JsonPrimitive
  | Readonly<{
      [k: string]: JsonValue;
    }>
  | readonly JsonValue[];

/**
 * Represents an immutable JSON object with string keys and `JsonValue` values.
 * The object itself and all nested structures are readonly, ensuring immutability
 * throughout the entire object tree.
 *
 * @example
 * ```ts
 * const config: JsonObject = {
 *   database: {
 *     host: "localhost",
 *     port: 5432,
 *     ssl: true
 *   },
 *   features: ["auth", "logging"]
 * };
 *
 * // config.database.port = 3306; // ✗ Error: readonly property
 * ```
 */
type JsonObject = ReadonlyRecord<string, JsonValue>;

/**
 * Represents a mutable JSON object with string keys and `MutableJsonValue` values.
 * All properties can be modified after creation, making it suitable for building
 * or transforming JSON structures.
 *
 * @example
 * ```ts
 * const builder: MutableJsonObject = {};
 * builder.timestamp = Date.now();
 * builder.data = { message: "Hello" };
 * builder.tags = ["info", "user-action"];
 *
 * // All modifications are allowed
 * builder.data = { message: "Updated" }; // ✓ valid
 * ```
 */
type MutableJsonObject = MutableRecord<string, MutableJsonValue>;
