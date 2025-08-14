import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../validation-error.mjs';
import { record, strictRecord } from './record.mjs';

describe('strictRecord', () => {
  const userType = strictRecord({
    name: string(''),
    age: number(0),
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

      if (Result.isOk(result)) {
        expectType<typeof result.value, User>('=');
        expect(result.value).toStrictEqual({
          name: 'John',
          age: 30,
        });
      }
    });

    test('falsy case - excess properties', () => {
      const userWithExtra = { name: 'John', age: 30, extra: 'not allowed' };

      const result = userType.validate(userWithExtra);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: ['extra'],
            actualValue: 'not allowed',
            expectedType: '{ name: string, age: number }',
            typeName: '{ name: string, age: number }',
            message: 'Excess property "extra" is not allowed',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Excess property "extra" is not allowed at extra',
        ]);
      }
    });

    test('falsy case - invalid property type', () => {
      const invalidUser = { name: 'John', age: 'thirty' };

      const result = userType.validate(invalidUser);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: ['age'],
            actualValue: 'thirty',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
        ]);
      }
    });

    test('falsy case - missing required property', () => {
      const incompleteUser = { name: 'John' };

      const result = userType.validate(incompleteUser);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: ['age'],
            actualValue: incompleteUser,
            expectedType: '{ name: string, age: number }',
            typeName: '{ name: string, age: number }',
            message: 'Missing required key "age"',
          },
        ]);
      }
    });
  });

  describe('comparison with regular record', () => {
    const regularRecord = record({
      name: string(''),
      age: number(0),
    });

    test('regular record allows excess properties', () => {
      const dataWithExtra = { name: 'John', age: 30, extra: 'allowed' };

      expect(regularRecord.is(dataWithExtra)).toBe(true);
      expect(
        strictRecord({ name: string(''), age: number(0) }).is(dataWithExtra),
      ).toBe(false);
    });

    test('both reject invalid property types', () => {
      const invalidData = { name: 'John', age: 'thirty' };

      expect(regularRecord.is(invalidData)).toBe(false);
      expect(
        strictRecord({ name: string(''), age: number(0) }).is(invalidData),
      ).toBe(false);
    });
  });

  describe('with custom typeName', () => {
    test('uses custom typeName in errors', () => {
      const customUserType = strictRecord(
        {
          name: string(''),
          age: number(0),
        },
        { typeName: 'User' },
      );

      const result = customUserType.validate({
        name: 'John',
        age: 30,
        extra: 'not allowed',
      });
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value[0]?.expectedType).toBe('User');
        expect(result.value[0]?.typeName).toBe('User');
      }
    });
  });

  describe('default values', () => {
    test('has correct default value', () => {
      expect(userType.defaultValue).toStrictEqual({
        name: '',
        age: 0,
      });
    });
  });

  describe('fill', () => {
    test('fills missing properties with defaults', () => {
      const partialData = { name: 'John' };

      const result = userType.fill(partialData);
      expect(result).toStrictEqual({
        name: 'John',
        age: 0,
      });
    });

    test('preserves all valid properties', () => {
      const validData = { name: 'John', age: 30 };

      const result = userType.fill(validData);
      expect(result).toStrictEqual({
        name: 'John',
        age: 30,
      });
    });
  });
});
