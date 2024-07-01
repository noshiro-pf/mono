import { expectType } from './expect-type.mjs';
import { generateKeyValueRecordFromKeys } from './generate-key-value-record-from-keys.mjs';

describe('generateKeyValueRecordFromKeys', () => {
  test('should map empty array to {}', () => {
    const result = generateKeyValueRecordFromKeys([] as const);

    // eslint-disable-next-line @typescript-eslint/ban-types
    expectType<typeof result, Readonly<{}>>('=');

    expect(result).toStrictEqual({});
  });

  test('should map ["a", "b"] to { a: "a", b: "b" }', () => {
    const result = generateKeyValueRecordFromKeys(['a', 'b'] as const);

    expectType<typeof result, Readonly<{ a: 'a'; b: 'b' }>>('=');

    expect(result).toStrictEqual({ a: 'a', b: 'b' });
  });
});
