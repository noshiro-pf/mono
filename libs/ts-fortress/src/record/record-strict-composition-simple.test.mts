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
    { allowExcessProperties: false },
  );

  describe('pick behavior with strict record', () => {
    test('pick inherits strict validation from base record', () => {
      const pickedType = pick(strictRecord, ['id', 'name']);

      // Test with excess property
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      const result = pickedType.validate(dataWithExcess);
      assert(Result.isErr(result));

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
      const validData = { id: '123', name: 'John' };

      const result = pickedType.validate(validData);

      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { id: '123', name: 'John' });
    });

    test('pickedType validate returns input as-is for OK cases', () => {
      const pickedType = pick(strictRecord, ['id', 'name']);
      const input = { id: '123', name: 'John' };
      const result = pickedType.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('omit behavior with strict record', () => {
    test('omit inherits strict validation from base record', () => {
      const omittedType = omit(strictRecord, ['age']);

      // Test with excess property
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      const result = omittedType.validate(dataWithExcess);
      assert(Result.isErr(result));

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
      const dataWithExcess = { id: '123', extra: 'not allowed' };

      const result = partialType.validate(dataWithExcess);
      assert(Result.isErr(result));

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
    }); // allowExcessProperties defaults to true

    test('strict record rejects excess properties', () => {
      const data = { id: '123', name: 'John', age: 25, extra: 'not allowed' };

      const result = strictRecord.validate(data);

      expect(Result.isErr(result)).toBe(true);
    });

    test('strictRecord validate returns input as-is for OK cases', () => {
      const input = { id: '123', name: 'John', age: 25 };
      const result = strictRecord.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue2 = Result.unwrapThrow(result);

      expect(resultValue2).toBe(input); // ✅ same reference
    });

    test('permissive record accepts excess properties', () => {
      const data = { id: '123', name: 'John', age: 25, extra: 'allowed' };

      const result = permissiveRecord.validate(data);

      expect(Result.isOk(result)).toBe(true);
    });

    test('permissiveRecord validate returns input as-is for OK cases', () => {
      const input = { id: '123', name: 'John', age: 25, extra: 'allowed' };
      const result = permissiveRecord.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue3 = Result.unwrapThrow(result);

      expect(resultValue3).toBe(input); // ✅ same reference
    });

    test('pick from strict record rejects excess properties', () => {
      const strictPicked = pick(strictRecord, ['id', 'name']);
      const data = { id: '123', name: 'John', extra: 'not allowed' };

      const result = strictPicked.validate(data);

      expect(Result.isErr(result)).toBe(true);
    });

    test('pick from permissive record accepts excess properties', () => {
      const permissivePicked = pick(permissiveRecord, ['id', 'name']);
      const data = { id: '123', name: 'John', extra: 'allowed' };

      const result = permissivePicked.validate(data);

      expect(Result.isOk(result)).toBe(true);
    });

    test('permissivePicked validate returns input as-is for OK cases', () => {
      const permissivePicked = pick(permissiveRecord, ['id', 'name']);
      const input = { id: '123', name: 'John', extra: 'allowed' };
      const result = permissivePicked.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue4 = Result.unwrapThrow(result);

      expect(resultValue4).toBe(input); // ✅ same reference
    });
  });
});
