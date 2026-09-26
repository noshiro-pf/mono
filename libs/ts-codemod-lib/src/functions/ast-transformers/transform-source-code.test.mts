import { replaceAnyWithUnknownTransformer } from './replace-any-with-unknown.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const body = 'export const x: any = 1;\n';

const transformedBody = 'export const x: unknown = 1;\n';

const transform = (code: string): string =>
  transformSourceCode(code, false, [replaceAnyWithUnknownTransformer()]);

describe('transformSourceCode file-level ignore comments', () => {
  test.each([
    {
      name: 'no ignore comment',
      header: '',
      skipped: false,
    },
    {
      name: 'ignore all transformers',
      header: '/* transformer-ignore */\n',
      skipped: true,
    },
    {
      name: 'ignore all transformers without spaces',
      header: '/*transformer-ignore*/\n',
      skipped: true,
    },
    {
      name: 'ignore the running transformer',
      header: '/* transformer-ignore replace-any-with-unknown */\n',
      skipped: true,
    },
    {
      name: 'ignore the running transformer among others',
      header:
        '/* transformer-ignore append-as-const, replace-any-with-unknown */\n',
      skipped: true,
    },
    {
      name: 'ignore another transformer only',
      header: '/* transformer-ignore append-as-const */\n',
      skipped: false,
    },
    {
      name: 'ts-codemod-ignore prefix',
      header: '/* ts-codemod-ignore */\n',
      skipped: true,
    },
    {
      name: 'codemod-ignore prefix',
      header: '/* codemod-ignore replace-any-with-unknown */\n',
      skipped: true,
    },
    {
      name: 'transform-ignore prefix',
      header: '/* transform-ignore */\n',
      skipped: true,
    },
    {
      name: 'names on the first line and the terminator on the next',
      header: '/* transformer-ignore replace-any-with-unknown\n */\n',
      skipped: true,
    },
    {
      name: 'prefix on the first line and names on the next',
      header: '/*\n  transformer-ignore\n  replace-any-with-unknown */\n',
      skipped: true,
    },
    {
      name: 'names spanning several lines are not an ignore comment',
      header: '/* transformer-ignore append-as-const\n  note */\n',
      skipped: false,
    },
    {
      name: 'an unterminated comment is not an ignore comment',
      header: '// /* transformer-ignore\n',
      skipped: false,
    },
    {
      name: 'a later well-formed comment is found after a malformed one',
      header:
        '/* transformer-ignore a\n b */\n/* transformer-ignore replace-any-with-unknown */\n',
      skipped: true,
    },
    {
      name: 'prefixes are tried in order, not by position',
      header:
        '/* codemod-ignore */\n/* transformer-ignore append-as-const */\n',
      skipped: false,
    },
  ] as const)('$name', ({ header, skipped }) => {
    assert.strictEqual(
      transform(`${header}${body}`),
      `${header}${skipped ? body : transformedBody}`,
    );
  });

  test(
    'finishes in linear time on long whitespace runs in unterminated comments',
    { timeout: 2000 },
    () => {
      const header = `/* transformer-ignore${' '.repeat(2000)}x\nnote */\n`;

      assert.strictEqual(
        transform(`${header}${body}`),
        `${header}${transformedBody}`,
      );
    },
  );

  test(
    'finishes in linear time on many unterminated comments in one line',
    { timeout: 2000 },
    () => {
      const header = `export const s = \`${'/* transformer-ignore x '.repeat(10_000)}\`;\n`;

      assert.strictEqual(
        transform(`${header}${body}`),
        `${header}${transformedBody}`,
      );
    },
  );
});
