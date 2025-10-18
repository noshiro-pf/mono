// Example: src/json/json.mts (parse)
import { Json, Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const validJson = '{"name": "Alice", "age": 30}';
const invalidJson = '{invalid json}';

const parsed = Json.parse(validJson);
const failed = Json.parse(invalidJson);

assert.ok(Result.isOk(parsed));
if (Result.isOk(parsed)) {
  assert.deepStrictEqual(parsed.value, { name: 'Alice', age: 30 });
}

assert.ok(Result.isErr(failed));

// With reviver
const jsonWithDate = '{"created": "2024-01-01T00:00:00.000Z"}';
const withReviver = Json.parse(jsonWithDate, (key, value) => {
  if (key === 'created' && typeof value === 'string') {
    return new Date(value);
  }
  return value;
});

assert.ok(Result.isOk(withReviver));
