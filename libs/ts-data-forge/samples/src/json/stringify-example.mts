// Example: src/json/json.mts (stringify)
import { Json, Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const data = { name: 'Bob', age: 25, active: true };

// Basic stringify
const basic = Json.stringify(data);
assert.ok(Result.isOk(basic));
if (Result.isOk(basic)) {
  assert(basic.value === '{"name":"Bob","age":25,"active":true}');
}

// With formatting
const formatted = Json.stringify(data, undefined, 2);
assert.ok(Result.isOk(formatted));

// With replacer
const filtered = Json.stringify(data, (key, value) => {
  if (key === 'age') return undefined; // omit age field
  return value;
});

assert.ok(Result.isOk(filtered));
if (Result.isOk(filtered)) {
  assert.ok(!filtered.value.includes('age'));
}
