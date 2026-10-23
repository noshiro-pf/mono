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
