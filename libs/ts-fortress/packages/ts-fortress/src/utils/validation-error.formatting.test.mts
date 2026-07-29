import { validationErrorToMessage } from './validation-error.mjs';

describe('validation-error formatting details', () => {
  test('uses custom message with path suffix', () => {
    const msg = validationErrorToMessage(
      {
        path: ['a', 'b'],
        actualValue: 123,
        expectedType: 'number',
        typeName: 'number',
        details: {
          kind: 'custom',
          message: 'Oops',
        },
      },
      20,
    );

    expect(msg).toBe('Error at a.b: Oops');
  });

  test('omits long string actual value beyond max length', () => {
    const long = 'x'.repeat(50);

    const msg = validationErrorToMessage(
      {
        path: [],
        actualValue: long,
        expectedType: 'string',
        typeName: 'string',
        details: undefined,
      },
      10,
    );

    expect(msg).toBe(
      'Error: expected <string> type but <string> type value was passed.',
    );
  });

  test('non-string actual value omitted when too long for unknownToString', () => {
    const bigNumber = 123_456_789_012_345_678_901; // length > 10 as string

    const msg = validationErrorToMessage(
      {
        path: ['p'],
        actualValue: bigNumber,
        expectedType: 'number',
        typeName: 'number',
        details: undefined,
      },
      5,
    );

    expect(msg).toBe(
      'Error at p: expected <number> type but <number> type value was passed.',
    );
  });

  test('string-constraint detail renders a constraint-specific message', () => {
    const msg = validationErrorToMessage(
      {
        path: ['name'],
        actualValue: '',
        expectedType: 'string',
        typeName: 'string',
        details: {
          kind: 'string-constraint',
          violation: { constraint: 'nonempty', value: true },
        },
      },
      20,
    );

    expect(msg).toBe(
      'Error at name: expected a non-empty string but an empty string was passed.',
    );
  });

  test('string-constraint minLength reports the actual length even for a long value', () => {
    const long = 'x'.repeat(50);

    const msg = validationErrorToMessage(
      {
        path: [],
        actualValue: long,
        expectedType: 'string',
        typeName: 'string',
        details: {
          kind: 'string-constraint',
          violation: { constraint: 'minLength', value: 100 },
        },
      },
      10,
    );

    // The value itself is omitted (too long), but the length is still shown.
    expect(msg).toBe(
      'Error: expected a string of length 100 or more but a string of length 50 was passed.',
    );
  });

  test('numeric-constraint detail renders the numeric-type noun', () => {
    const msg = validationErrorToMessage(
      {
        path: ['count'],
        actualValue: -1n,
        expectedType: 'bigint',
        typeName: 'bigint',
        details: {
          kind: 'numeric-constraint',
          numericType: 'bigint',
          violation: { constraint: 'positive', value: true },
        },
      },
      20,
    );

    expect(msg).toBe(
      'Error at count: expected a positive bigint but `-1n` was passed.',
    );
  });
});
