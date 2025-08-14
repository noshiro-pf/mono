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
      id: string(''),
      name: string(''),
      age: number(0),
    },
    { allowExcessProperties: false },
  );

  describe('pick behavior with strict record', () => {
    test('pick inherits strict validation from base record', () => {
      const pickedType = pick(strictRecord, ['id', 'name']);

      // Test with excess property
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      const result = pickedType.validate(dataWithExcess);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const excessError = result.value.find(
          (error) =>
            error.message?.includes(
              'Excess property "extra" is not allowed',
            ) === true,
        );
        expect(excessError).toBeDefined();
      }
    });

    test('pick accepts valid data and fills missing fields', () => {
      const pickedType = pick(strictRecord, ['id', 'name']);
      const validData = { id: '123', name: 'John' };

      const result = pickedType.validate(validData);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toStrictEqual({ id: '123', name: 'John' });
      }
    });
  });

  describe('omit behavior with strict record', () => {
    test('omit inherits strict validation from base record', () => {
      const omittedType = omit(strictRecord, ['age']);

      // Test with excess property
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      const result = omittedType.validate(dataWithExcess);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const excessError = result.value.find(
          (error) =>
            error.message?.includes(
              'Excess property "extra" is not allowed',
            ) === true,
        );
        expect(excessError).toBeDefined();
      }
    });
  });

  describe('partial behavior with strict record', () => {
    test('partial inherits strict validation from base record', () => {
      const partialType = partial(strictRecord);

      // Test with excess property
      const dataWithExcess = { id: '123', extra: 'not allowed' };

      const result = partialType.validate(dataWithExcess);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const excessError = result.value.find(
          (error) =>
            error.message?.includes(
              'Excess property "extra" is not allowed',
            ) === true,
        );
        expect(excessError).toBeDefined();
      }
    });
  });

  describe('behavior comparison: strict vs permissive', () => {
    const permissiveRecord = record({
      id: string(''),
      name: string(''),
      age: number(0),
    }); // allowExcessProperties defaults to true

    test('strict record rejects excess properties', () => {
      const data = { id: '123', name: 'John', age: 25, extra: 'not allowed' };

      const result = strictRecord.validate(data);
      expect(Result.isErr(result)).toBe(true);
    });

    test('permissive record accepts excess properties', () => {
      const data = { id: '123', name: 'John', age: 25, extra: 'allowed' };

      const result = permissiveRecord.validate(data);
      expect(Result.isOk(result)).toBe(true);
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
  });
});
