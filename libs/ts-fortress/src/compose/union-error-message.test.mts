import { Result } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { union } from './union.mjs';

// These tests pin down the error messages produced when a value fails to
// match a union type, especially for unions whose member listing is long.

describe('union - error messages', () => {
  // A discriminated union whose full member listing is too long to be a
  // readable error message.
  const circle = record({ kind: literal('circle'), radius: number() });

  const square = record({ kind: literal('square'), size: number() });

  const rectangle = record({
    kind: literal('rectangle'),
    width: number(),
    height: number(),
  });

  const shape = union([circle, square, rectangle]);

  describe('long union', () => {
    test('value that almost matches one member (wrong value type for one key)', () => {
      const result = shape.validate({ kind: 'circle', radius: '5' });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "circle", radius: number }>, which failed as follows:',
        'Error at radius: expected <number> type but <string> type value "5" was passed.',
      ]);
    });

    test('the discriminant key determines the member reported in the error', () => {
      const result = shape.validate({ kind: 'square', size: 'big' });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "square", size: number }>, which failed as follows:',
        'Error at size: expected <number> type but <string> type value "big" was passed.',
      ]);
    });

    test('value whose typeof matches no member', () => {
      const result = shape.validate(42);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 42,
        expectedType:
          '({ kind: "circle", radius: number } | { kind: "square", size: number } | { kind: "rectangle", width: number, height: number })',
        typeName:
          '({ kind: "circle", radius: number } | { kind: "square", size: number } | { kind: "rectangle", width: number, height: number })',
        details: {
          kind: 'union-category-mismatch',
          memberCount: 3,
          memberCategories: ['object'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: the value did not match any of the 3 members of the union; expected a value of type <object> but <number> type value `42` was passed.',
      ]);
    });

    test('union nested in a record keeps the path prefix', () => {
      const holder = record({ shape });

      const result = holder.validate({
        shape: { kind: 'circle', radius: '5' },
      });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at shape: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "circle", radius: number }>, which failed as follows:',
        'Error at shape.radius: expected <number> type but <string> type value "5" was passed.',
      ]);
    });
  });

  describe('short union', () => {
    // A union whose member listing is short enough to be readable as-is.
    const color = union([literal('red'), literal('green'), literal('blue')]);

    test('all members are listed in the error message', () => {
      const result = color.validate('purple');

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 'purple',
        expectedType: '("red" | "green" | "blue")',
        typeName: '("red" | "green" | "blue")',
        details: {
          kind: 'union',
          typeNames: ['"red"', '"green"', '"blue"'],
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of <"red">, <"green">, <"blue"> but <string> type value "purple" was passed.',
      ]);
    });

    test('a value too long to print is reported as matching no member', () => {
      // Printing the value is what tells the reader why it was rejected, so
      // when it has to be omitted the message says so instead of reporting
      // only its runtime type (which is a type the union does accept).
      const result = color.validate('purple'.repeat(10));

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: expected one of <"red">, <"green">, <"blue"> but a string of length 60 matching none of them was passed.',
        ],
      );
    });
  });

  describe('basic containers are named in place of a bare object', () => {
    test('an array passed to a union of records', () => {
      const result = shape.validate([1, 2, 3]);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0]?.details, {
        kind: 'union-category-mismatch',
        memberCount: 3,
        memberCategories: ['object'],
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: the value did not match any of the 3 members of the union; expected a value of type <object> but <array> type value `[1,2,3]` was passed.',
      ]);
    });

    test('a Map passed to a union of records', () => {
      const result = shape.validate(new Map([['radius', 5]]));

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: the value did not match any of the 3 members of the union; expected a value of type <object> but <Map> type value `Map([["radius",5]])` was passed.',
        ],
      );
    });
  });
});
