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
});
