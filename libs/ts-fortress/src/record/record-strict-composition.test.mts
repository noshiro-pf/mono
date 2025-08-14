import { Result } from 'ts-data-forge';
import { mergeRecords } from '../compose/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { omit } from './omit.mjs';
import { partial } from './partial.mjs';
import { pick } from './pick.mjs';
import { record } from './record.mjs';

describe('record strict composition tests', () => {
  // Base strict record type
  const strictBaseRecord = record(
    {
      id: string(''),
      name: string(''),
      age: number(0),
      email: string(''),
    },
    { allowExcessProperties: false },
  );

  describe('pick with strict record', () => {
    const pickedType = pick(strictBaseRecord, ['id', 'name']);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      expect(pickedType.is(validData)).toBe(true);

      const result = pickedType.validate(validData);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        // pick validates by calling the original record's validate with filled data
        // so it includes all original fields with defaults
        expect(result.value).toStrictEqual({
          id: '123',
          name: 'John',
        });
      }
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(pickedType.is(dataWithExcess)).toBe(false);

      const result = pickedType.validate(dataWithExcess);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toStrictEqual({
          path: ['extra'],
          actualValue: 'not allowed',
          typeName: '{ id: string, name: string, age: number, email: string }',
          expectedType:
            '{ id: string, name: string, age: number, email: string }',
          message: 'Excess property "extra" is not allowed',
        });
      }
    });

    test('rejects missing required properties', () => {
      const incompleteData = { id: '123' }; // missing 'name'

      const result = pickedType.validate(incompleteData);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.message).toBe('Missing required key "name"');
      }
    });
  });

  describe('omit with strict record', () => {
    const omittedType = omit(strictBaseRecord, ['age', 'email']);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      expect(omittedType.is(validData)).toBe(true);

      const result = omittedType.validate(validData);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        // omit validates by calling the original record's validate with filled data
        // so it includes all original fields with defaults
        expect(result.value).toStrictEqual({
          id: '123',
          name: 'John',
        });
      }
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(omittedType.is(dataWithExcess)).toBe(false);

      const result = omittedType.validate(dataWithExcess);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toStrictEqual({
          path: ['extra'],
          actualValue: 'not allowed',
          typeName: '{ id: string, name: string, age: number, email: string }',
          expectedType:
            '{ id: string, name: string, age: number, email: string }',
          message: 'Excess property "extra" is not allowed',
        });
      }
    });

    test('accepts omitted properties when provided (they are filled by original record)', () => {
      const dataWithOmittedProperty = { id: '123', name: 'John', age: 25 }; // 'age' was omitted but provided

      const result = omittedType.validate(dataWithOmittedProperty);
      expect(Result.isOk(result)).toBe(true); // omit doesn't actually exclude these from validation

      if (Result.isOk(result)) {
        expect(result.value).toStrictEqual({
          id: '123',
          name: 'John',
        });
      }
    });
  });

  describe('partial with strict record', () => {
    const partialType = partial(strictBaseRecord);

    test('accepts valid data without excess properties', () => {
      const validData = { id: '123', name: 'John' };

      expect(partialType.is(validData)).toBe(true);

      const result = partialType.validate(validData);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        // partial now only returns the provided fields
        expect(result.value).toStrictEqual({
          id: '123',
          name: 'John',
        });
      }
    });

    test('accepts empty object (all fields optional)', () => {
      const emptyData = {};

      expect(partialType.is(emptyData)).toBe(true);

      const result = partialType.validate(emptyData);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        // partial with empty object returns empty object
        expect(result.value).toStrictEqual({});
      }
    });

    test('rejects data with excess properties (inherits strict behavior)', () => {
      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(partialType.is(dataWithExcess)).toBe(false);

      const result = partialType.validate(dataWithExcess);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toStrictEqual({
          path: ['extra'],
          actualValue: 'not allowed',
          typeName: '{ id: string, name: string, age: number, email: string }',
          expectedType:
            '{ id: string, name: string, age: number, email: string }',
          message: 'Excess property "extra" is not allowed',
        });
      }
    });

    test('partially partial with specific keys', () => {
      const partiallyPartialType = partial(strictBaseRecord, {
        keysToBeOptional: ['age', 'email'],
      });

      const validData = { id: '123', name: 'John' }; // required fields provided, optional fields omitted

      expect(partiallyPartialType.is(validData)).toBe(true);

      const result = partiallyPartialType.validate(validData);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        // partially partial now only returns the provided fields
        expect(result.value).toStrictEqual({
          id: '123',
          name: 'John',
        });
      }
    });

    test('partially partial rejects missing required fields', () => {
      const partiallyPartialType = partial(strictBaseRecord, {
        keysToBeOptional: ['age', 'email'],
      });

      const incompleteData = { id: '123' }; // missing required 'name'

      const result = partiallyPartialType.validate(incompleteData);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.message).toBe('Missing required key "name"');
      }
    });
  });

  describe('mergeRecords with strict records', () => {
    const strictRecord1 = record(
      {
        id: string(''),
        name: string(''),
      },
      { allowExcessProperties: false },
    );

    const strictRecord2 = record(
      {
        age: number(0),
        email: string(''),
      },
      { allowExcessProperties: false },
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

      if (Result.isErr(result)) {
        // Both records should produce errors for unknown fields
        expect(result.value.length).toBeGreaterThan(0);
      }
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

      if (Result.isErr(result)) {
        // Both records should reject the excess property
        expect(result.value.length).toBeGreaterThanOrEqual(1);
        const excessErrors = result.value.filter(
          (error) =>
            error.message?.includes(
              'Excess property "extra" is not allowed',
            ) === true,
        );
        expect(excessErrors.length).toBeGreaterThanOrEqual(1);
      }
    });

    test('rejects missing required properties from any merged record', () => {
      const incompleteData = { id: '123', name: 'John', age: 25 }; // missing 'email'

      const result = mergedType.validate(incompleteData);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const missingEmailError = result.value.find(
          (error) =>
            error.message?.includes('Missing required key "email"') === true,
        );
        expect(missingEmailError).toBeDefined();
      }
    });

    test('mixed strict and permissive records', () => {
      const permissiveRecord = record({
        status: string(''),
        metadata: string(''),
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

      if (Result.isErr(result)) {
        const excessErrors = result.value.filter(
          (error) =>
            error.message?.includes(
              'Excess property "extra" is not allowed',
            ) === true,
        );
        expect(excessErrors.length).toBeGreaterThanOrEqual(1);
      }
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

      if (Result.isOk(result)) {
        // pick calls the partial type's validate, which fills missing fields
        expect(result.value).toStrictEqual({
          id: '123',
          name: 'John',
        });
      }
    });

    test('partial of pick of strict record', () => {
      const pickedType = pick(strictBaseRecord, ['id', 'name']);
      const partialPickedType = partial(pickedType);

      const validData = { id: '123' }; // partial allows missing 'name'

      expect(partialPickedType.is(validData)).toBe(true);

      const result = partialPickedType.validate(validData);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        // partial of pick fills with the original record's defaults
        expect(result.value).toStrictEqual({
          id: '123',
        });
      }
    });

    test('nested compositions reject excess properties', () => {
      const partialType = partial(strictBaseRecord);
      const pickedPartialType = pick(partialType, ['id', 'name']);

      const dataWithExcess = { id: '123', name: 'John', extra: 'not allowed' };

      expect(pickedPartialType.is(dataWithExcess)).toBe(false);

      const result = pickedPartialType.validate(dataWithExcess);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.message).toBe(
          'Excess property "extra" is not allowed',
        );
      }
    });
  });
});
