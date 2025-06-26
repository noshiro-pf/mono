import { hasKey, isNonNullObject, isRecord } from 'ts-data-forge';

const processData = (data: unknown): string | undefined => {
  if (isRecord(data)) {
    // data is now UnknownRecord (= Readonly<Record<string, unknown>>)
    if (
      hasKey(data, 'name') &&
      // data is now ReadonlyRecord<"name", unknown> & UnknownRecord
      typeof data.name === 'string'
    ) {
      return `Hello, ${data.name}!`;
    }
  }
  return undefined;
};

// Non-null object checking
const value: unknown = { key: 'value' };

if (isNonNullObject(value)) {
  // value is guaranteed to be a non-null object
  assert.deepStrictEqual(Object.keys(value), ['key']);
}

// Example usage
assert.strictEqual(processData({ name: 'Alice' }), 'Hello, Alice!');
assert.strictEqual(processData({ age: 30 }), undefined);
assert.strictEqual(processData('not an object'), undefined);
