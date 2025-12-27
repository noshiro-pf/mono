import { expectType } from 'ts-data-forge';
import {
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  prependPathToValidationErrors,
  type ValidationError,
  validationErrorsToMessages,
} from './validation-error.mjs';

describe('validation-error', () => {
  describe(createPrimitiveValidationError, () => {
    test('creates primitive validation error', () => {
      const error = createPrimitiveValidationError({
        actualValue: 123,
        expectedType: 'string',
        typeName: 'string',
        details: undefined,
      });

      expectType<typeof error, ValidationError>('=');

      assert.deepStrictEqual(error, {
        path: [],
        actualValue: 123,
        expectedType: 'string',
        typeName: 'string',
        details: undefined,
      });
    });
  });

  describe(prependPathToValidationErrors, () => {
    test('prepends key to validation errors', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          details: undefined,
        },
        {
          path: [],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ];

      const result = prependPathToValidationErrors(errors, 'parent');

      assert.deepStrictEqual(result, [
        {
          path: ['parent', 'field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          details: undefined,
        },
        {
          path: ['parent'],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);
    });

    test('handles empty errors array', () => {
      const result = prependPathToValidationErrors([], 'key');

      assert.deepStrictEqual(result, []);
    });
  });

  describe(prependIndexToValidationErrors, () => {
    test('prepends index to validation errors', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          details: undefined,
        },
        {
          path: [],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ];

      const result = prependIndexToValidationErrors(errors, 5);

      assert.deepStrictEqual(result, [
        {
          path: ['5', 'field'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          details: undefined,
        },
        {
          path: ['5'],
          actualValue: null,
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);
    });

    test('handles empty errors array', () => {
      const result = prependIndexToValidationErrors([], 0);

      assert.deepStrictEqual(result, []);
    });
  });

  describe(validationErrorsToMessages, () => {
    test('converts validation errors to messages', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['user', 'name'],
          actualValue: 123,
          expectedType: 'string',
          typeName: 'string',
          details: undefined,
        },
        {
          path: ['items', '0'],
          actualValue: 'invalid',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
        {
          path: [],
          actualValue: null,
          expectedType: 'boolean',
          typeName: 'boolean',
          details: undefined,
        },
      ];

      assert.deepStrictEqual(validationErrorsToMessages(errors), [
        'Error at user.name: expected <string> type but <number> type value `123` was passed.',
        'Error at items.0: expected <number> type but <string> type value "invalid" was passed.',
        'Error: expected <boolean> type but <object> type value `null` was passed.',
      ]);
    });

    test('handles errors with custom messages', () => {
      const errors: readonly ValidationError[] = [
        {
          path: ['field'],
          actualValue: 'invalid',
          expectedType: 'number',
          typeName: 'number',
          details: {
            kind: 'custom',
            message: 'Custom validation message',
          },
        },
      ];

      assert.deepStrictEqual(validationErrorsToMessages(errors), [
        'Error at field: Custom validation message',
      ]);
    });

    test('handles empty errors array', () => {
      assert.deepStrictEqual(validationErrorsToMessages([]), []);
    });
  });
});
