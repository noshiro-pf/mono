// Example: src/json/json.mts (parse)
import { Json, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const validJson = '{"name": "Alice", "age": 30}';

    const invalidJson = '{invalid json}';

    const parsed = Json.parse(validJson);

    const failed = Json.parse(invalidJson);

    assert.isTrue(Result.isOk(parsed));

    if (Result.isOk(parsed)) {
      assert.deepStrictEqual(parsed.value, { name: 'Alice', age: 30 });
    }

    assert.isTrue(Result.isErr(failed));

    // embed-sample-code-ignore-below
  });
}
