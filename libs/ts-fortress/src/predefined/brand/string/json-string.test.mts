import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { jsonString } from './json-string.mjs';

describe('jsonString', () => {
  const baseType = jsonString();
  const customDefault = jsonString({ defaultValue: '{"ok":true}' });

  type JsonStringType = TypeOf<typeof baseType>;
  expectType<JsonStringType, string>('<=');
  expectType<typeof baseType.defaultValue, JsonStringType>('=');

  test('provides an object literal as default', () => {
    expect(baseType.defaultValue).toBe('{}');
    expect(customDefault.defaultValue).toBe('{"ok":true}');
  });

  test.each(['{"foo":1}', '{"nested":{"bar":[1,2]}}', '[]'] as const)(
    'accepts $0',
    (s) => {
      expect(baseType.is(s)).toBe(true);
    },
  );

  test.each(['not-json', '{"unterminated"', '123', 'null'] as const)(
    'rejects $0',
    (s) => {
      expect(baseType.is(s)).toBe(false);
    },
  );

  test('validate yields detailed errors for invalid strings', () => {
    const result = baseType.validate('not-json');
    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) {
      throw new Error('Expected validation failure');
    }

    expect(result.value).toStrictEqual([
      {
        path: [],
        actualValue: 'not-json',
        expectedType: 'JsonString',
        typeName: 'JsonString',
        message: undefined,
      },
    ]);

    expect(validationErrorsToMessages(result.value)).toStrictEqual([
      'Expected <JsonString>, got <string> type value "not-json".',
    ]);
  });

  test('fill falls back to default for invalid input', () => {
    expect(baseType.fill('invalid')).toBe(baseType.defaultValue);
  });

  test('cast returns parsed string when valid, throws otherwise', () => {
    expect(baseType.cast('{"foo":1}')).toBe('{"foo":1}');
    expect(() => baseType.cast('invalid')).toThrow('Expected');
  });
});
