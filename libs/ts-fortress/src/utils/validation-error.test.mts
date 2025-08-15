import { expectType } from 'ts-data-forge';
import {
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  prependPathToValidationErrors,
  type ValidationError,
  validationErrorsToMessages,
} from './validation-error.mjs';

describe('validation-error', () => {
  describe('createPrimitiveValidationError', () => {
    test('creates primitive validation error', () => {
      const error = createPrimitiveValidationError({
        actualValue: 123,
        expectedType: 'string',
        typeName: 'string',
      });

      expectType<typeof error, ValidationError>('=');
      expect(error).toStrictEqual({
        path: [],
        actualValue: 123,
        expectedType: 'string',
        typeName: 'string',
        message: undefined,
      });
    });
  });

  describe('prependPathToValidationErrors', () => {
    test('prepends key to validation errors', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          message: undefined,
        },
        {
          path: [],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
      ];

      const result = prependPathToValidationErrors(errors, 'parent');

      expect(result).toStrictEqual([
        {
          path: ['parent', 'field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          message: undefined,
        },
        {
          path: ['parent'],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
      ]);
    });

    test('handles empty errors array', () => {
      const result = prependPathToValidationErrors([], 'key');
      expect(result).toStrictEqual([]);
    });
  });

  describe('prependIndexToValidationErrors', () => {
    test('prepends index to validation errors', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          message: undefined,
        },
        {
          path: [],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
      ];

      const result = prependIndexToValidationErrors(errors, 5);

      expect(result).toStrictEqual([
        {
          path: ['5', 'field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          message: undefined,
        },
        {
          path: ['5'],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
      ]);
    });

    test('handles empty errors array', () => {
      const result = prependIndexToValidationErrors([], 0);
      expect(result).toStrictEqual([]);
    });
  });

  describe('validationErrorsToMessages', () => {
    test('converts validation errors to messages', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['user', 'name'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          message: undefined,
        },
        {
          path: ['items', '0'],
          actualValue: 'invalid',
          expectedType: 'number',
          typeName: 'number',
          message: undefined,
        },
        {
          path: [],
          actualValue: null,
          expectedType: 'boolean',
          typeName: 'boolean',
          message: undefined,
        },
      ];

      expect(validationErrorsToMessages(errors)).toStrictEqual([
        'Expected string at user.name, got number',
        'Expected number at items.0, got string',
        'Expected boolean, got object',
      ]);
    });

    test('handles errors with custom messages', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['field'],
          actualValue: 'invalid',
          expectedType: 'number',
          typeName: 'number',
          message: 'Custom validation message',
        },
      ];

      expect(validationErrorsToMessages(errors)).toStrictEqual([
        'Custom validation message at field',
      ]);
    });

    test('handles empty errors array', () => {
      expect(validationErrorsToMessages([])).toStrictEqual([]);
    });
  });
});
