import { expectType, Result } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { jsonString } from './json-string.mjs';

describe(jsonString, () => {
  const baseType = jsonString();

  const customDefault = jsonString({ defaultValue: '{"ok":true}' });

  type JsonStringType = TypeOf<typeof baseType>;

  expectType<JsonStringType, string>('<=');

  expectType<JsonStringType, NonEmptyString>('<=');

  expectType<typeof baseType.defaultValue, JsonStringType>('=');

  test('provides an object literal as default', () => {
    expect(baseType.defaultValue).toBe('{}');

    expect(customDefault.defaultValue).toBe('{"ok":true}');
  });

  test.each(['{"foo":1}', '{"nested":{"bar":[1,2]}}', '[]'] as const)(
    'accepts $0',
    (s) => {
      assert.isTrue(baseType.is(s));
    },
  );

  test.each(['not-json', '{"unterminated"', '123', 'null'] as const)(
    'rejects $0',
    (s) => {
      assert.isFalse(baseType.is(s));
    },
  );

  test('validate yields detailed errors for invalid strings', () => {
    const result = baseType.validate('not-json');

    assert.isTrue(Result.isErr(result));

    if (!Result.isErr(result)) {
      throw new Error('Expected validation failure');
    }

    assert.deepStrictEqual(result.value, [
      {
        path: [],
        actualValue: 'not-json',
        expectedType: 'JsonString',
        typeName: 'JsonString',
        details: undefined,
      },
    ]);

    assert.deepStrictEqual(validationErrorsToMessages(result.value), [
      'Error: expected <JsonString> type but <string> type value "not-json" was passed.',
    ]);
  });

  test('fill falls back to default for invalid input', () => {
    expect(baseType.fill('invalid')).toBe(baseType.defaultValue);
  });

  test('cast returns parsed string when valid, throws otherwise', () => {
    expect(baseType.cast('{"foo":1}')).toBe('{"foo":1}');

    expect(() => baseType.cast('invalid')).toThrow('Error');
  });
});
