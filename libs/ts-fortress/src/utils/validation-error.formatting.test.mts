import { validationErrorToMessage } from './validation-error.mjs';

describe('validation-error formatting details', () => {
  test('uses custom message with path suffix', () => {
    const msg = validationErrorToMessage(
      {
        path: ['a', 'b'],
        actualValue: 123,
        expectedType: 'number',
        typeName: 'number',
        message: 'Oops',
      },
      20,
    );

    expect(msg).toBe('Oops at a.b');
  });

  test('omits long string actual value beyond max length', () => {
    const long = 'x'.repeat(50);
    const msg = validationErrorToMessage(
      {
        path: [],
        actualValue: long,
        expectedType: 'string',
        typeName: 'string',
        message: undefined,
      },
      10,
    );

    expect(msg).toBe('Expected <string>, got <string> type value.');
  });

  test('non-string actual value omitted when too long for unknownToString', () => {
    const bigNumber = 123_456_789_012_345_678_901; // length > 10 as string
    const msg = validationErrorToMessage(
      {
        path: ['p'],
        actualValue: bigNumber,
        expectedType: 'number',
        typeName: 'number',
        message: undefined,
      },
      5,
    );

    expect(msg).toBe('Expected <number> at p, got <number> type value.');
  });
});
