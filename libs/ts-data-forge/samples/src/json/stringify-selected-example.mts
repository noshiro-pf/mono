// Example: src/json/json.mts (stringifySelected)
import { isString, Json, Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const user = {
  id: 1,
  name: 'Charlie',
  email: 'charlie@example.com',
  password: 'secret123',
  role: 'admin',
};

// Select only safe properties to serialize
const safeJson = Json.stringifySelected(user, ['id', 'name', 'role']);

assert.ok(Result.isOk(safeJson));
if (Result.isOk(safeJson)) {
  assert(isString(safeJson.value));

  const parsed: unknown = JSON.parse(safeJson.value);
  assert.deepStrictEqual(parsed, {
    id: 1,
    name: 'Charlie',
    role: 'admin',
  });
  assert.ok(!safeJson.value.includes('password'));
  assert.ok(!safeJson.value.includes('email'));
}

// With formatting
const formatted = Json.stringifySelected(user, ['id', 'name'], 2);
assert.ok(Result.isOk(formatted));
