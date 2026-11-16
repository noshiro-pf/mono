import {
  CLOSING_ISSUE_NUMBER,
  closingKeywordBefore,
} from './closing-keywords.mjs';

describe(closingKeywordBefore, () => {
  const pattern = closingKeywordBefore(
    String.raw`#(?<n>${CLOSING_ISSUE_NUMBER})`,
  );

  test.each([
    'closes #1',
    'fixed: #1',
    'resolve :#1',
    'fix\t#1',
    'fixes#1',
    'auto-closes #1',
    'done.fixes #1',
  ])('reads %s', (text) => {
    assert.strictEqual(firstMatch(pattern, text)?.groups?.['n'], '1');
  });

  test.each([
    'closes\n#1',
    'prefixes #1',
    'o/fix#1',
    'https://example.com/how-to-fix#1',
    'see ?q=fix#1',
    'Closes #1',
    'clo\u{17F}es #1',
    'fixes #0',
    'fixes #00',
    'fixes #1a',
  ])('reads no keyword in %j', (text) => {
    assert.isUndefined(firstMatch(pattern, text));
  });

  test('reads nothing between a keyword and owner/repo#N as no separator', () => {
    const repoPattern = closingKeywordBefore(String.raw`[\w.-]+\/[\w.-]+#\d+`);

    assert.isDefined(firstMatch(repoPattern, 'fixes o/r#1'));

    assert.isUndefined(firstMatch(repoPattern, 'fixed/r#1'));
  });

  test('puts the keyword before every alternative of a reference', () => {
    const either = closingKeywordBefore(String.raw`#(?<n>\d+)|gh-(?<g>\d+)`);

    assert.isUndefined(firstMatch(either, 'see gh-5'));

    assert.strictEqual(firstMatch(either, 'fixes gh-5')?.groups?.['g'], '5');
  });

  test('reads #01 as a number', () => {
    assert.strictEqual(firstMatch(pattern, 'fixes #01')?.groups?.['n'], '01');
  });
});

/** The first match, read without the pattern's `lastIndex`. */
const firstMatch = (
  pattern: RegExp,
  text: string,
): RegExpExecArray | undefined => text.matchAll(pattern).next().value;
