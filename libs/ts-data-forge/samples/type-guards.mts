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

if (import.meta.vitest !== undefined) {
  if (isNonNullObject(value)) {
    // value is guaranteed to be a non-null object
    expect(Object.keys(value)).toStrictEqual(['key']);
  }
}

// Example usage
if (import.meta.vitest !== undefined) {
  expect(processData({ name: 'Alice' })).toBe('Hello, Alice!');
  expect(processData({ age: 30 })).toBe(undefined);
  expect(processData('not an object')).toBe(undefined);
}
