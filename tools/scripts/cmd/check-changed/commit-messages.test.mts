// cspell:ignore PCRE

import * as fs from 'node:fs';
import * as path from 'node:path';
import { projectRootPath } from '../../project-root-path.mjs';
import {
  checkCommitMessages,
  isConventionalSubject,
  pcreToRegExp,
  readJapanesePattern,
} from './commit-messages.mjs';

// eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path in this repository.
const workflow = fs.readFileSync(
  path.join(projectRootPath, '.github/workflows/lint-pull-request.yml'),
  'utf8',
);

/** Matches nothing: stands in for a pattern the first test reports missing. */
const NEVER = /$^/u;

describe('readJapanesePattern', () => {
  // The workflow's pattern itself, so that the two cannot drift: what it
  // rejects, this rejects.
  const found = readJapanesePattern(workflow);

  const pattern = found ?? NEVER;

  test('finds the pattern lint-pull-request.yml declares', () => {
    assert.isDefined(found);
  });

  test.each([
    ['ひらがな', 'hiragana'],
    ['カタカナ', 'katakana'],
    ['漢字', 'a CJK ideograph'],
    ['、', 'CJK punctuation'],
    ['（', 'a fullwidth form'],
  ])('matches %s (%s)', (text) => {
    assert.isTrue(pattern.test(`fix: ${text}`));
  });

  test.each([
    ['fix: an em dash — is fine', 'an em dash'],
    ['docs: “curly quotes” and café', 'curly quotes and an accent'],
    ['chore: plain text', 'plain text'],
  ])('does not match %s (%s)', (text) => {
    assert.isFalse(pattern.test(text));
  });

  test('is undefined for a workflow that no longer declares it', () => {
    assert.isUndefined(readJapanesePattern('env:\n  OTHER: x\n'));
  });
});

describe('pcreToRegExp', () => {
  test('turns the PCRE code point escape into the JavaScript one', () => {
    assert.strictEqual(
      pcreToRegExp(String.raw`[\x{3040}-\x{30FF}]`).source,
      String.raw`[\u{3040}-\u{30FF}]`,
    );
  });
});

describe('checkCommitMessages', () => {
  const japanesePattern = readJapanesePattern(workflow) ?? NEVER;

  test('one English, conventional commit passes', () => {
    assert.deepStrictEqual(
      checkCommitMessages({
        commits: [{ sha: 'a'.repeat(40), message: 'feat(x): add y\n\nBody.' }],
        japanesePattern,
      }),
      { errors: [], warnings: [] },
    );
  });

  test('names the commits whose message is not English, body included', () => {
    const result = checkCommitMessages({
      commits: [{ sha: '1234567890', message: 'fix: subject\n\n本文です' }],
      japanesePattern,
    });

    assert.lengthOf(result.errors, 1);

    assert.include(result.errors[0], '1234567 fix: subject /  / 本文です');
  });

  test('more than one commit fails, as "Validate commit count" does', () => {
    const result = checkCommitMessages({
      commits: [
        { sha: '1', message: 'feat: a' },
        { sha: '2', message: 'fix: b' },
      ],
      japanesePattern,
    });

    assert.lengthOf(result.errors, 1);

    assert.include(result.errors[0], 'The branch is 2 commits');
  });

  test('warns about a tip subject that is not Conventional Commits', () => {
    const result = checkCommitMessages({
      commits: [{ sha: '1', message: 'Add a thing' }],
      japanesePattern,
    });

    assert.deepStrictEqual(result.errors, []);

    assert.lengthOf(result.warnings, 1);
  });
});

describe('isConventionalSubject', () => {
  test.each([
    'feat: add',
    'fix(scope): mend',
    'refactor(a-b)!: change',
    'chore!: drop',
  ])('accepts %s', (subject) => {
    assert.isTrue(isConventionalSubject(subject));
  });

  test.each([
    'Add a thing',
    'feature: not a type',
    'fix:no space',
    'fix(): empty scope',
    'fix(a)(b): two scopes',
    'fix: ',
  ])('rejects %s', (subject) => {
    assert.isFalse(isConventionalSubject(subject));
  });
});
