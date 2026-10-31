import parser from '@typescript-eslint/parser';
import dedent from 'dedent';
import { Linter } from 'eslint';
import { findDirectivesIn } from './check-oxlint-rules.mjs';

describe(findDirectivesIn, () => {
  test('reads the rules of a line directive, up to its reason', () => {
    assert.deepStrictEqual(
      findDirectivesIn(
        dedent`
          // eslint-disable-next-line no-new, no-param-reassign -- why
          const a = 1; // eslint-disable-line no-new --- why
        `,
        'a.ts',
      ),
      [
        { line: 1, ruleIds: ['no-new', 'no-param-reassign'] },
        { line: 2, ruleIds: ['no-new'] },
      ],
    );
  });

  test('reads a block directive up to its `*/`, so a JSX comment yields no `}`', () => {
    assert.deepStrictEqual(
      findDirectivesIn(
        dedent`
          const a = (
            <div>
              {/* eslint-disable-next-line no-new */}
              {/* eslint-disable-line no-new -- why */}
            </div>
          );
        `,
        'a.tsx',
      ),
      [
        { line: 3, ruleIds: ['no-new'] },
        { line: 4, ruleIds: ['no-new'] },
      ],
    );
  });

  test('reads a block directive whose rule list starts on the next line', () => {
    assert.deepStrictEqual(
      findDirectivesIn(
        dedent`
          /* eslint-disable
             no-new,
             no-param-reassign
          */
        `,
        'a.ts',
      ),
      [{ line: 1, ruleIds: ['no-new', 'no-param-reassign'] }],
    );
  });

  test('unquotes a quoted rule id', () => {
    assert.deepStrictEqual(
      findDirectivesIn(
        '// eslint-disable-next-line \'no-new\', "no-param-reassign"\n',
        'a.ts',
      ),
      [{ line: 1, ruleIds: ['no-new', 'no-param-reassign'] }],
    );
  });

  test('a directive naming no rule names none, and other comments are not directives', () => {
    assert.deepStrictEqual(
      findDirectivesIn(
        dedent`
          /* eslint-disable */
          // eslint-disable-next-line
          // eslint-disabled-thing no-new
          // see eslint-disable-next-line no-new
          /* eslint-enable no-new */
        `,
        'a.ts',
      ),
      [
        { line: 1, ruleIds: [] },
        { line: 2, ruleIds: [] },
      ],
    );
  });

  test('ignores what ESLint ignores: strings, a plain line `eslint-disable`, a multi-line `-line` block', () => {
    assert.deepStrictEqual(
      findDirectivesIn(
        dedent`
          const s = '/* eslint-disable no-new';
          const t = \`// eslint-disable-next-line no-new\`;
          // eslint-disable no-new
          /* eslint-disable-line no-new,
             no-param-reassign */
          // eslint-disable-next-line no-shadow
        `,
        'a.ts',
      ),
      [{ line: 6, ruleIds: ['no-shadow'] }],
    );
  });

  test('reads a `.ts` cast without taking it for JSX', () => {
    assert.deepStrictEqual(
      findDirectivesIn(
        dedent`
          const a = <number>(1 as unknown);
          // eslint-disable-next-line no-new
        `,
        'a.ts',
      ),
      [{ line: 2, ruleIds: ['no-new'] }],
    );
  });
});

describe('findDirectivesIn agrees with ESLint', () => {
  test.each([
    {
      file: 'a.ts',
      text: dedent`
        // eslint-disable-next-line no-new, no-param-reassign -- why
        const a = 1; // eslint-disable-line no-new --- why
        const s = '/* eslint-disable no-shadow';
        // eslint-disable no-shadow
        /* eslint-disable-line no-new,
           no-param-reassign */
        // eslint-disable-next-line 'no-shadow', "no-undef"
        // see eslint-disable-next-line no-new
        /* eslint-disable
           no-eval,
           no-alert -- why
        */
        const b = <number>(1 as unknown); // eslint-disable-line no-new
      `,
      // Two rules each on lines 1, 7 and 9, one on lines 2 and 13.
      count: 8,
    },
    {
      file: 'a.tsx',
      text: dedent`
        const a = (
          <div title="/* eslint-disable no-shadow */">
            {/* eslint-disable-next-line no-new */}
            {/* eslint-disable-line no-eval -- why */}
            // eslint-disable-next-line no-alert
          </div>
        );
      `,
      count: 2,
    },
  ])('on $file', ({ file, text, count }) => {
    const expected = eslintReads(text, file);

    assert.lengthOf(expected, count);

    assert.deepStrictEqual(
      findDirectivesIn(text, file)
        .flatMap(({ line, ruleIds }) =>
          ruleIds.map((ruleId) => `${line} ${ruleId}`),
        )
        .toSorted(),
      expected.toSorted(),
    );
  });
});

/**
 * `line ruleId` for each rule a directive in `text` (of `file`) names, as ESLint reads
 * them: with no rule on, every directive disables nothing, and ESLint reports
 * each with the rules it names.
 */
const eslintReads = (text: string, file: string): readonly string[] => {
  const linter = new Linter();

  return linter
    .verify(
      text,
      [
        {
          files: ['**/*.ts', '**/*.tsx'],
          languageOptions: { parser },
          linterOptions: { reportUnusedDisableDirectives: 'error' },
        },
      ],
      file,
    )
    .flatMap(({ line, message }) =>
      Array.from(
        message.matchAll(/'(?<ruleId>[^']+)'/gu),
        (match) => `${line} ${match.groups?.['ruleId'] ?? ''}`,
      ),
    );
};
