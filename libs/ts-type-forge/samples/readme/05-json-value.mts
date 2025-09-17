/* eslint-disable total-functions/no-unsafe-type-assertion */
// embed-sample-code-ignore-above

const jsonString =
  '{"name": "Alice", "age": 30, "isAdmin": false, "tags": ["user", "active"], "metadata": null}';

try {
  // Cast the result of JSON.parse to JsonValue for type safety
  const parsedData = JSON.parse(jsonString) as JsonValue;

  // Use type guards to safely work with parsed data
  if (
    typeof parsedData === 'object' &&
    parsedData !== null &&
    !Array.isArray(parsedData)
  ) {
    // parsedData is now known to be JsonObject
    const jsonObj = parsedData as JsonObject;

    console.log(jsonObj['name']); // Access properties safely

    if (typeof jsonObj['age'] === 'number') {
      console.log(`Age: ${jsonObj['age']}`);
    }

    if (Array.isArray(jsonObj['tags'])) {
      for (const tag of jsonObj['tags']) {
        if (typeof tag === 'string') {
          console.log(`Tag: ${tag}`);
        }
      }
    }
  } else if (Array.isArray(parsedData)) {
    // parsedData is a JSON array
    for (const item of parsedData) {
      console.log(item);
    }
  }
} catch (error) {
  console.error('Failed to parse JSON:', error);
}

// Define API response types using JsonValue
type ApiResponse = JsonObject &
  Readonly<{
    status: 'success' | 'error';
    data?: JsonValue;
    message?: string;
  }>;

// embed-sample-code-ignore-below
export { type ApiResponse };
