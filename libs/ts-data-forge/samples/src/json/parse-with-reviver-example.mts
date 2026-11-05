// Example: src/json/json.mts (parseWithReviver)
import { isRecord, Json, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const jsonWithDate = '{"created": "2024-01-01T00:00:00.000Z"}';

    const revived = Json.parseWithReviver(jsonWithDate, (key, value) =>
      key === 'created' && typeof value === 'string' ? new Date(value) : value,
    );

    assert.isTrue(Result.isOk(revived));

    // The result is whatever the reviver returned, typed `unknown`: here
    // `created` is a `Date`, not JSON.
    const root = Result.unwrapOkOr(revived, undefined);

    assert.isTrue(isRecord(root));

    assert.instanceOf(root['created'], Date);

    // embed-sample-code-ignore-below
  });
}
