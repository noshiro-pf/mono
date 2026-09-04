import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferDedent } from './prefer-dedent.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

/**
 * The fixtures are lists of source lines rather than template literals,
 * because most of them contain a template literal themselves and nesting the
 * two costs more in backslashes than it saves.
 */
const lines = (...xs: readonly string[]): string => xs.join('\n');

/**
 * The pieces of one fixture line, concatenated. A fixture that needs a
 * substitution has its `${` split across two pieces, so that no string in this
 * file contains the sequence — `no-template-curly-in-string` reads that as a
 * mistake — and no template in it has to escape one, which would leave a
 * template with no substitution left for `@stylistic/quotes` to allow.
 */
const parts = (...xs: readonly string[]): string => xs.join('');

describe('prefer-dedent', () => {
  tester.run('prefer-dedent', preferDedent, {
    valid: [
      {
        name: 'single-line template literal',
        code: 'const a = `plain`;',
      },
      {
        name: 'single-line template literal with a substitution',
        code: parts('const a = `--$', '{kind}`;'),
      },
      {
        name: 'line break written as an escape, on one source line',
        code: 'const a = `first\\nsecond`;',
      },
      {
        name: 'tagged template spanning lines',
        code: lines('const a = dedent`', '  first', '  second', '`;'),
      },
      {
        name: 'tagged template with a tag other than dedent',
        code: lines('const a = String.raw`first', 'second`;'),
      },
      {
        name: 'lines built from an array',
        code: String.raw`const a = ['first', 'second'].join('\n');`,
      },
      {
        name: 'a template literal broken across lines only by the formatter',
        code: lines('const a = `${first(', '  argument,', ')}`;'),
      },
    ],
    invalid: [
      {
        name: 'template literal spanning two source lines',
        code: lines('const a = `first', 'second`;'),
        errors: [{ messageId: 'preferDedent' }],
      },
      {
        name: 'template literal carrying the surrounding indentation',
        code: lines(
          'const f = () => {',
          '  return `first',
          '    second`;',
          '};',
        ),
        errors: [{ messageId: 'preferDedent' }],
      },
      {
        name: 'multi-line template literal with a substitution',
        code: lines(parts('const a = `first $', '{x}'), 'second`;'),
        errors: [{ messageId: 'preferDedent' }],
      },
      {
        name: 'line break in a later quasi',
        code: lines(parts('const a = `$', '{x} first'), 'second`;'),
        errors: [{ messageId: 'preferDedent' }],
      },
      {
        name: 'the quasi of a nested untagged template',
        code: lines('const a = dedent`${`first', 'second`}`;'),
        errors: [{ messageId: 'preferDedent' }],
      },
    ],
  });
});
