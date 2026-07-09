import { type JsonPrimitive } from 'ts-type-forge';

// embed-sample-code-ignore-above

const jsonString: JsonPrimitive = 'hello'; // ✓ valid
const jsonNumber: JsonPrimitive = 42; // ✓ valid
const jsonBoolean: JsonPrimitive = true; // ✓ valid
const jsonNull: JsonPrimitive = null; // ✓ valid
// const invalid: JsonPrimitive = undefined;   // ✗ error

// embed-sample-code-ignore-below
export { jsonBoolean, jsonNull, jsonNumber, jsonString };
