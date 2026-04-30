import { Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { record } from './record.mjs';

describe('record allowExcessProperties option', () => {
  const noop = (..._args: readonly unknown[]): void => {};

  const strictRecord = record(
    {
      name: number(),
      age: number(),
    },
    {
      excessProperty: 'reject',
    },
  );

  const permissiveRecord = record(
    {
      name: number(),
      age: number(),
    },
    {
      excessProperty: 'allow',
    },
  );

  const defaultRecord = record({
    name: number(),
    age: number(),
  });

  const stripRecord = record({
    name: number(),
    age: number(),
  });

  test("excessProperty: 'reject' - rejects excess properties", () => {
    const dataWithExcess: unknown = {
      name: 42,
      age: 25,
      extra: 'not allowed',
    } as const;

    assert.isFalse(strictRecord.is(dataWithExcess));

    if (strictRecord.is(dataWithExcess)) {
      // @ts-expect-error cannot access excess properties in strict mode
      // eslint-disable-next-line @typescript-eslint/dot-notation
      noop(dataWithExcess['someKey']); // 🚫 cannot access excess properties
    }

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

  test("excessProperty: 'reject' - accepts valid data without excess properties", () => {
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

  test("excessProperty: 'allow' - accepts excess properties", () => {
    const dataWithExcess: unknown = {
      name: 42,
      age: 25,
      extra: 'allowed',
    } as const;

    assert.isTrue(permissiveRecord.is(dataWithExcess));

    if (permissiveRecord.is(dataWithExcess)) {
      noop((dataWithExcess as UnknownRecord)['someKey']); // ✅ can access excess properties via cast
    }

    const result = permissiveRecord.validate(dataWithExcess);

    assert.isTrue(Result.isOk(result));

    const resultValue2 = Result.unwrapThrow(result);

    // In allow mode, excess properties are kept
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    assert.deepStrictEqual(resultValue2 as UnknownRecord, {
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

  test('default behavior - allows excess properties (excessProperty defaults to "allow")', () => {
    const dataWithExcess: unknown = {
      name: 42,
      age: 25,
      extra: 'kept by default',
    } as const;

    assert.isTrue(defaultRecord.is(dataWithExcess));

    if (defaultRecord.is(dataWithExcess)) {
      noop((dataWithExcess as UnknownRecord)['someKey']); // ✅ can access excess properties via cast
    }

    const result = defaultRecord.validate(dataWithExcess);

    assert.isTrue(Result.isOk(result));

    const resultValue4 = Result.unwrapThrow(result);

    // Default mode is allow, so excess properties are kept
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    assert.deepStrictEqual(resultValue4 as UnknownRecord, {
      name: 42,
      age: 25,
      extra: 'kept by default',
    });
  });

  test('defaultRecord validate returns input as-is for OK cases', () => {
    const input = { name: 42, age: 25, extra: 'kept by default' } as const;

    const result = defaultRecord.validate(input);

    assert.isTrue(Result.isOk(result));

    const resultValue5 = Result.unwrapThrow(result);

    // Default mode is allow, so excess property is kept
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    assert.deepStrictEqual(resultValue5 as UnknownRecord, {
      name: 42,
      age: 25,
      extra: 'kept by default',
    });

    expect(resultValue5).toBe(input); // ✅ same reference
  });

  test('default excessProperty - allows excess properties', () => {
    const dataWithExcess: unknown = {
      name: 42,
      age: 25,
      extra: 'kept',
    } as const;

    const result = stripRecord.validate(dataWithExcess);

    assert.isTrue(Result.isOk(result));

    if (stripRecord.is(dataWithExcess)) {
      noop((dataWithExcess as UnknownRecord)['someKey']); // ✅ can access excess properties via cast
    }

    const resultValue = Result.unwrapThrow(result);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    assert.deepStrictEqual(resultValue as UnknownRecord, {
      name: 42,
      age: 25,
      extra: 'kept',
    });
  });

  test("excessProperty: 'reject' - multiple excess properties", () => {
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

  test("excessProperty: 'reject' - combines with other validation errors", () => {
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
