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
      [
        {
          line: 1,
          message:
            '@sumi-expect-error marker at end of file applies to nothing',
        },
      ],
    );
  });

  test('a file-scoped marker applies to no line but keeps its own', () => {
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
          markerLine: 1,
        },
      ],
    );
  });

  test('a file-scoped marker may follow comments, blank lines and other markers', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        #!/usr/bin/env node
        /**
         * A header comment.
         */

        // @sumi-expect-error-file null/no-null-literal
        // @sumi-expect-error-file null/no-null-propagation
        export const x = null;
      `),
      {
        expected: [
          {
            ruleId: 'null/no-null-literal',
            messageIncludes: undefined,
            fileScoped: true,
            line: 0,
            markerLine: 6,
          },
          {
            ruleId: 'null/no-null-propagation',
            messageIncludes: undefined,
            fileScoped: true,
            line: 0,
            markerLine: 7,
          },
        ],
        problems: [],
      },
    );
  });

  test('a file-scoped marker after the first code line is a problem, not a marker', () => {
    // Read top-down, a marker below code looks like it covers what follows it;
    // it would cover the lines above it too.
    assert.deepStrictEqual(
      parseMarkers(dedent`
        import { x } from './x.mjs';

        // @sumi-expect-error-file null/no-null-literal
        export const y = null;
      `),
      {
        expected: [],
        problems: [
          {
            line: 3,
            message:
              '@sumi-expect-error-file marker must come before the first code line',
          },
        ],
      },
    );
  });

  test('a code line inside a block comment does not end the header', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        /*
        const x = 1;
        */
        // @sumi-expect-error-file banned-syntax/no-var
        var x = 1;
      `).problems,
      [],
    );
  });

  test('a line-scoped marker is code-free and does not end the header', () => {
    assert.deepStrictEqual(
      parseMarkers(dedent`
        // @sumi-expect-error banned-syntax/no-var
        // @sumi-expect-error-file null/no-null-literal
        var x = null;
      `).expected.map(({ ruleId, line, markerLine }) => ({
        ruleId,
        line,
        markerLine,
      })),
      [
        { ruleId: 'null/no-null-literal', line: 0, markerLine: 2 },
        { ruleId: 'banned-syntax/no-var', line: 3, markerLine: 1 },
      ],
    );
  });
});
