import { expectType, Result } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { uri } from './uri.mjs';

const validSamples = [
  'https://example.com',
  'https://example.com/path?query=1#fragment',
  'http://user:pass@example.com:8080/path',
  'ftp://ftp.is.co.za/rfc/rfc1808.txt',
  'mailto:foo@bar.com',
  'urn:isbn:0451450523',
  'file:///etc/hosts',
  'tel:+1-816-555-1212',
] as const satisfies readonly string[];

const invalidSamples = [
  '',
  'not a uri',
  '://missing-scheme',
  'relative/path',
  '/absolute/path',
  '1http://example.com',
  ' https://example.com',
  'https://example.com ',
  ' https://example.com ',
] as const satisfies readonly string[];

describe(uri, () => {
  const baseType = uri();

  type UriType = TypeOf<typeof baseType>;

  expectType<UriType, string>('<=');

  expectType<UriType, NonEmptyString>('<=');

  expectType<typeof baseType.defaultValue, UriType>('=');

  test('provides https://example.com as default', () => {
    expect(baseType.defaultValue).toBe('https://example.com');
  });

  test.each(validSamples)('accepts %s', (u) => {
    assert.isTrue(baseType.is(u));
  });

  test.each(invalidSamples)('rejects %s', (u) => {
    assert.isFalse(baseType.is(u));
  });

  test('validate surfaces details for invalid strings', () => {
    const result = baseType.validate('not a uri');

    assert.isTrue(Result.isErr(result));

    if (!Result.isErr(result)) {
      throw new Error('Expected validation failure');
    }

    assert.deepStrictEqual(result.value, [
      {
        path: [],
        actualValue: 'not a uri',
        expectedType: 'Uri',
        typeName: 'Uri',
        details: undefined,
      },
    ]);

    assert.deepStrictEqual(validationErrorsToMessages(result.value), [
      'Error: expected <Uri> type but <string> type value "not a uri" was passed.',
    ]);
  });

  test('accepts a custom default value', () => {
    const customType = uri({ defaultValue: 'mailto:foo@bar.com' });

    expect(customType.defaultValue).toBe('mailto:foo@bar.com');
  });
});
