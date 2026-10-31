// cspell:ignore adipiscing amet eiusmod elit incididunt tempor unconfigured
import parser from '@typescript-eslint/parser';
import { RuleTester, type ValidTestCase } from '@typescript-eslint/rule-tester';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import { noRaggedCommentWrap } from './no-ragged-comment-wrap.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

const lines = (...xs: readonly string[]): string => xs.join('\n');

/** One temporary directory per run, holding a directory per fixture. */
const temporaryRoot = mkdtempSync(
  path.join(tmpdir(), 'no-ragged-comment-wrap-'),
);

/**
 * `file` (a path relative to a fresh directory) in a directory holding `files`,
 * so that the nearest Prettier configuration is the one the test writes.
 */
const fileBeside = (
  files: ReadonlyRecord<string, string>,
  file = 'file.ts',
): string => {
  const dir = mkdtempSync(path.join(temporaryRoot, 'case-'));

  for (const [name, content] of Object.entries(files)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- inside a fresh temporary directory
    mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- inside a fresh temporary directory
    writeFileSync(path.join(dir, name), content);
  }

  return path.join(dir, file);
};

/**
 * A file whose nearest Prettier configuration sets nothing, so that the cases
 * that name no file get 80 whatever lies above the temporary directory.
 */
const unconfigured = fileBeside({ '.prettierrc': '{}' });

type Options = readonly [Readonly<{ printWidth?: number }>?];

const inUnconfigured = <T extends ValidTestCase<Options>>(
  cases: readonly T[],
): readonly T[] => cases.map((c) => ({ filename: unconfigured, ...c }));

describe('no-ragged-comment-wrap', () => {
  tester.run('no-ragged-comment-wrap', noRaggedCommentWrap, {
    valid: inUnconfigured([
      {
        name: 'a filled paragraph with a short last line',
        code: lines(
          '// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
          '// tempor incididunt ut labore.',
          'export {};',
        ),
      },
      {
        name: 'a line ending a sentence',
        code: lines(
          '// One sentence on its own line.',
          '// Another one that follows it.',
          'export {};',
        ),
      },
      {
        name: 'a line ending with a colon',
        code: lines('// It does three things:', '// reads, then writes.'),
      },
      {
        name: 'a blank comment line ends the paragraph',
        code: lines('// First paragraph', '//', '// second paragraph'),
      },
      {
        name: 'list items',
        code: lines(
          '// Steps',
          '// - read the file',
          '// - write it back',
          '// 1. first',
          '// 2. second',
        ),
      },
      {
        name: 'indented lines',
        code: lines('// For example', '//   const x = 1', '// and so on'),
      },
      {
        name: 'a URL',
        code: lines('// See', '// https://example.com/a for more'),
      },
      {
        name: 'directives',
        code: lines(
          '// cspell:ignore foo',
          '// @ts-expect-error short',
          '// prettier-ignore',
          '// transformer-ignore-next-line',
          'export {};',
        ),
      },
      {
        name: 'a marker and a label',
        code: lines(
          '// embed-sample-code-ignore-above',
          '// ok',
          '// banned-syntax',
          '// next',
        ),
      },
      {
        name: 'commented-out code',
        code: lines(
          '// const a = [];',
          '// a.push(1); // Error',
          '// f(x) => g',
          '// ok',
        ),
      },
      {
        name: 'a line after it starting with a capital',
        code: lines('// Fetch the rows from the server', '// Render them'),
      },
      {
        name: 'two lines ending with commas',
        code: lines('// hmFromDate,', '// hoursMinutesDefaultValue,'),
      },
      {
        name: 'an arrow mapping inside a line',
        code: lines('// public -> public readonly', '// protected'),
      },
      {
        name: 'a file path alone',
        code: lines('// src/types/dice.ts', '// no import needed'),
      },
      {
        name: 'a one-word label',
        code: lines('// readonly', '// `append-as-const` is a codemod'),
      },
      {
        name: 'a spread line',
        code: lines('// using the globals', '// ...globals.jest'),
      },
      {
        name: 'an arrow line',
        code: lines('// `a | b`', '// -> `b | a`'),
      },
      {
        name: 'East Asian text',
        code: lines('// 日本語の', '// 文章'),
      },
      {
        name: 'trailing comments after code',
        code: lines('const a = 1; // short', 'const b = 2; // short'),
      },
      {
        name: 'comments in different columns',
        code: lines('// short', 'const f = (): void => {', '  // short', '};'),
      },
      {
        name: 'comments on lines that are not consecutive',
        code: lines('// short', '', '// short'),
      },
      {
        name: 'a license header',
        code: lines(
          '// Copyright (c) Example',
          '// Licensed under MIT',
          'export {};',
        ),
      },
      {
        name: 'a preserved block',
        code: lines('/*!', ' * short', ' * short', ' */', 'export {};'),
      },
      {
        name: 'JSDoc tags and what follows them',
        code: lines(
          '/**',
          ' * @param a The first',
          ' * value.',
          ' * @returns short',
          ' *   short',
          ' */',
          'export {};',
        ),
      },
      {
        name: 'a fenced code block in JSDoc',
        code: lines(
          '/**',
          ' * ```ts',
          ' * const a',
          ' * const b',
          ' * ```',
          ' */',
          'export {};',
        ),
      },
      {
        name: 'a block comment not in the JSDoc style',
        code: lines('/*', 'short', 'short', '*/', 'export {};'),
      },
      {
        name: 'a single-line block comment',
        code: '/** short */ export {};',
      },
      {
        name: 'a code span that does not fit is one word',
        code: lines(
          '/**',
          ' * Casts a string after checking that its length is within the range',
          ' * `[minLength, maxLength]`.',
          ' */',
          'export {};',
        ),
      },
      {
        name: 'commented-out calls',
        code: lines('// expect(a, b)', '// expect(c, d)'),
      },
      {
        name: 'a Markdown hard line break',
        code: lines('/**', ' * line one with break\\', ' * line two', ' */'),
      },
      {
        name: 'two trailing spaces as a hard line break',
        code: lines('// line one  ', '// line two'),
      },
      {
        name: 'an emoji',
        code: lines('// ✅ done', '// and more'),
      },
      {
        name: 'a lone backtick',
        code: lines('// the ` char marks', '// code in `foo` and the rest'),
      },
      {
        name: 'tab indentation',
        code: lines(
          'function f(): void {',
          '\t// Lorem ipsum',
          '\t// dolor sit amet',
          '}',
        ),
      },
      {
        name: 'a shared configuration named in package.json gives 80',
        code: lines(
          '// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
          '// tempor',
        ),
        filename: fileBeside(
          {
            '.prettierrc': '{ "printWidth": 40 }',
            'sub/package.json': '{ "prettier": "@org/prettier-config" }',
          },
          'sub/file.ts',
        ),
      },
      {
        name: 'a configuration in a directory above the file',
        code: lines('// Lorem ipsum dolor sit amet,', '// consectetur'),
        filename: fileBeside(
          { '.prettierrc': '{ "printWidth": 40 }' },
          'sub/dir/file.ts',
        ),
      },
      {
        name: 'a package.json with no prettier key is passed over',
        code: lines('// Lorem ipsum dolor sit amet,', '// consectetur'),
        filename: fileBeside({
          'package.json': '{ "name": "a" }',
          '.prettierrc': '{ "printWidth": 40 }',
        }),
      },
      {
        name: "package.json's prettier key comes before .prettierrc",
        code: lines('// Lorem ipsum dolor sit amet,', '// consectetur'),
        filename: fileBeside({
          'package.json': '{ "prettier": { "printWidth": 40 } }',
          '.prettierrc': '{ "printWidth": 120 }',
        }),
      },
      {
        name: 'the word carried down with a sensitive word is a whole code span',
        code: lines('/**', ' * cc c', ' * `x y` @tag', ' */'),
        options: [{ printWidth: 14 }],
      },
      {
        name: 'a directive the rule does not list',
        code: lines(
          '// The type is not known here',
          '// deno-lint-ignore no-explicit-any',
        ),
      },
      {
        name: 'a no-break space is part of a word',
        code: lines(
          '// the distance is about ten\u{A0}km from the long',
          '// gate',
        ),
        options: [{ printWidth: 40 }],
      },
      {
        name: 'a tag on the opening line of a JSDoc block',
        code: lines('/** @example', ' * a + b', ' * makes three', ' */'),
      },
      {
        name: 'a link reference definition',
        code: lines(
          '/**',
          ' * See the docs for more',
          ' * [docs]: ./readme.md',
          ' */',
        ),
      },
      {
        name: 'a sentence ending before a closing parenthesis',
        code: lines(
          '// Returns the value (or the default.)',
          '// `undefined` when missing.',
        ),
      },
      {
        name: 'a fence closed only by its own marker',
        code: lines(
          '/**',
          ' * ~~~md',
          ' * ```ts',
          ' * some text in the',
          ' * markdown sample',
          ' * ~~~',
          ' */',
        ),
      },
      {
        name: 'a word ending with a backslash',
        code: lines('// a path C:\\dir\\', '// and more'),
      },
      {
        name: 'a configuration that is not JSON stops the search',
        code: lines(
          '// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
          '// tempor',
        ),
        filename: fileBeside(
          {
            '.prettierrc': '{ "printWidth": 40 }',
            'sub/.prettierrc.yaml': 'printWidth: 40\n',
          },
          'sub/file.ts',
        ),
      },
      {
        name: 'a wider print width from the options',
        code: lines(
          '// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do',
          '// eiusmod',
        ),
        options: [{ printWidth: 60 }],
      },
      {
        name: 'a print width from the nearest Prettier configuration',
        code: lines('// Lorem ipsum dolor sit amet,', '// consectetur'),
        filename: fileBeside({ '.prettierrc': '{ "printWidth": 40 }' }),
      },
      {
        name: "a print width from package.json's prettier key",
        code: lines('// Lorem ipsum dolor sit amet,', '// consectetur'),
        filename: fileBeside({
          'package.json': '{ "prettier": { "printWidth": 40 } }',
        }),
      },
    ]),
    invalid: inUnconfigured([
      {
        name: 'a line comment run',
        code: lines(
          '// Lorem ipsum dolor sit amet,',
          '// consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et',
          '// dolore magna aliqua.',
          'export {};',
        ),
        output: lines(
          '// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
          '// tempor incididunt ut labore et dolore magna aliqua.',
          'export {};',
        ),
        errors: [
          {
            messageId: 'raggedWrap',
            line: 1,
            data: { word: 'consectetur', printWidth: 80 },
          },
        ],
      },
      {
        name: 'an indented line comment run',
        code: lines(
          'const f = (): void => {',
          '  // Lorem ipsum',
          '  // dolor sit amet.',
          '};',
        ),
        output: lines(
          'const f = (): void => {',
          '  // Lorem ipsum dolor sit amet.',
          '};',
        ),
        errors: [{ messageId: 'raggedWrap', line: 2 }],
      },
      {
        name: 'a JSDoc block, indented',
        code: lines(
          'class C {',
          '  /**',
          '   * Lorem ipsum dolor sit amet, consectetur',
          '   * adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
          '   * magna aliqua.',
          '   *',
          '   * @returns short',
          '   */',
          '  m(): void {}',
          '}',
        ),
        output: lines(
          'class C {',
          '  /**',
          '   * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
          '   * tempor incididunt ut labore et dolore magna aliqua.',
          '   *',
          '   * @returns short',
          '   */',
          '  m(): void {}',
          '}',
        ),
        errors: [{ messageId: 'raggedWrap', line: 3 }],
      },
      {
        name: 'the fix stops at a sentence end',
        code: lines(
          '// Lorem ipsum',
          '// dolor sit amet.',
          '// Consectetur adipiscing',
          '// elit.',
        ),
        output: lines(
          '// Lorem ipsum dolor sit amet.',
          '// Consectetur adipiscing elit.',
        ),
        errors: [
          { messageId: 'raggedWrap', line: 1 },
          { messageId: 'raggedWrap', line: 3 },
        ],
      },
      {
        name: 'the fix stops at a list',
        code: lines(
          '// Lorem ipsum',
          '// dolor sit amet',
          '// - item',
          '// - item',
        ),
        output: lines(
          '// Lorem ipsum dolor sit amet',
          '// - item',
          '// - item',
        ),
        errors: [{ messageId: 'raggedWrap', line: 1 }],
      },
      {
        name: 'a code span is never broken by the fix',
        code: lines(
          '// Lorem ipsum',
          '// dolor sit amet, `consectetur adipiscing elit` sed do eiusmod tempor incididunt',
        ),
        output: lines(
          '// Lorem ipsum dolor sit amet, `consectetur adipiscing elit` sed do eiusmod',
          '// tempor incididunt',
        ),
        errors: [{ messageId: 'raggedWrap', line: 1 }],
      },
      {
        name: 'the fix never starts a line with a JSDoc tag',
        code: lines(
          '/**',
          ' * Use this when the',
          ' * caller is @internal and so on',
          ' */',
        ),
        output: lines(
          '/**',
          ' * Use this when the caller',
          ' * is @internal and so on',
          ' */',
        ),
        options: [{ printWidth: 30 }],
        errors: [{ messageId: 'raggedWrap', line: 2 }],
      },
      {
        name: 'the fix never starts a line with a list marker',
        code: lines('// alpha beta', '// gamma - delta epsilon'),
        output: lines('// alpha beta', '// gamma - delta', '// epsilon'),
        options: [{ printWidth: 20 }],
        errors: [{ messageId: 'raggedWrap', line: 1 }],
      },
      {
        name: 'the fix never starts a line with a directive',
        code: lines(
          '// Do not add',
          '// an eslint-disable-next-line here but fix it',
        ),
        output: lines(
          '// Do not add',
          '// an eslint-disable-next-line',
          '// here but fix it',
        ),
        options: [{ printWidth: 20 }],
        errors: [{ messageId: 'raggedWrap', line: 1 }],
      },
      {
        name: 'two sensitive words in a row both stay off the line start',
        code: lines(
          '/**',
          ' * use it',
          ' * with annotations @internal @alpha and so on',
          ' */',
        ),
        output: lines(
          '/**',
          ' * use it with',
          ' * annotations @internal @alpha',
          ' * and so on',
          ' */',
        ),
        options: [{ printWidth: 25 }],
        errors: [{ messageId: 'raggedWrap', line: 2 }],
      },
      {
        name: 'the fix never starts a line with a quote or an HTML block',
        code: lines('// the value must', '// be >= 0 and in a <div> element'),
        output: lines(
          '// the value must',
          '// be >= 0 and in',
          '// a <div> element',
        ),
        options: [{ printWidth: 22 }],
        errors: [{ messageId: 'raggedWrap', line: 1 }],
      },
      {
        name: 'a paragraph ending in a hard-break backslash is still refilled',
        code: lines(
          '/**',
          ' * Lorem ipsum',
          ' * dolor sit\\',
          ' * next line',
          ' */',
        ),
        output: lines(
          '/**',
          ' * Lorem ipsum dolor sit\\',
          ' * next line',
          ' */',
        ),
        errors: [{ messageId: 'raggedWrap', line: 2 }],
      },
      {
        name: 'no fix in a file with CRLF line endings',
        code: '// Lorem ipsum\r\n// dolor sit amet\r\nexport {};\r\n',
        output: null,
        errors: [{ messageId: 'raggedWrap' }],
      },
      {
        name: 'a word longer than the width gets its own line',
        code: lines(
          '// some words',
          '// here and',
          '// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa tail',
        ),
        output: lines(
          '// some words here and',
          '// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          '// tail',
        ),
        options: [{ printWidth: 40 }],
        errors: [{ messageId: 'raggedWrap', line: 1 }],
      },
      {
        name: 'a narrower print width from the options',
        code: lines(
          '// Lorem ipsum dolor sit amet,',
          '// consectetur adipiscing elit',
        ),
        output: lines(
          '// Lorem ipsum dolor sit amet, consectetur',
          '// adipiscing elit',
        ),
        options: [{ printWidth: 50 }],
        errors: [{ messageId: 'raggedWrap', line: 1 }],
      },
      {
        name: 'a narrower print width from the nearest Prettier configuration',
        code: lines('// Lorem ipsum', '// dolor sit amet, consectetur'),
        output: lines('// Lorem ipsum dolor sit amet,', '// consectetur'),
        filename: fileBeside({ '.prettierrc.json': '{ "printWidth": 32 }' }),
        errors: [
          { messageId: 'raggedWrap', data: { word: 'dolor', printWidth: 32 } },
        ],
      },
      {
        name: 'a Prettier configuration that is not JSON leaves the default',
        code: lines('// Lorem ipsum', '// dolor'),
        output: lines('// Lorem ipsum dolor'),
        filename: fileBeside({ '.prettierrc': 'printWidth: 10\n' }),
        errors: [
          { messageId: 'raggedWrap', data: { word: 'dolor', printWidth: 80 } },
        ],
      },
    ]),
  });
});
