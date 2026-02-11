import { Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { omit } from './omit.mjs';
import { partial } from './partial.mjs';
import { pick } from './pick.mjs';
import { record } from './record.mjs';

describe('record strict composition - simple tests', () => {
  // Base strict record type
  const strictRecord = record(
    {
      id: string(),
      name: string(),
      age: number(),
    },
    {
      excessPropertyValidation: 'error',
      excessPropertyFill: 'strip',
    },
  );

  describe('pick behavior with strict record', () => {
    test('pick inherits strict validation from base record', () => {
      const pickedType = pick(strictRecord, ['id', 'name']);

      // Test with excess property
      const dataWithExcess = {
        id: '123',
        name: 'John',
        extra: 'not allowed',
      } as const;

      const result = pickedType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result.value, [
        {
          path: ['extra'],
          actualValue: 'not allowed',
          expectedType:
            'Pick<{ id: string, name: string, age: number }, "id" | "name">',
          typeName:
            'Pick<{ id: string, name: string, age: number }, "id" | "name">',
          details: {
            kind: 'excess-key',
            key: 'extra',
          },
        },
      ]);
    });

    test('pick accepts valid data and fills missing fields', () => {
      const pickedType = pick(strictRecord, ['id', 'name']);

      const validData = { id: '123', name: 'John' } as const;

      const result = pickedType.validate(validData);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { id: '123', name: 'John' });
    });

    test('pickedType validate returns input as-is for OK cases', () => {
      const pickedType = pick(strictRecord, ['id', 'name']);

      const input = { id: '123', name: 'John' } as const;

      const result = pickedType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('omit behavior with strict record', () => {
    test('omit inherits strict validation from base record', () => {
      const omittedType = omit(strictRecord, ['age']);

      // Test with excess property
      const dataWithExcess = {
        id: '123',
        name: 'John',
        extra: 'not allowed',
      } as const;

      const result = omittedType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result.value, [
        {
          path: ['extra'],
          actualValue: 'not allowed',
          expectedType:
            'Omit<{ id: string, name: string, age: number }, "age">',
          typeName: 'Omit<{ id: string, name: string, age: number }, "age">',
          details: {
            kind: 'excess-key',
            key: 'extra',
          },
        },
      ]);
    });
  });

  describe('partial behavior with strict record', () => {
    test('partial inherits strict validation from base record', () => {
      const partialType = partial(strictRecord);

      // Test with excess property
      const dataWithExcess = { id: '123', extra: 'not allowed' } as const;

      const result = partialType.validate(dataWithExcess);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result.value, [
        {
          path: ['extra'],
          actualValue: 'not allowed',
          expectedType: 'Partial<{ id: string, name: string, age: number }>',
          typeName: 'Partial<{ id: string, name: string, age: number }>',
          details: {
            kind: 'excess-key',
            key: 'extra',
          },
        },
      ]);
    });
  });

  describe('behavior comparison: strict vs permissive', () => {
    const permissiveRecord = record({
      id: string(),
      name: string(),
      age: number(),
    }); // default excessPropertyValidation is 'strip'

    test('strict record rejects excess properties', () => {
      const data = {
        id: '123',
        name: 'John',
        age: 25,
        extra: 'not allowed',
      } as const;

      const result = strictRecord.validate(data);

      assert.isTrue(Result.isErr(result));
    });

    test('strictRecord validate returns input as-is for OK cases', () => {
      const input = { id: '123', name: 'John', age: 25 } as const;

      const result = strictRecord.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue2 = Result.unwrapThrow(result);

      expect(resultValue2).toBe(input); // ✅ same reference
    });

    test('default record strips excess properties', () => {
      const data = {
        id: '123',
        name: 'John',
        age: 25,
        extra: 'stripped',
      } as const;

      const result = permissiveRecord.validate(data);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      // In strip mode (default), excess properties are removed
      assert.deepStrictEqual(resultValue, {
        id: '123',
        name: 'John',
        age: 25,
      });
    });

    test('permissiveRecord validate strips excess properties', () => {
      const input = {
        id: '123',
        name: 'John',
        age: 25,
        extra: 'stripped',
      } as const;

      const result = permissiveRecord.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      // In strip mode, excess properties are removed
      assert.deepStrictEqual(resultValue3, {
        id: '123',
        name: 'John',
        age: 25,
      });

      expect(resultValue3).not.toBe(input); // Different reference
    });

    test('pick from strict record rejects excess properties', () => {
      const strictPicked = pick(strictRecord, ['id', 'name']);

      const data = { id: '123', name: 'John', extra: 'not allowed' } as const;

      const result = strictPicked.validate(data);

      assert.isTrue(Result.isErr(result));
    });

    test('pick from default record strips excess properties', () => {
      const permissivePicked = pick(permissiveRecord, ['id', 'name']);

      const data = { id: '123', name: 'John', extra: 'stripped' } as const;

      const result = permissivePicked.validate(data);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      // In strip mode (inherited from parent), excess properties are removed
      assert.deepStrictEqual(resultValue, {
        id: '123',
        name: 'John',
      });
    });

    test('permissivePicked validate strips excess properties', () => {
      const permissivePicked = pick(permissiveRecord, ['id', 'name']);

      const input = { id: '123', name: 'John', extra: 'stripped' } as const;

      const result = permissivePicked.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue4 = Result.unwrapThrow(result);

      // In strip mode, excess properties are removed
      assert.deepStrictEqual(resultValue4, {
        id: '123',
        name: 'John',
      });

      expect(resultValue4).not.toBe(input); // Different reference
    });
  });
});
