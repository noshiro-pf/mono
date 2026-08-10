// Example: src/json/json.mts (stringifySelected)
import { isString, Json, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const user = {
      id: 1,
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'secret123',
      role: 'admin',
    } as const;

    // Select only safe properties to serialize
    const safeJson = Json.stringifySelected(user, ['id', 'name', 'role']);

    assert.isTrue(Result.isOk(safeJson));

    if (Result.isOk(safeJson)) {
      assert.isTrue(isString(safeJson.value));

      const parsed: unknown = JSON.parse(safeJson.value);

      assert.deepStrictEqual(parsed, {
        id: 1,
        name: 'Charlie',
        role: 'admin',
      });

      assert.isFalse(safeJson.value.includes('password'));

      assert.isFalse(safeJson.value.includes('email'));
    }

    // With formatting
    const formatted = Json.stringifySelected(user, ['id', 'name'], 2);

    assert.isTrue(Result.isOk(formatted));

    // embed-sample-code-ignore-below
  });
}
