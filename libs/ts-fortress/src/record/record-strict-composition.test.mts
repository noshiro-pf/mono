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

      assert.isTrue(pickedType.is(validData));

      const result = pickedType.validate(validData);

      assert.isTrue(Result.isOk(result));

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

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      assert.isFalse(pickedType.is(dataWithExcess));

      const result = pickedType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

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

      assert.isTrue(Result.isErr(result));

      const resultError1 = Result.unwrapErrThrow(result);

      expect(resultError1).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
        'Error at name: missing required key "name".',
      ]);
    });
  });

  describe('omit with strict record', () => {
    const omittedType = omit(strictBaseRecord, ['age', 'email']);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      assert.isTrue(omittedType.is(validData));

      const result = omittedType.validate(validData);

      assert.isTrue(Result.isOk(result));

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

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      expect(resultValue3).toBe(input); // ✅ same reference
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      assert.isFalse(omittedType.is(dataWithExcess));

      const result = omittedType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

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

      assert.isTrue(Result.isErr(result)); // omit rejects excess properties

      const resultError3 = Result.unwrapErrThrow(result);

      expect(resultError3).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError3), [
        'Error at age: excess property "age" is not allowed.',
      ]);
    });
  });

  describe('partial with strict record', () => {
    const partialType = partial(strictBaseRecord);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      assert.isTrue(partialType.is(validData));

      const result = partialType.validate(validData);

      assert.isTrue(Result.isOk(result));

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

      assert.isTrue(Result.isOk(result));

      const resultValue5 = Result.unwrapThrow(result);

      expect(resultValue5).toBe(input); // ✅ same reference
    });

    test('accepts empty object (all fields optional)', () => {
      const emptyData = {};

      assert.isTrue(partialType.is(emptyData));

      const result = partialType.validate(emptyData);

      assert.isTrue(Result.isOk(result));

      const resultValue6 = Result.unwrapThrow(result);

      // partial with empty object returns empty object

      assert.deepStrictEqual(resultValue6, {});
    });

    test('partialType validate returns input as-is for empty object', () => {
      const input = {};

      const result = partialType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue7 = Result.unwrapThrow(result);

      expect(resultValue7).toBe(input); // ✅ same reference
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      assert.isFalse(partialType.is(dataWithExcess));

      const result = partialType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

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

      assert.isTrue(partiallyPartialType.is(validData));

      const result = partiallyPartialType.validate(validData);

      assert.isTrue(Result.isOk(result));

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

      assert.isTrue(Result.isOk(result));

      const resultValue9 = Result.unwrapThrow(result);

      expect(resultValue9).toBe(input); // ✅ same reference
    });

    test('partially partial rejects missing required fields', () => {
      const partiallyPartialType = partial(strictBaseRecord, {
        keysToBeOptional: ['age', 'email'],
      });

      const incompleteData = { id: '123' }; // missing required 'name'

      const result = partiallyPartialType.validate(incompleteData);

      assert.isTrue(Result.isErr(result));

      const resultError5 = Result.unwrapErrThrow(result);

      expect(resultError5).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError5), [
        'Error at name: missing required key "name".',
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

      assert.isFalse(mergedType.is(validData));

      const result = mergedType.validate(validData);

      assert.isTrue(Result.isErr(result));

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

      assert.isFalse(mergedType.is(dataWithExcess));

      const result = mergedType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

      const resultError7 = Result.unwrapErrThrow(result);

      // Both records should reject the excess property

      expect(resultError7.length).toBeGreaterThanOrEqual(1);

      const resultError7Messages = validationErrorsToMessages(resultError7);

      const excessErrors = resultError7Messages.filter((message) =>
        message.includes('excess property "extra" is not allowed.'),
      );

      expect(excessErrors.length).toBeGreaterThanOrEqual(1);
    });

    test('rejects missing required properties from any merged record', () => {
      const incompleteData = { id: '123', name: 'John', age: 25 }; // missing 'email'

      const result = mergedType.validate(incompleteData);

      assert.isTrue(Result.isErr(result));

      const resultError8 = Result.unwrapErrThrow(result);

      const resultError8Messages = validationErrorsToMessages(resultError8);

      assert.isTrue(
        resultError8Messages.some((message) =>
          message.includes('missing required key "email".'),
        ),
      );
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

      assert.isTrue(Result.isErr(result)); // Strict record rejects excess property

      const resultError9 = Result.unwrapErrThrow(result);

      const resultError9Messages = validationErrorsToMessages(resultError9);

      const excessErrors = resultError9Messages.filter((message) =>
        message.includes('excess property "extra" is not allowed.'),
      );

      expect(excessErrors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('nested strict compositions', () => {
    test('pick of partial of strict record', () => {
      const partialType = partial(strictBaseRecord);

      const pickedPartialType = pick(partialType, ['id', 'name']);

      const validData = { id: '123', name: 'John' };

      assert.isTrue(pickedPartialType.is(validData));

      const result = pickedPartialType.validate(validData);

      assert.isTrue(Result.isOk(result));

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

      assert.isTrue(Result.isOk(result));

      const resultValue11 = Result.unwrapThrow(result);

      expect(resultValue11).toBe(input); // ✅ same reference
    });

    test('partial of pick of strict record', () => {
      const pickedType = pick(strictBaseRecord, ['id', 'name']);

      const partialPickedType = partial(pickedType);

      const validData = { id: '123' }; // partial allows missing 'name'

      assert.isTrue(partialPickedType.is(validData));

      const result = partialPickedType.validate(validData);

      assert.isTrue(Result.isOk(result));

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

      assert.isTrue(Result.isOk(result));

      const resultValue13 = Result.unwrapThrow(result);

      expect(resultValue13).toBe(input); // ✅ same reference
    });

    test('nested compositions reject excess properties', () => {
      const partialType = partial(strictBaseRecord);

      const pickedPartialType = pick(partialType, ['id', 'name']);

      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      assert.isFalse(pickedPartialType.is(dataWithExcess));

      const result = pickedPartialType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

      const resultError10 = Result.unwrapErrThrow(result);

      expect(resultError10).toHaveLength(1);

      assert.deepStrictEqual(validationErrorsToMessages(resultError10), [
        'Error at extra: excess property "extra" is not allowed.',
      ]);
    });
  });
});
