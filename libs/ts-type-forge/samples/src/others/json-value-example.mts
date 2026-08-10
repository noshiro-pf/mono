import { type JsonValue } from 'ts-type-forge';

// embed-sample-code-ignore-above

// API response that should remain immutable
const apiResponse: JsonValue = {
  data: {
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  },
  meta: { total: 2, page: 1 },
} as const;

// Type-safe JSON parsing
const parseConfig = (jsonString: string): JsonValue =>
  JSON.parse(jsonString) as JsonValue;

// apiResponse.data.users.push({...}); // ✗ Error: readonly array

// embed-sample-code-ignore-below
export { apiResponse, parseConfig };
