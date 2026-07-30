import {
  validationErrorToMessage,
  type ValidationError,
  type ValidationErrorDetails,
} from './validation-error.mjs';

/**
 * `validationErrorToMessage` renders the offending value inline only while it
 * fits in `maxLengthToPrintActualValue`; past that budget the value is
 * replaced by a description of it. These tests compare both renderings of the
 * same error side by side so every format that depends on the budget can be
 * read off a single table.
 */

/** Budget large enough to print every value used below. */
const PRINTED = 100;

/** Budget that prints nothing, so every value used below is described instead. */
const OMITTED = 0;

const errorOf = ({
  actualValue,
  expectedType,
  details,
}: Readonly<{
  actualValue: unknown;
  expectedType: string;
  details: ValidationErrorDetails | undefined;
}>): ValidationError =>
  ({
    path: [],
    actualValue,
    expectedType,
    typeName: expectedType,
    details,
  }) as const;

describe(validationErrorToMessage, () => {
  describe('how the offending value is rendered', () => {
    // Only the value rendering varies here, so every row is checked against
    // the same surrounding message. `typeof` reports a bare `object` for null
    // and for every container, hence the individual names.
    test.each([
      {
        actualValue: 'purple',
        printed: '<string> type value "purple"',
        omitted: 'a string of length 6',
      },
      {
        actualValue: 42,
        printed: '<number> type value `42`',
        omitted: 'a value of type <number>',
      },
      {
        actualValue: -1n,
        printed: '<bigint> type value `-1n`',
        omitted: 'a value of type <bigint>',
      },
      {
        actualValue: true,
        printed: '<boolean> type value `true`',
        omitted: 'a value of type <boolean>',
      },
      {
        actualValue: null,
        printed: '<null> type value `null`',
        omitted: 'a value of type <null>',
      },
      {
        actualValue: undefined,
        printed: '<undefined> type value `undefined`',
        omitted: 'a value of type <undefined>',
      },
      {
        actualValue: { a: 1, b: 2 },
        printed: '<object> type value `{"a":1,"b":2}`',
        omitted: 'a value of type <object>',
      },
      {
        actualValue: [1, 2, 3],
        printed: '<array> type value `[1,2,3]`',
        omitted: 'an array of length 3',
      },
      {
        actualValue: new Map([['a', 1]]),
        printed: '<Map> type value `Map([["a",1]])`',
        omitted: 'a Map of size 1',
      },
      {
        actualValue: new Set([1, 2]),
        printed: '<Set> type value `Set([1,2])`',
        omitted: 'a Set of size 2',
      },
    ])('$printed / $omitted', ({ actualValue, printed, omitted }) => {
      const error = errorOf({
        actualValue,
        expectedType: 'Target',
        details: undefined,
      });

      expect(validationErrorToMessage(error, PRINTED)).toBe(
        `Error: expected <Target> type but ${printed} was passed.`,
      );

      expect(validationErrorToMessage(error, OMITTED)).toBe(
        `Error: expected <Target> type but ${omitted} was passed.`,
      );
    });
  });

  describe('message formats that depend on the print budget', () => {
    // A type that accepts several shapes cannot rely on the runtime type
    // alone once the value is omitted — `<string>` reads as acceptable for a
    // union of string literals — so those messages state why the value was
    // rejected instead. The `key` / `value` wording of record and Map entries
    // does not interact with the budget and is covered by the codec tests.
    test.each([
      {
        name: 'no details',
        actualValue: 'purple',
        expectedType: 'Color',
        details: undefined,
        printed:
          'Error: expected <Color> type but <string> type value "purple" was passed.',
        omitted:
          'Error: expected <Color> type but a string of length 6 was passed.',
      },
      {
        name: 'template-literal',
        actualValue: 'users',
        expectedType: 'PathString',
        details: { kind: 'template-literal' },
        printed:
          'Error: expected <PathString> but <string> type value "users" was passed.',
        omitted:
          'Error: expected <PathString> but a string of length 5 was passed.',
      },
      {
        name: 'enum',
        actualValue: 'purple',
        expectedType: 'Color',
        details: { kind: 'enum', values: ['red', 'green', 'blue'] },
        printed:
          'Error: expected one of { red, green, blue } but "purple" was passed.',
        omitted:
          'Error: expected one of { red, green, blue } but a string of length 6 matching none of them was passed.',
      },
      {
        name: 'integer-range',
        actualValue: 42,
        expectedType: 'Digit',
        details: { kind: 'integer-range', start: 0, endExclusive: 10 },
        printed:
          'Error: expected an integer between 0 and 9 but `42` was passed.',
        omitted:
          'Error: expected an integer between 0 and 9 but a value of type <number> was passed.',
      },
      {
        name: 'union',
        actualValue: 'purple',
        expectedType: '("red" | "green")',
        details: { kind: 'union', typeNames: ['"red"', '"green"'] },
        printed:
          'Error: expected one of <"red">, <"green"> but <string> type value "purple" was passed.',
        omitted:
          'Error: expected one of <"red">, <"green"> but a string of length 6 matching none of them was passed.',
      },
      {
        name: 'union-category-mismatch',
        actualValue: 42,
        expectedType: 'Shape',
        details: {
          kind: 'union-category-mismatch',
          memberCount: 3,
          memberCategories: ['object'],
        },
        printed:
          'Error: the value did not match any of the 3 members of the union; expected a value of type <object> but <number> type value `42` was passed.',
        omitted:
          'Error: the value did not match any of the 3 members of the union; expected a value of type <object> but a value of type <number> was passed.',
      },
      {
        name: 'intersection',
        actualValue: { a: 1 },
        expectedType: '(A & B)',
        details: { kind: 'intersection', typeNames: ['A', 'B'] },
        printed:
          'Error: expected value to match all types of <A>, <B> but <object> type value `{"a":1}` was passed.',
        omitted:
          'Error: expected value to match all types of <A>, <B> but a value of type <object> not matching all of them was passed.',
      },
      {
        name: 'record-entry',
        actualValue: 42,
        expectedType: 'Dict',
        details: { kind: 'record-entry', entry: 'key', expectedType: 'string' },
        printed:
          'Error: expected record key type to be <string> but <number> type value `42` was passed.',
        omitted:
          'Error: expected record key type to be <string> but a value of type <number> was passed.',
      },
      {
        name: 'map-entry',
        actualValue: 'purple',
        expectedType: 'Counts',
        details: { kind: 'map-entry', entry: 'value', expectedType: 'number' },
        printed:
          'Error: expected Map value type to be <number> but <string> type value "purple" was passed.',
        omitted:
          'Error: expected Map value type to be <number> but a string of length 6 was passed.',
      },
      {
        name: 'set-element',
        actualValue: 'purple',
        expectedType: 'Ids',
        details: { kind: 'set-element', expectedType: 'number' },
        printed:
          'Error: expected Set element type to be <number> but <string> type value "purple" was passed.',
        omitted:
          'Error: expected Set element type to be <number> but a string of length 6 was passed.',
      },
      {
        name: 'string-constraint (length-carrying)',
        actualValue: 'ab',
        expectedType: 'string',
        details: {
          kind: 'string-constraint',
          violation: { constraint: 'minLength', value: 3 },
        },
        printed:
          'Error: expected a string of length 3 or more but a string of length 2 "ab" was passed.',
        omitted:
          'Error: expected a string of length 3 or more but a string of length 2 was passed.',
      },
      {
        name: 'string-constraint (value-carrying)',
        actualValue: 'purple',
        expectedType: 'string',
        details: {
          kind: 'string-constraint',
          violation: { constraint: 'startsWith', value: 'https://' },
        },
        printed:
          'Error: expected a string starting with "https://" but "purple" was passed.',
        omitted:
          'Error: expected a string starting with "https://" but a string of length 6 was passed.',
      },
      {
        name: 'numeric-constraint',
        actualValue: -1n,
        expectedType: 'bigint',
        details: {
          kind: 'numeric-constraint',
          numericType: 'bigint',
          violation: { constraint: 'positive', value: true },
        },
        printed: 'Error: expected a positive bigint but `-1n` was passed.',
        omitted:
          'Error: expected a positive bigint but a value of type <bigint> was passed.',
      },
    ] as const satisfies readonly FormattingCase[])(
      '$name',
      ({ actualValue, expectedType, details, printed, omitted }) => {
        const error = errorOf({ actualValue, expectedType, details });

        expect(validationErrorToMessage(error, PRINTED)).toBe(printed);

        expect(validationErrorToMessage(error, OMITTED)).toBe(omitted);
      },
    );
  });

  describe('message formats that never include the value', () => {
    // The remaining kinds describe the failure entirely on their own, so the
    // print budget cannot change them.
    test.each([
      {
        name: 'custom',
        details: { kind: 'custom', message: 'Oops' },
        message: 'Error: Oops',
      },
      {
        name: 'tuple-length',
        details: { kind: 'tuple-length', expectedLength: 2, actualLength: 3 },
        message: 'Error: expected tuple of length 2 but length 3 was passed.',
      },
      {
        name: 'array-length',
        details: { kind: 'array-length', expectedLength: 2, actualLength: 3 },
        message: 'Error: expected array of length 2 but length 3 was passed.',
      },
      {
        name: 'array-min-length',
        details: { kind: 'array-min-length', minLength: 4, actualLength: 3 },
        message:
          'Error: expected array of length 4 or more but length 3 was passed.',
      },
      {
        name: 'array-max-length',
        details: { kind: 'array-max-length', maxLength: 2, actualLength: 3 },
        message:
          'Error: expected array of length 2 or less but length 3 was passed.',
      },
      {
        name: 'array-range-length',
        details: {
          kind: 'array-range-length',
          minLength: 4,
          maxLength: 6,
          actualLength: 3,
        },
        message:
          'Error: expected array of length between 4 and 6 but length 3 was passed.',
      },
      {
        name: 'non-empty-array',
        details: { kind: 'non-empty-array' },
        message: 'Error: expected non-empty array but empty array was passed.',
      },
      {
        name: 'missing-key',
        details: { kind: 'missing-key', key: 'x' },
        message: 'Error: missing required key "x".',
      },
      {
        name: 'excess-key',
        details: { kind: 'excess-key', key: 'x' },
        message: 'Error: excess property "x" is not allowed.',
      },
      {
        name: 'union-closest-member',
        details: {
          kind: 'union-closest-member',
          memberCount: 3,
          closestMemberTypeName: '{ kind: "circle" }',
          equallyCloseMemberTypeNames: [],
        },
        message:
          'Error: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "circle" }>, which failed as follows:',
      },
      {
        name: 'brand',
        details: { kind: 'brand', description: 'must be even' },
        message: 'Error: expected value to satisfy constraint: must be even.',
      },
      {
        name: 'string-constraint (nonempty)',
        details: {
          kind: 'string-constraint',
          violation: { constraint: 'nonempty', value: true },
        },
        message:
          'Error: expected a non-empty string but an empty string was passed.',
      },
    ] as const satisfies readonly InvariantCase[])(
      '$name',
      ({ details, message }) => {
        const error = errorOf({
          actualValue: 'a value long enough to be omitted',
          expectedType: 'Target',
          details,
        });

        expect(validationErrorToMessage(error, PRINTED)).toBe(message);

        expect(validationErrorToMessage(error, OMITTED)).toBe(message);
      },
    );
  });

  test('the path is prefixed to the message', () => {
    const error: ValidationError = {
      path: ['user', 'address', 'street'],
      actualValue: 42,
      expectedType: 'string',
      typeName: 'string',
      details: undefined,
    } as const;

    expect(validationErrorToMessage(error)).toBe(
      'Error at user.address.street: expected <string> type but <number> type value `42` was passed.',
    );
  });

  test('the print budget defaults to 20 characters', () => {
    const error = errorOf({
      actualValue: 'x'.repeat(21),
      expectedType: 'Target',
      details: undefined,
    });

    expect(validationErrorToMessage(error)).toBe(
      'Error: expected <Target> type but a string of length 21 was passed.',
    );

    expect(
      validationErrorToMessage(
        errorOf({
          actualValue: 'x'.repeat(20),
          expectedType: 'Target',
          details: undefined,
        }),
      ),
    ).toBe(
      `Error: expected <Target> type but <string> type value "${'x'.repeat(20)}" was passed.`,
    );
  });
});

type FormattingCase = Readonly<{
  name: string;
  actualValue: unknown;
  expectedType: string;
  details: ValidationErrorDetails | undefined;
  printed: string;
  omitted: string;
}>;

type InvariantCase = Readonly<{
  name: string;
  details: ValidationErrorDetails;
  message: string;
}>;
