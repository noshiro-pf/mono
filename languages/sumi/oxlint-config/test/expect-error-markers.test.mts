import dedent from 'dedent';
import { parseMarkers } from '../src/index.mjs';

describe(parseMarkers, () => {
  test('a marker applies to the line right after it', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error banned-syntax/no-var
        var x = 1;
      `),
      {
        expected: [
          {
            ruleId: 'banned-syntax/no-var',
            messageIncludes: undefined,
            fileScoped: false,
            line: 2,
            markerLine: 1,
          },
        ],
        problems: [],
      },
    );
  });

  test('another linter’s next-line directive between the marker and the code is skipped', () => {
    // Both comments can then name the same line: ESLint's directive applies to
    // the line after it, and the marker skips over it to the same line.
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        export const s = u as string;
        // @sumi-expect-error banned-syntax/no-var
        /* oxlint-disable-next-line no-var */
        var x = 1;
      `).expected,
      [
        {
          ruleId: 'banned-syntax/no-unsafe-type-assertion',
          messageIncludes: undefined,
          fileScoped: false,
          line: 3,
          markerLine: 1,
        },
        {
          ruleId: 'banned-syntax/no-var',
          messageIncludes: undefined,
          fileScoped: false,
          line: 6,
          markerLine: 4,
        },
      ],
    );
  });

  test('markers stack across a skipped directive', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error banned-syntax/no-loose-equality
        // eslint-disable-next-line eqeqeq
        // @sumi-expect-error boolean/strict-logical-operands
        const b = a == c && n;
      `).expected.map(({ ruleId, line, markerLine }) => ({
        ruleId,
        line,
        markerLine,
      })),
      [
        {
          ruleId: 'banned-syntax/no-loose-equality',
          line: 4,
          markerLine: 1,
        },
        {
          ruleId: 'boolean/strict-logical-operands',
          line: 4,
          markerLine: 3,
        },
      ],
    );
  });

  test('any other comment line is the line a marker applies to', () => {
    // A diagnostic can sit on a comment itself (`// @ts-ignore` is one), so
    // only the next-line directives of other linters are skipped.
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error banned-syntax/no-ts-ignore
        // @ts-ignore
        export const value: number = 'not a number';
      `).expected.map(({ line }) => line),
      [2],
    );
  });

  test('a directive that disables the rest of the file is not skipped', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error banned-syntax/no-var
        // eslint-disable no-var
        var x = 1;
      `).expected.map(({ line }) => line),
      [2],
    );
  });

  test('a skipped directive still has to be followed by code', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error banned-syntax/no-var
        // eslint-disable-next-line no-var
      `).problems,
      ['line 1: @sumi-expect-error marker at end of file applies to nothing'],
    );
  });

  test('a file-scoped marker has no line of its own', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error-file banned-syntax/no-var
        var x = 1;
      `).expected,
      [
        {
          ruleId: 'banned-syntax/no-var',
          messageIncludes: undefined,
          fileScoped: true,
          line: 0,
          markerLine: 0,
        },
      ],
    );
  });
});
