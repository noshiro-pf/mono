import { Result } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type AnyType } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { union } from './union.mjs';

/**
 * When a union's member listing is too long to print, the error reports a
 * single member instead. That member is chosen in two steps:
 *
 * 1. keep the members whose runtime type category (taken from their default
 *    value) matches the value's,
 * 2. among those, take the one with the lowest score, where a member scores
 *    the number of checks it failed minus the number it passed. Members with
 *    the same score are ordered by how much they satisfied, and members equal
 *    on both are all named, with the first in declaration order reporting its
 *    errors.
 *
 * `documents/union-closest-member-heuristic.md` records the scenarios the
 * scoring was chosen against. Each test below first lists what every member
 * reports on its own, so the counts the choice is made from are visible, and
 * then checks which member the union ends up blaming.
 */

/** What a single member reports for `value`, as it would be shown to a user. */
const memberReport = (
  memberType: AnyType,
  value: unknown,
): Readonly<{ typeName: string; errors: readonly string[] }> => {
  const result = memberType.validate(value);

  return {
    typeName: memberType.typeName,
    errors: Result.isErr(result)
      ? validationErrorsToMessages(result.value)
      : [],
  };
};

describe('union - closest member selection', () => {
  const circle = record({ kind: literal('circle'), radius: number() });

  const square = record({ kind: literal('square'), size: number() });

  const rectangle = record({
    kind: literal('rectangle'),
    width: number(),
    height: number(),
  });

  const shape = union([circle, square, rectangle]);

  describe('one field of one variant is wrong', () => {
    const value = { kind: 'circle', radius: '5' } as const;

    test('the members report 1 / 2 / 3 errors', () => {
      assert.deepStrictEqual(
        [circle, square, rectangle].map((m) => memberReport(m, value)),
        [
          {
            typeName: '{ kind: "circle", radius: number }',
            errors: [
              'Error at radius: expected <number> type but <string> type value "5" was passed.',
            ],
          },
          {
            typeName: '{ kind: "square", size: number }',
            errors: [
              'Error at kind: expected <"square"> type but <string> type value "circle" was passed.',
              'Error at size: missing required key "size".',
            ],
          },
          {
            typeName: '{ kind: "rectangle", width: number, height: number }',
            errors: [
              'Error at kind: expected <"rectangle"> type but <string> type value "circle" was passed.',
              'Error at width: missing required key "width".',
              'Error at height: missing required key "height".',
            ],
          },
        ],
      );
    });

    test('the union blames the 1-error member', () => {
      const result = shape.validate(value);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "circle", radius: number }>, which failed as follows:',
          'Error at radius: expected <number> type but <string> type value "5" was passed.',
        ],
      );
    });
  });

  describe('the discriminant names no variant', () => {
    // Every variant fails on `kind`, so what separates them is how much of
    // the rest of the value they accept: `radius: 5` satisfies the circle.
    const value = { kind: 'triangle', radius: 5 } as const;

    test('the members report 1 / 2 / 3 errors', () => {
      assert.deepStrictEqual(
        [circle, square, rectangle].map((m) => memberReport(m, value).errors),
        [
          [
            'Error at kind: expected <"circle"> type but <string> type value "triangle" was passed.',
          ],
          [
            'Error at kind: expected <"square"> type but <string> type value "triangle" was passed.',
            'Error at size: missing required key "size".',
          ],
          [
            'Error at kind: expected <"rectangle"> type but <string> type value "triangle" was passed.',
            'Error at width: missing required key "width".',
            'Error at height: missing required key "height".',
          ],
        ],
      );
    });

    test('the union blames the variant whose other fields are satisfied', () => {
      const result = shape.validate(value);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "circle", radius: number }>, which failed as follows:',
          'Error at kind: expected <"circle"> type but <string> type value "triangle" was passed.',
        ],
      );
    });
  });

  describe('nothing in the value points at a variant', () => {
    const value = {} as const;

    test('the two smallest members tie at 2 errors', () => {
      assert.deepStrictEqual(
        [circle, square, rectangle].map((m) => memberReport(m, value).errors),
        [
          [
            'Error at kind: missing required key "kind".',
            'Error at radius: missing required key "radius".',
          ],
          [
            'Error at kind: missing required key "kind".',
            'Error at size: missing required key "size".',
          ],
          [
            'Error at kind: missing required key "kind".',
            'Error at width: missing required key "width".',
            'Error at height: missing required key "height".',
          ],
        ],
      );
    });

    test('both tied members are named, and the first reports its errors', () => {
      assert.deepStrictEqual(
        validationErrorsToMessages(
          Result.unwrapErrThrow(shape.validate(value)),
        ),
        [
          'Error: the value did not match any of the 3 members of the union; the closest member types are <{ kind: "circle", radius: number }>, <{ kind: "square", size: number }>; the first of them failed as follows:',
          'Error at kind: missing required key "kind".',
          'Error at radius: missing required key "radius".',
        ],
      );
    });

    test('the errors shown are the first tied member in declaration order', () => {
      // Reordering the members moves the reported errors to the other tied
      // member, as it does for `prune` and `fill`.
      assert.deepStrictEqual(
        validationErrorsToMessages(
          Result.unwrapErrThrow(
            union([square, circle, rectangle]).validate(value),
          ),
        ),
        [
          'Error: the value did not match any of the 3 members of the union; the closest member types are <{ kind: "square", size: number }>, <{ kind: "circle", radius: number }>; the first of them failed as follows:',
          'Error at kind: missing required key "kind".',
          'Error at size: missing required key "size".',
        ],
      );
    });
  });

  describe('too many members tie to name them all', () => {
    // Naming the tied members follows the same length bound as the member
    // listing itself: once the names it would add grow past it, they are
    // replaced by their count.
    const alpha = record({ alpha: string(), alphaCount: number() });

    const bravo = record({ bravo: string(), bravoCount: number() });

    const charlie = record({ charlie: string(), charlieCount: number() });

    test('the tied members are replaced by their count', () => {
      assert.deepStrictEqual(
        validationErrorsToMessages(
          Result.unwrapErrThrow(union([alpha, bravo, charlie]).validate({})),
        ),
        [
          'Error: the value did not match any of the 3 members of the union; 3 members are equally close; <{ alpha: string, alphaCount: number }> failed as follows:',
          'Error at alpha: missing required key "alpha".',
          'Error at alphaCount: missing required key "alphaCount".',
        ],
      );
    });
  });

  describe('the value belongs to no member category', () => {
    // The category filter runs before any error counting, so members that
    // cannot describe this kind of value never compete on error count.
    test('a number against a union of records', () => {
      const result = shape.validate(42);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: the value did not match any of the 3 members of the union; expected a value of type <object> but <number> type value `42` was passed.',
        ],
      );
    });
  });

  describe('a small unrelated member does not outrank a near-match', () => {
    // Counting errors alone would report `note` here: it fails a single check
    // while `config` fails two. Crediting the checks a member passed puts them
    // level (config 2 - 1 = 1, note 1 - 0 = 1) and the tie then goes to the
    // member that recognized more of the value.
    const config = record({
      kind: literal('config'),
      host: string(),
      port: number(),
    });

    const note = record({ note: string() });

    const value = { kind: 'config', host: 5, port: 'not a number' } as const;

    test('the near-match reports more errors than the unrelated member', () => {
      assert.deepStrictEqual(
        [config, note].map((m) => memberReport(m, value).errors),
        [
          [
            'Error at host: expected <string> type but <number> type value `5` was passed.',
            'Error at port: expected <number> type but <string> type value "not a number" was passed.',
          ],
          ['Error at note: missing required key "note".'],
        ],
      );
    });

    test('the member that satisfied a check is still the one reported', () => {
      assert.deepStrictEqual(
        validationErrorsToMessages(
          Result.unwrapErrThrow(union([config, note]).validate(value)),
        ),
        [
          'Error: the value did not match any of the 2 members of the union; the closest member type is <{ kind: "config", host: string, port: number }>, which failed as follows:',
          'Error at host: expected <string> type but <number> type value `5` was passed.',
          'Error at port: expected <number> type but <string> type value "not a number" was passed.',
        ],
      );
    });
  });

  describe('a large member the value mostly satisfies wins on score', () => {
    // account fails 2 of its 5 checks and passes 3, scoring -1; label fails its
    // single check and passes none, scoring 1. Error counts alone would have
    // reported `label` and its one unhelpful error.
    const account = record({
      id: number(),
      name: string(),
      email: string(),
      role: string(),
      age: number(),
    });

    const label = record({ label: string() });

    const value = {
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      role: 7,
      age: 'unknown',
    } as const;

    test('the members report 2 / 1 errors', () => {
      assert.deepStrictEqual(
        [account, label].map((m) => memberReport(m, value).errors),
        [
          [
            'Error at role: expected <string> type but <number> type value `7` was passed.',
            'Error at age: expected <number> type but <string> type value "unknown" was passed.',
          ],
          ['Error at label: missing required key "label".'],
        ],
      );
    });

    test('the member with more errors but a better score is reported', () => {
      assert.deepStrictEqual(
        validationErrorsToMessages(
          Result.unwrapErrThrow(union([account, label]).validate(value)),
        ),
        [
          'Error: the value did not match any of the 2 members of the union; the closest member type is <{ id: number, name: string, email: string, role: string, age: number }>, which failed as follows:',
          'Error at role: expected <string> type but <number> type value `7` was passed.',
          'Error at age: expected <number> type but <string> type value "unknown" was passed.',
        ],
      );
    });
  });
});
