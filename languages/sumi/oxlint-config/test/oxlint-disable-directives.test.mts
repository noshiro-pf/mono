import dedent from 'dedent';
import { findSumiSilencingDirectives } from '../src/index.mjs';

describe(findSumiSilencingDirectives, () => {
  test('a directive naming a rule of the preset is reported with the marker to use', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        // oxlint-disable-next-line sumi/no-throw
        throw new Error('x');
      `),
      [
        {
          line: 1,
          message:
            '`oxlint-disable-next-line` silences `sumi(no-throw)`, which `sumi check` enforces. Use `// @sumi-expect-error exceptions/no-throw` instead (D-60).',
        },
      ],
    );
  });

  test('oxlint matches a rule by the last segment of its name, so any plugin prefix is reported', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        // oxlint-disable-next-line total-functions/no-unsafe-type-assertion
        export const s = u as string;
      `).map(({ line }) => line),
      [1],
    );
  });

  test('every form of the directive is read', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        /* oxlint-disable no-var */
        var a = 1; // oxlint-disable-line no-var
        /* oxlint-disable-next-line no-var -- a reason */
        var b = 1;
        // oxlint-disable-line eslint/no-var, no-console
      `).map(({ line }) => line),
      [1, 2, 3, 5],
    );
  });

  test('a directive naming no rule silences every rule, Sumi’s among them', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        /* oxlint-disable */
        // oxlint-disable-next-line -- a reason
        var a = 1;
      `),
      [
        {
          line: 1,
          message:
            '`oxlint-disable` names no rule, so it silences every rule `sumi check` enforces. Use `// @sumi-expect-error <rule-id>` instead (D-60).',
        },
        {
          line: 2,
          message:
            '`oxlint-disable-next-line` names no rule, so it silences every rule `sumi check` enforces. Use `// @sumi-expect-error <rule-id>` instead (D-60).',
        },
      ],
    );
  });

  test('a block comment whose directive starts on a later line is read, as oxlint trims it', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        const a = 1;
        /*
          oxlint-disable
        */
        debugger;
        /*
          oxlint-disable no-var
        */
        var b = 1;
      `),
      [
        {
          line: 2,
          message:
            '`oxlint-disable` names no rule, so it silences every rule `sumi check` enforces. Use `// @sumi-expect-error <rule-id>` instead (D-60).',
        },
        {
          line: 6,
          message:
            '`oxlint-disable` silences `eslint(no-var)`, which `sumi check` enforces. Use `// @sumi-expect-error banned-syntax/no-var` instead (D-60).',
        },
      ],
    );
  });

  test('a block comment may list its rules over several lines', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        /* oxlint-disable no-console,
           no-var */
        var a = 1;
      `).map(({ line }) => line),
      [1],
    );
  });

  test('a line comment ends at its line', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        //
        oxlint-disable no-var
      `),
      [],
    );
  });

  test('a comment opened straight after a block comment closes is read', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        var a = 1; /* x */// oxlint-disable-line no-var
        /* x *//* oxlint-disable no-var */
      `).map(({ line }) => line),
      [1, 2],
    );
  });

  test('a line comment ends at any line terminator, as JavaScript ends it', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(
        '// oxlint-disable-next-line no-var\u{2028}var a = 1;\n// oxlint-disable-next-line no-var\rvar b = 1;',
      ).map(({ line }) => line),
      [1, 2],
    );
  });

  test('directives far apart are reported on their own lines', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        // oxlint-disable-next-line no-var
        var a = 1;

        // a comment
        const b = 2;
        /* oxlint-disable no-var */
        // oxlint-disable-line no-var
      `).map(({ line }) => line),
      [1, 6, 7],
    );
  });

  test('the second `/` of a `//` opens no comment of its own', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        /// oxlint-disable no-var
        //// oxlint-disable no-var
      `),
      [],
    );
  });

  test('a block comment left open runs to the end of the source', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(
        'const a = 1;\n/* oxlint-disable\nno-var',
      ).map(({ line }) => line),
      [2],
    );
  });

  test('a stray `/*` does not hide a directive after it', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        const glob = 'src/*';
        /* oxlint-disable no-var */
      `).map(({ line }) => line),
      [2],
    );
  });

  test('a source with CRLF line endings is read the same way', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(
        'const a = 1;\r\n/*\r\n  oxlint-disable no-var\r\n*/\r\n// oxlint-disable-next-line no-var\r\n',
      ).map(({ line }) => line),
      [2, 5],
    );
  });

  test('a directive naming only rules outside the preset is left alone', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        // oxlint-disable-next-line no-console
        console.log(1);
        /* oxlint-enable */
        // eslint-disable-next-line no-var
        var a = 1;
      `),
      [],
    );
  });

  test('text that only mentions a directive is not one', () => {
    assert.deepStrictEqual(
      findSumiSilencingDirectives(dedent`
        // A file may not use oxlint-disable no-var here.
        // \`oxlint-disable\` is reported.
        const doc = 'see oxlint-disable';
      `),
      [],
    );
  });
});
