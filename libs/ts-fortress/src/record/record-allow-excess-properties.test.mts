import { Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { record } from './record.mjs';

describe('record allowExcessProperties option', () => {
  const strictRecord = record(
    {
      name: number(0),
      age: number(0),
    },
    { allowExcessProperties: false },
  );

  const permissiveRecord = record(
    {
      name: number(0),
      age: number(0),
    },
    { allowExcessProperties: true },
  );

  const defaultRecord = record({
    name: number(0),
    age: number(0),
  });

  test('allowExcessProperties: false - rejects excess properties', () => {
    const dataWithExcess = {
      name: 42,
      age: 25,
      extra: 'not allowed',
    };

    expect(strictRecord.is(dataWithExcess)).toBe(false);

    const result = strictRecord.validate(dataWithExcess);
    expect(Result.isErr(result)).toBe(true);

    if (Result.isErr(result)) {
      expect(result.value).toStrictEqual([
        {
          path: ['extra'],
          actualValue: 'not allowed',
          typeName: '{ name: number, age: number }',
          expectedType: '{ name: number, age: number }',
          message: 'Excess property "extra" is not allowed',
        },
      ]);

      expect(validationErrorsToMessages(result.value)).toStrictEqual([
        'Excess property "extra" is not allowed at extra',
      ]);
    }
  });

  test('allowExcessProperties: false - accepts valid data without excess properties', () => {
    const validData = {
      name: 42,
      age: 25,
    };

    expect(strictRecord.is(validData)).toBe(true);

    const result = strictRecord.validate(validData);
    expect(Result.isOk(result)).toBe(true);

    if (Result.isOk(result)) {
      expect(result.value).toStrictEqual({
        name: 42,
        age: 25,
      });
    }
  });

  test('strictRecord validate returns input as-is for OK cases', () => {
    const input = { name: 42, age: 25 };
    const result = strictRecord.validate(input);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe(input); // ✅ same reference
    }
  });

  test('allowExcessProperties: true - accepts excess properties', () => {
    const dataWithExcess = {
      name: 42,
      age: 25,
      extra: 'allowed',
    };

    expect(permissiveRecord.is(dataWithExcess)).toBe(true);

    const result = permissiveRecord.validate(dataWithExcess);
    expect(Result.isOk(result)).toBe(true);

    if (Result.isOk(result)) {
      expect(result.value).toStrictEqual({
        name: 42,
        age: 25,
        extra: 'allowed',
      });
    }
  });

  test('permissiveRecord validate returns input as-is for OK cases', () => {
    const input = { name: 42, age: 25, extra: 'allowed' };
    const result = permissiveRecord.validate(input);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe(input); // ✅ same reference
    }
  });

  test('default behavior - allows excess properties (allowExcessProperties defaults to true)', () => {
    const dataWithExcess = {
      name: 42,
      age: 25,
      extra: 'allowed by default',
    };

    expect(defaultRecord.is(dataWithExcess)).toBe(true);

    const result = defaultRecord.validate(dataWithExcess);
    expect(Result.isOk(result)).toBe(true);

    if (Result.isOk(result)) {
      expect(result.value).toStrictEqual({
        name: 42,
        age: 25,
        extra: 'allowed by default',
      });
    }
  });

  test('defaultRecord validate returns input as-is for OK cases', () => {
    const input = { name: 42, age: 25, extra: 'allowed by default' };
    const result = defaultRecord.validate(input);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe(input); // ✅ same reference
    }
  });

  test('allowExcessProperties: false - multiple excess properties', () => {
    const dataWithMultipleExcess = {
      name: 42,
      age: 25,
      extra1: 'not allowed 1',
      extra2: 'not allowed 2',
    };

    const result = strictRecord.validate(dataWithMultipleExcess);
    expect(Result.isErr(result)).toBe(true);

    if (Result.isErr(result)) {
      expect(result.value).toHaveLength(2);
      expect(result.value).toStrictEqual([
        {
          path: ['extra1'],
          actualValue: 'not allowed 1',
          typeName: '{ name: number, age: number }',
          expectedType: '{ name: number, age: number }',
          message: 'Excess property "extra1" is not allowed',
        },
        {
          path: ['extra2'],
          actualValue: 'not allowed 2',
          typeName: '{ name: number, age: number }',
          expectedType: '{ name: number, age: number }',
          message: 'Excess property "extra2" is not allowed',
        },
      ]);
    }
  });

  test('allowExcessProperties: false - combines with other validation errors', () => {
    const invalidData = {
      name: 'invalid', // should be number
      age: 25,
      extra: 'not allowed',
    };

    const result = strictRecord.validate(invalidData);
    expect(Result.isErr(result)).toBe(true);

    if (Result.isErr(result)) {
      expect(result.value).toHaveLength(2);
      // First error: invalid type for 'name'
      expect(result.value[0]).toStrictEqual({
        path: ['name'],
        actualValue: 'invalid',
        expectedType: 'number',
        typeName: 'number',
        message: undefined,
      });
      // Second error: excess property
      expect(result.value[1]).toStrictEqual({
        path: ['extra'],
        actualValue: 'not allowed',
        typeName: '{ name: number, age: number }',
        expectedType: '{ name: number, age: number }',
        message: 'Excess property "extra" is not allowed',
      });
    }
  });
});
