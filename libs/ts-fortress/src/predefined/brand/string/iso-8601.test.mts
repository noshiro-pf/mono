import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { iso8601 } from './iso-8601.mjs';

// https://www.myintervals.com/blog/iso-8601-date-validation/

const validSamples = [
  '2009-05-19 14:39',
  '2009-12T12:34',
  '2009',
  '2009-05-19',
  '20090519',
  '2009123',
  '2009-05',
  '2009-123',
  '2009-222',
  '2009-001',
  '2009-W01-1',
  '2009-W51-1',
  '2009-W511',
  '2009-W33',
  '2009W511',
  '2009-05-19',
  '2009-05-19 00:00',
  '2009-05-19 14',
  '2009-05-19 14:31',
  '2009-05-19 14:39:22',
  '2009-05-19T14:39Z',
  '2009-W21-2',
  '2009-W21-2T01:22',
  '2009-139',
  '2009-05-19 14:39:22-06:00',
  '2009-05-19 14:39:22+0600',
  '2009-05-19 14:39:22-01',
  '20090621T0545Z',
  '2007-04-06T00:00',
  '2007-04-05T24:00',
  '2010-02-18T16:23:48.5',
  '2010-02-18T16:23:48,444',
  '2010-02-18T16:23:48,3-06:00',
  '2010-02-18T16:23.4',
  '2010-02-18T16:23,25',
  '2010-02-18T16:23.33+0600',
  '2010-02-18T16.23334444',
  '2010-02-18T16,2283',
  '2009-05-19 143922.500',
  '2009-05-19 1439,55',
] as const satisfies readonly string[];

const invalidSamples = [
  '200905',
  '2009367',
  '2009-',
  '2007-04-05T24:50',
  '2009-000',
  '2009-M511',
  '2009M511',
  '2009-05-19T14a39r',
  '2009-05-19T14:3924',
  '2009-0519',
  '2009-05-1914:39',
  '2009-05-19 14:',
  '2009-05-19r14:39',
  '2009-05-19 14a39a22',
  '200912-01',
  '2009-05-19 14:39:22+06a00',
  '2009-05-19 146922.500',
  '2010-02-18T16.5:23.35:48',
  '2010-02-18T16:23.35:48',
  '2010-02-18T16:23.35:48.45',
  '2009-05-19 14.5.44',
  '2010-02-18T16:23.33.600',
  '2021-01-22T13:13:57.494677Z.',
  '2010-02-18T16,25:23:48,44',
] as const satisfies readonly string[];

// https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format

const expandedYearFormats = [
  '-271821-04-20T00:00:00Z', // 271822 B.C.
  '-000001-01-01T00:00:00Z', // 2 B.C.
  '+000000-01-01T00:00:00Z', // 1 B.C.
  '+000001-01-01T00:00:00Z', // 1 A.D.
  '+001970-01-01T00:00:00Z', // 1970 A.D.
  '+002009-12-15T00:00:00Z', // 2009 A.D.
  '+275760-09-13T00:00:00Z', // 275760 A.D.
] as const satisfies readonly string[];

describe(iso8601, () => {
  const baseType = iso8601();
  const baseDefault = baseType.defaultValue;

  type Iso8601Type = TypeOf<typeof baseType>;

  expectType<Iso8601Type, string>('<=');

  expectType<typeof baseType.defaultValue, Iso8601Type>('=');

  test.each(validSamples)('should accept $0', (e) => {
    expect(baseType.is(e)).toBe(true);
  });

  test.each(invalidSamples)('should reject $0', (e) => {
    expect(baseType.is(e)).toBe(false);
  });

  test.each(expandedYearFormats)(
    'currently rejects expanded year formats $0',
    (e) => {
      expect(baseType.is(e)).toBe(false);
    },
  );

  test('strict mode rejects calendar-invalid dates', () => {
    const strictType = iso8601({
      defaultValue: baseDefault,
      strict: true,
      strictSeparator: false,
    });

    expect(strictType.is('2008-02-29')).toBe(true);

    expect(strictType.is('2009-02-29')).toBe(false);
  });

  test('strictSeparator mode enforces the T delimiter', () => {
    const type = iso8601({
      defaultValue: baseDefault,
      strict: false,
      strictSeparator: true,
    });

    expect(type.is('2009-05-19T14:39:22')).toBe(true);

    expect(type.is('2009-05-19 14:39:22')).toBe(false);
  });

  test('validate yields detailed errors for invalid strings', () => {
    const result = baseType.validate('not-an-iso-date');

    expect(Result.isErr(result)).toBe(true);

    if (!Result.isErr(result)) {
      throw new Error('Expected validation failure');
    }

    assert.deepStrictEqual(result.value, [
      {
        path: [],
        actualValue: 'not-an-iso-date',
        expectedType: 'Iso8601',
        typeName: 'Iso8601',
        details: undefined,
      },
    ]);

    assert.deepStrictEqual(validationErrorsToMessages(result.value), [
      'Error: expected <Iso8601> value but <string> type value "not-an-iso-date" was passed.',
    ]);
  });

  test('fill and cast round trip valid values', () => {
    const value = '2021-01-22T13:13:57.494677Z';

    expect(baseType.fill(value)).toBe(value);

    expect(() => baseType.cast(value)).not.toThrow();
  });

  test('fill falls back to default for invalid values', () => {
    expect(baseType.fill('invalid')).toBe(baseDefault);
  });
});
