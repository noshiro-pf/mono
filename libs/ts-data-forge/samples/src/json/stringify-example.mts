// Example: src/json/json.mts (stringify)
import { isString, Json, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = { name: 'Bob', age: 25, active: true } as const;

    // Basic stringify
    const basic = Json.stringify(data);

    assert.isTrue(Result.isOk(basic));

    if (Result.isOk(basic)) {
      assert.isTrue(basic.value === '{"name":"Bob","age":25,"active":true}');
    }

    // With formatting
    const formatted = Json.stringify(data, undefined, 2);

    assert.isTrue(Result.isOk(formatted));

    // With replacer
    const filtered = Json.stringify(data, (key, value) =>
      // omit age field
      key === 'age' ? undefined : value,
    );

    assert.isTrue(Result.isOk(filtered));

    if (!Result.isOk(filtered)) {
      return;
    }

    assert.isTrue(isString(filtered.value));

    assert.isFalse(filtered.value.includes('age'));

    // embed-sample-code-ignore-below
  });
}
