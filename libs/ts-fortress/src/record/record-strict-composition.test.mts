import { Result } from 'ts-data-forge';
import { mergeRecords } from '../compose/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { omit } from './omit.mjs';
import { partial } from './partial.mjs';
import { pick } from './pick.mjs';
import { record } from './record.mjs';

describe('record strict composition tests', () => {
  // Base strict record type
  const strictBaseRecord = record(
    {
      id: string(),
      name: string(),
      age: number(),
      email: string(),
    },
    {
      excessPropertyValidation: 'error',
      excessPropertyFill: 'strip',
    },
  );

  describe('pick with strict record', () => {
    const pickedType = pick(strictBaseRecord, ['id', 'name']);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      expect(pickedType.is(validData)).toBe(true);

      const result = pickedType.validate(validData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      // pick validates by calling the original record's validate with filled data
      // so it includes all original fields with defaults

      assert.deepStrictEqual(resultValue, {
        id: '123',
        name: 'John',
      });
    });

    test('pickedType validate returns input as-is for OK cases', () => {
      const input = { id: '123', name: 'John' };
      const result = pickedType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(pickedType.is(dataWithExcess)).toBe(false);

      const result = pickedType.validate(dataWithExcess);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      expect(resultError).toHaveLength(1);

      assert.deepStrictEqual(resultError[0], {
        path: ['extra'],
        actualValue: 'not allowed',
        typeName:
          'Pick<{ id: string, name: string, age: number, email: string }, "id" | "name">',
        expectedType:
          'Pick<{ id: string, name: string, age: number, email: string }, "id" | "name">',
        details: {
          kind: 'excess-key',
          key: 'extra',
        },
      });
    });

    test('rejects missing required properties', () => {
      const incompleteData = { id: '123' }; // missing 'name'

      const result = pickedType.validate(incompleteData);

      expect(Result.isErr(result)).toBe(true);

      const resultError1 = Result.unwrapErrThrow(result);

      expect(resultError1).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
        'Missing required key "name" at name',
      ]);
    });
  });

  describe('omit with strict record', () => {
    const omittedType = omit(strictBaseRecord, ['age', 'email']);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      expect(omittedType.is(validData)).toBe(true);

      const result = omittedType.validate(validData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue2 = Result.unwrapThrow(result);

      // omit validates by calling the original record's validate with filled data
      // so it includes all original fields with defaults

      assert.deepStrictEqual(resultValue2, {
        id: '123',
        name: 'John',
      });
    });

    test('omittedType validate returns input as-is for OK cases', () => {
      const input = { id: '123', name: 'John' };
      const result = omittedType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue3 = Result.unwrapThrow(result);

      expect(resultValue3).toBe(input); // ✅ same reference
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(omittedType.is(dataWithExcess)).toBe(false);

      const result = omittedType.validate(dataWithExcess);

      expect(Result.isErr(result)).toBe(true);

      const resultError2 = Result.unwrapErrThrow(result);

      expect(resultError2).toHaveLength(1);

      assert.deepStrictEqual(resultError2[0], {
        path: ['extra'],
        actualValue: 'not allowed',
        typeName:
          'Omit<{ id: string, name: string, age: number, email: string }, "age" | "email">',
        expectedType:
          'Omit<{ id: string, name: string, age: number, email: string }, "age" | "email">',
        details: {
          kind: 'excess-key',
          key: 'extra',
        },
      });
    });

    test('rejects omitted properties when provided (inherits strictness from base record)', () => {
      const dataWithOmittedProperty = { id: '123', name: 'John', age: 25 }; // 'age' was omitted but provided

      const result = omittedType.validate(dataWithOmittedProperty);

      expect(Result.isErr(result)).toBe(true); // omit rejects excess properties

      const resultError3 = Result.unwrapErrThrow(result);

      expect(resultError3).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError3), [
        'Excess property "age" is not allowed at age',
      ]);
    });
  });

  describe('partial with strict record', () => {
    const partialType = partial(strictBaseRecord);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      expect(partialType.is(validData)).toBe(true);

      const result = partialType.validate(validData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue4 = Result.unwrapThrow(result);

      // partial now only returns the provided fields

      assert.deepStrictEqual(resultValue4, {
        id: '123',
        name: 'John',
      });
    });

    test('partialType validate returns input as-is for OK cases', () => {
      const input = { id: '123', name: 'John' };
      const result = partialType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue5 = Result.unwrapThrow(result);

      expect(resultValue5).toBe(input); // ✅ same reference
    });

    test('accepts empty object (all fields optional)', () => {
      const emptyData = {};

      expect(partialType.is(emptyData)).toBe(true);

      const result = partialType.validate(emptyData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue6 = Result.unwrapThrow(result);

      // partial with empty object returns empty object

      assert.deepStrictEqual(resultValue6, {});
    });

    test('partialType validate returns input as-is for empty object', () => {
      const input = {};
      const result = partialType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue7 = Result.unwrapThrow(result);

      expect(resultValue7).toBe(input); // ✅ same reference
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(partialType.is(dataWithExcess)).toBe(false);

      const result = partialType.validate(dataWithExcess);

      expect(Result.isErr(result)).toBe(true);

      const resultError4 = Result.unwrapErrThrow(result);

      expect(resultError4).toHaveLength(1);

      assert.deepStrictEqual(resultError4[0], {
        path: ['extra'],
        actualValue: 'not allowed',
        typeName:
          'Partial<{ id: string, name: string, age: number, email: string }>',
        expectedType:
          'Partial<{ id: string, name: string, age: number, email: string }>',
        details: {
          kind: 'excess-key',
          key: 'extra',
        },
      });
    });

    test('partially partial with specific keys', () => {
      const partiallyPartialType = partial(strictBaseRecord, {
        keysToBeOptional: ['age', 'email'],
      });

      const validData = { id: '123', name: 'John' }; // required fields provided, optional fields omitted

      expect(partiallyPartialType.is(validData)).toBe(true);

      const result = partiallyPartialType.validate(validData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue8 = Result.unwrapThrow(result);

      // partially partial now only returns the provided fields

      assert.deepStrictEqual(resultValue8, {
        id: '123',
        name: 'John',
      });
    });

    test('partiallyPartialType validate returns input as-is for OK cases', () => {
      const partiallyPartialType = partial(strictBaseRecord, {
        keysToBeOptional: ['age', 'email'],
      });
      const input = { id: '123', name: 'John' };
      const result = partiallyPartialType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue9 = Result.unwrapThrow(result);

      expect(resultValue9).toBe(input); // ✅ same reference
    });

    test('partially partial rejects missing required fields', () => {
      const partiallyPartialType = partial(strictBaseRecord, {
        keysToBeOptional: ['age', 'email'],
      });

      const incompleteData = { id: '123' }; // missing required 'name'

      const result = partiallyPartialType.validate(incompleteData);

      expect(Result.isErr(result)).toBe(true);

      const resultError5 = Result.unwrapErrThrow(result);

      expect(resultError5).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError5), [
        'Missing required key "name" at name',
      ]);
    });
  });

  describe('mergeRecords with strict records', () => {
    const strictRecord1 = record(
      {
        id: string(),
        name: string(),
      },
      {
        excessPropertyValidation: 'error',
        excessPropertyFill: 'strip',
      },
    );

    const strictRecord2 = record(
      {
        age: number(),
        email: string(),
      },
      {
        excessPropertyValidation: 'error',
        excessPropertyFill: 'strip',
      },
    );

    const mergedType = mergeRecords([strictRecord1, strictRecord2]);

    test('rejects valid data when both records cannot validate it (mergeRecords validates against each type separately)', () => {
      const validData = {
        id: '123',
        name: 'John',
        age: 25,
        email: 'john@example.com',
      };

      // mergeRecords validates against each record separately
      // strictRecord1 will reject because it doesn't know about age/email
      // strictRecord2 will reject because it doesn't know about id/name

      expect(mergedType.is(validData)).toBe(false);

      const result = mergedType.validate(validData);

      expect(Result.isErr(result)).toBe(true);

      const resultError6 = Result.unwrapErrThrow(result);

      // Both records should produce errors for unknown fields

      expect(resultError6.length).toBeGreaterThan(0);
    });

    test('rejects data with excess properties (both records are strict)', () => {
      const dataWithExcess = {
        id: '123',
        name: 'John',
        age: 25,
        email: 'john@example.com',
        extra: 'not allowed',
      };

      expect(mergedType.is(dataWithExcess)).toBe(false);

      const result = mergedType.validate(dataWithExcess);

      expect(Result.isErr(result)).toBe(true);

      const resultError7 = Result.unwrapErrThrow(result);

      // Both records should reject the excess property

      expect(resultError7.length).toBeGreaterThanOrEqual(1);

      const resultError7Messages = validationErrorsToMessages(resultError7);
      const excessErrors = resultError7Messages.filter((message) =>
        message.includes('Excess property "extra" is not allowed'),
      );

      expect(excessErrors.length).toBeGreaterThanOrEqual(1);
    });

    test('rejects missing required properties from any merged record', () => {
      const incompleteData = { id: '123', name: 'John', age: 25 }; // missing 'email'

      const result = mergedType.validate(incompleteData);

      expect(Result.isErr(result)).toBe(true);

      const resultError8 = Result.unwrapErrThrow(result);
      const resultError8Messages = validationErrorsToMessages(resultError8);

      expect(
        resultError8Messages.some((message) =>
          message.includes('Missing required key "email"'),
        ),
      ).toBe(true);
    });

    test('mixed strict and permissive records', () => {
      const permissiveRecord = record({
        status: string(),
        metadata: string(),
      }); // allowExcessProperties defaults to true

      const mixedMergedType = mergeRecords([strictRecord1, permissiveRecord]);

      const dataWithExcess = {
        id: '123',
        name: 'John',
        status: 'active',
        metadata: 'some data',
        extra: 'allowed by permissive record',
      };

      const result = mixedMergedType.validate(dataWithExcess);

      // Since one record is permissive, the merged type should accept excess properties
      // But this depends on implementation - in ts-fortress, each record validates independently
      // The strict record will reject, the permissive record will accept

      expect(Result.isErr(result)).toBe(true); // Strict record rejects excess property

      const resultError9 = Result.unwrapErrThrow(result);
      const resultError9Messages = validationErrorsToMessages(resultError9);
      const excessErrors = resultError9Messages.filter((message) =>
        message.includes('Excess property "extra" is not allowed'),
      );

      expect(excessErrors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('nested strict compositions', () => {
    test('pick of partial of strict record', () => {
      const partialType = partial(strictBaseRecord);
      const pickedPartialType = pick(partialType, ['id', 'name']);

      const validData = { id: '123', name: 'John' };

      expect(pickedPartialType.is(validData)).toBe(true);

      const result = pickedPartialType.validate(validData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue10 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue10, {
        id: '123',
        name: 'John',
      });
    });

    test('pickedPartialType validate returns input as-is for OK cases', () => {
      const partialType = partial(strictBaseRecord);
      const pickedPartialType = pick(partialType, ['id', 'name']);
      const input = { id: '123', name: 'John' };
      const result = pickedPartialType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue11 = Result.unwrapThrow(result);

      expect(resultValue11).toBe(input); // ✅ same reference
    });

    test('partial of pick of strict record', () => {
      const pickedType = pick(strictBaseRecord, ['id', 'name']);
      const partialPickedType = partial(pickedType);

      const validData = { id: '123' }; // partial allows missing 'name'

      expect(partialPickedType.is(validData)).toBe(true);

      const result = partialPickedType.validate(validData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue12 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue12, {
        id: '123',
      });
    });

    test('partialPickedType validate returns input as-is for OK cases', () => {
      const pickedType = pick(strictBaseRecord, ['id', 'name']);
      const partialPickedType = partial(pickedType);
      const input = { id: '123' };
      const result = partialPickedType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue13 = Result.unwrapThrow(result);

      expect(resultValue13).toBe(input); // ✅ same reference
    });

    test('nested compositions reject excess properties', () => {
      const partialType = partial(strictBaseRecord);
      const pickedPartialType = pick(partialType, ['id', 'name']);

      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(pickedPartialType.is(dataWithExcess)).toBe(false);

      const result = pickedPartialType.validate(dataWithExcess);

      expect(Result.isErr(result)).toBe(true);

      const resultError10 = Result.unwrapErrThrow(result);

      expect(resultError10).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError10), [
        'Excess property "extra" is not allowed at extra',
      ]);
    });
  });
});
