import { Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { record } from './record.mjs';

describe('record allowExcessProperties option', () => {
  const strictRecord = record(
    {
      name: number(),
      age: number(),
    },
    {
      excessPropertyValidation: 'error',
      excessPropertyFill: 'strip',
    },
  );

  const permissiveRecord = record(
    {
      name: number(),
      age: number(),
    },
    {
      excessPropertyValidation: 'allow',
      excessPropertyFill: 'allow',
    },
  );

  const defaultRecord = record({
    name: number(),
    age: number(),
  });

  const stripRecord = record(
    {
      name: number(),
      age: number(),
    },
    {
      excessPropertyValidation: 'strip',
      excessPropertyFill: 'strip',
    },
  );

  test("excessPropertyValidation: 'error' - rejects excess properties", () => {
    const dataWithExcess = {
      name: 42,
      age: 25,
      extra: 'not allowed',
    } as const;

    assert.isFalse(strictRecord.is(dataWithExcess));

    const result = strictRecord.validate(dataWithExcess);

    assert.isTrue(Result.isErr(result));

    const resultError = Result.unwrapErrThrow(result);

    assert.deepStrictEqual(resultError, [
      {
        path: ['extra'],
        actualValue: 'not allowed',
        typeName: '{ name: number, age: number }',
        expectedType: '{ name: number, age: number }',
        details: {
          kind: 'excess-key',
          key: 'extra',
        },
      },
    ]);

    assert.deepStrictEqual(validationErrorsToMessages(resultError), [
      'Error at extra: excess property "extra" is not allowed.',
    ]);
  });

  test("excessPropertyValidation: 'error' - accepts valid data without excess properties", () => {
    const validData = {
      name: 42,
      age: 25,
    } as const;

    assert.isTrue(strictRecord.is(validData));

    const result = strictRecord.validate(validData);

    assert.isTrue(Result.isOk(result));

    const resultValue = Result.unwrapThrow(result);

    assert.deepStrictEqual(resultValue, {
      name: 42,
      age: 25,
    });
  });

  test('strictRecord validate returns input as-is for OK cases', () => {
    const input = { name: 42, age: 25 } as const;

    const result = strictRecord.validate(input);

    assert.isTrue(Result.isOk(result));

    const resultValue1 = Result.unwrapThrow(result);

    expect(resultValue1).toBe(input); // ✅ same reference
  });

  test("excessPropertyValidation: 'allow' - accepts excess properties", () => {
    const dataWithExcess = {
      name: 42,
      age: 25,
      extra: 'allowed',
    } as const;

    assert.isTrue(permissiveRecord.is(dataWithExcess));

    const result = permissiveRecord.validate(dataWithExcess);

    assert.isTrue(Result.isOk(result));

    const resultValue2 = Result.unwrapThrow(result);

    // In allow mode, excess properties are kept
    assert.deepStrictEqual(resultValue2, {
      name: 42,
      age: 25,
      extra: 'allowed',
    });
  });

  test('permissiveRecord validate returns input as-is for OK cases', () => {
    const input = { name: 42, age: 25, extra: 'allowed' } as const;

    const result = permissiveRecord.validate(input);

    assert.isTrue(Result.isOk(result));

    const resultValue3 = Result.unwrapThrow(result);

    expect(resultValue3).toBe(input); // ✅ same reference
  });

  test('default behavior - strips excess properties (excessPropertyValidation defaults to strip)', () => {
    const dataWithExcess = {
      name: 42,
      age: 25,
      extra: 'stripped by default',
    } as const;

    assert.isTrue(defaultRecord.is(dataWithExcess));

    const result = defaultRecord.validate(dataWithExcess);

    assert.isTrue(Result.isOk(result));

    const resultValue4 = Result.unwrapThrow(result);

    // Default mode is strip, so excess properties are removed
    assert.deepStrictEqual(resultValue4, {
      name: 42,
      age: 25,
    });
  });

  test('defaultRecord validate returns stripped content for OK cases', () => {
    const input = { name: 42, age: 25, extra: 'stripped by default' } as const;

    const result = defaultRecord.validate(input);

    assert.isTrue(Result.isOk(result));

    const resultValue5 = Result.unwrapThrow(result);

    // Default mode is strip, so excess property is removed
    assert.deepStrictEqual(resultValue5, {
      name: 42,
      age: 25,
    });

    expect(resultValue5).not.toBe(input); // Different reference
  });

  test("excessPropertyValidation: 'strip' - strips excess properties", () => {
    const dataWithExcess = {
      name: 42,
      age: 25,
      extra: 'stripped',
    } as const;

    const result = stripRecord.validate(dataWithExcess);

    assert.isTrue(Result.isOk(result));

    const resultValue = Result.unwrapThrow(result);

    assert.deepStrictEqual(resultValue, {
      name: 42,
      age: 25,
    });
  });

  test("excessPropertyValidation: 'error' - multiple excess properties", () => {
    const dataWithMultipleExcess = {
      name: 42,
      age: 25,
      extra1: 'not allowed 1',
      extra2: 'not allowed 2',
    } as const;

    const result = strictRecord.validate(dataWithMultipleExcess);

    assert.isTrue(Result.isErr(result));

    const resultError1 = Result.unwrapErrThrow(result);

    expect(resultError1).toHaveLength(2);

    assert.deepStrictEqual(resultError1, [
      {
        path: ['extra1'],
        actualValue: 'not allowed 1',
        typeName: '{ name: number, age: number }',
        expectedType: '{ name: number, age: number }',
        details: {
          kind: 'excess-key',
          key: 'extra1',
        },
      },
      {
        path: ['extra2'],
        actualValue: 'not allowed 2',
        typeName: '{ name: number, age: number }',
        expectedType: '{ name: number, age: number }',
        details: {
          kind: 'excess-key',
          key: 'extra2',
        },
      },
    ]);
  });

  test("excessPropertyValidation: 'error' - combines with other validation errors", () => {
    const invalidData = {
      name: 'invalid', // should be number
      age: 25,
      extra: 'not allowed',
    } as const;

    const result = strictRecord.validate(invalidData);

    assert.isTrue(Result.isErr(result));

    const resultError2 = Result.unwrapErrThrow(result);

    expect(resultError2).toHaveLength(2);

    // First error: invalid type for 'name'

    assert.deepStrictEqual(resultError2[0], {
      path: ['name'],
      actualValue: 'invalid',
      expectedType: 'number',
      typeName: 'number',
      details: undefined,
    });
    // Second error: excess property

    assert.deepStrictEqual(resultError2[1], {
      path: ['extra'],
      actualValue: 'not allowed',
      typeName: '{ name: number, age: number }',
      expectedType: '{ name: number, age: number }',
      details: {
        kind: 'excess-key',
        key: 'extra',
      },
    });
  });
});
