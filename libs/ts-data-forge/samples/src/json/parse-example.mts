// Example: src/json/json.mts (parse)
import { isRecord, Json, Result } from 'ts-data-forge';

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

    // With reviver
    const jsonWithDate = '{"created": "2024-01-01T00:00:00.000Z"}';

    const withReviver = Json.parse(jsonWithDate, (key, value) =>
      key === 'created' && typeof value === 'string' ? new Date(value) : value,
    );

    assert.isTrue(Result.isOk(withReviver));

    // With a reviver, the result is whatever the reviver returned, not JSON:
    // `created` is a `Date` here although it is typed `JsonValue`. Widen it to
    // `unknown` before narrowing it.
    const revived: unknown = withReviver.value;

    assert.isTrue(isRecord(revived));

    assert.instanceOf(revived['created'], Date);

    // embed-sample-code-ignore-below
  });
}
