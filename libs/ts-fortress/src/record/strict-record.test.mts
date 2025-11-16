import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { record, strictRecord } from './record.mjs';

describe(strictRecord, () => {
  const userType = strictRecord({
    name: string(),
    age: number(),
  });

  type User = TypeOf<typeof userType>;

  expectType<User, Readonly<{ name: string; age: number }>>('=');

  describe('is', () => {
    test('valid data without excess properties', () => {
      const validUser = { name: 'John', age: 30 };

      expect(userType.is(validUser)).toBe(true);
    });

    test('rejects data with excess properties', () => {
      const userWithExtra = { name: 'John', age: 30, extra: 'not allowed' };

      expect(userType.is(userWithExtra)).toBe(false);
    });

    test('rejects invalid property types', () => {
      const invalidUser = { name: 'John', age: 'thirty' };

      expect(userType.is(invalidUser)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case - valid data', () => {
      const validUser = { name: 'John', age: 30 };

      const result = userType.validate(validUser);

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      expectType<typeof resultValue, User>('=');

      assert.deepStrictEqual(resultValue, {
        name: 'John',
        age: 30,
      });
    });

    test('validate returns input as-is for OK cases', () => {
      const input = { name: 'John', age: 30 };

      const result = userType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - excess properties', () => {
      const userWithExtra = { name: 'John', age: 30, extra: 'not allowed' };

      const result = userType.validate(userWithExtra);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['extra'],
          actualValue: 'not allowed',
          expectedType: '{ name: string, age: number }',
          typeName: '{ name: string, age: number }',
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

    test('falsy case - invalid property type', () => {
      const invalidUser = { name: 'John', age: 'thirty' };

      const result = userType.validate(invalidUser);

      expect(Result.isErr(result)).toBe(true);

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: ['age'],
          actualValue: 'thirty',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);
    });

    test('falsy case - missing required property', () => {
      const incompleteUser = { name: 'John' };

      const result = userType.validate(incompleteUser);

      expect(Result.isErr(result)).toBe(true);

      const resultError2 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError2, [
        {
          path: ['age'],
          actualValue: incompleteUser,
          expectedType: '{ name: string, age: number }',
          typeName: '{ name: string, age: number }',
          details: {
            kind: 'missing-key',
            key: 'age',
          },
        },
      ]);
    });
  });

  describe('comparison with regular record', () => {
    const regularRecord = record({
      name: string(),
      age: number(),
    });

    test('regular record allows excess properties', () => {
      const dataWithExtra = { name: 'John', age: 30, extra: 'allowed' };

      expect(regularRecord.is(dataWithExtra)).toBe(true);

      expect(
        strictRecord({ name: string(), age: number() }).is(dataWithExtra),
      ).toBe(false);
    });

    test('both reject invalid property types', () => {
      const invalidData = { name: 'John', age: 'thirty' };

      expect(regularRecord.is(invalidData)).toBe(false);

      expect(
        strictRecord({ name: string(), age: number() }).is(invalidData),
      ).toBe(false);
    });
  });

  describe('with custom typeName', () => {
    test('uses custom typeName in errors', () => {
      const customUserType = strictRecord(
        {
          name: string(),
          age: number(),
        },
        { typeName: 'User' },
      );

      const result = customUserType.validate({
        name: 'John',
        age: 30,
        extra: 'not allowed',
      });

      expect(Result.isErr(result)).toBe(true);

      const resultError3 = Result.unwrapErrThrow(result);

      expect(resultError3[0]?.expectedType).toBe('User');

      expect(resultError3[0]?.typeName).toBe('User');
    });
  });

  describe('default values', () => {
    test('has correct default value', () => {
      assert.deepStrictEqual(userType.defaultValue, {
        name: '',
        age: 0,
      });
    });
  });

  describe('fill', () => {
    test('fills missing properties with defaults', () => {
      const partialData = { name: 'John' };

      const result = userType.fill(partialData);

      assert.deepStrictEqual(result, {
        name: 'John',
        age: 0,
      });
    });

    test('preserves all valid properties', () => {
      const validData = { name: 'John', age: 30 };

      const result = userType.fill(validData);

      assert.deepStrictEqual(result, {
        name: 'John',
        age: 30,
      });
    });
  });
});
