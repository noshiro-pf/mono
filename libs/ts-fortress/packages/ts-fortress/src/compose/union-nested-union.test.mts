import { Result } from 'ts-data-forge';
import { literal, recursion } from '../other-types/index.mjs';
import { nullType, number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type Type } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { union } from './union.mjs';

/**
 * `A | (B | C)` and `A | B | C` describe the same set of values, so a union
 * nested directly inside another union is flattened into it. The members are
 * what the error path reasons about — a nested union would otherwise be
 * summarized by the single runtime type category of its default value.
 */

describe('union - nested unions', () => {
  const circle = record({ kind: literal('circle'), radius: number() });

  const square = record({ kind: literal('square'), size: number() });

  // Nested union whose members are of two different runtime type categories.
  const tagOrCode = union([literal('alpha'), literal(42)]);

  const nested = union([tagOrCode, circle, square]);

  test('a value matching an inner member is accepted', () => {
    assert.isTrue(nested.is('alpha'));

    assert.isTrue(nested.is(42));

    assert.isTrue(nested.is({ kind: 'circle', radius: 1 }));
  });

  test('an inner member can be reported as the closest one', () => {
    // Only `42` shares the value's runtime type category. Without flattening,
    // the nested union would be filed under the category of its default value
    // (`"alpha"`, a string) and no member would be left to blame.
    const result = nested.validate(41);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      validationErrorsToMessages(Result.unwrapErrThrow(result)),
      [
        'Error: the value did not match any of the 4 members of the union; the closest member type is <42>, which failed as follows:',
        'Error: expected <42> type but <number> type value `41` was passed.',
      ],
    );
  });

  test('the flattened members are counted, not the members as written', () => {
    // 3 members as written, 4 after the nested union is flattened in.
    const result = nested.validate(true);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      validationErrorsToMessages(Result.unwrapErrThrow(result)),
      [
        'Error: the value did not match any of the 4 members of the union; expected a value of type <string> | <number> | <object> but <boolean> type value `true` was passed.',
      ],
    );
  });

  test('the type name keeps the members as they were written', () => {
    expect(nested.typeName).toBe(
      '(("alpha" | 42) | { kind: "circle", radius: number } | { kind: "square", size: number })',
    );
  });

  test('a nested union with a name of its own keeps it in the member listing', () => {
    // Short enough to list every member, so the name the caller chose is what
    // the message shows.
    const status = union([literal('active'), literal('done')], {
      typeName: 'Status',
    });

    const result = union([status, nullType]).validate('unknown');

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      validationErrorsToMessages(Result.unwrapErrThrow(result)),
      [
        'Error: expected one of <Status>, <null> but <string> type value "unknown" was passed.',
      ],
    );
  });

  describe('a recursive member stays opaque', () => {
    // Flattening asks each member whether it is a union. A `recursion` type
    // answers that without running its definition, so a type defined in terms
    // of itself is taken as a single member instead of being expanded.
    const makeTree = (onDefinition: () => void): Type<unknown> =>
      recursion('Tree', () => {
        onDefinition();

        return union([
          nullType,
          record({ value: number(), children: string() }),
        ]);
      });

    test('building the union does not run the definition', () => {
      let mut_definitionCalls = 0;

      const tree = makeTree(() => {
        mut_definitionCalls += 1;
      });

      union([string(), tree]);

      expect(mut_definitionCalls).toBe(0);
    });

    test('the recursive member is listed as itself, not as its members', () => {
      const treeOrLabel = union([string(), makeTree(() => {})]);

      const result = treeOrLabel.validate(42);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: expected one of <string>, <Tree> but <number> type value `42` was passed.',
        ],
      );
    });
  });
});
