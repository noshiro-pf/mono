import { DEFAULT_MUTABLE_PREFIXES } from 'ts-codemod-lib';
import { eslintFunctionalRules } from './eslint-functional-rules.mjs';

// What ESLint lets be mutated has to be what ts-codemod-lib leaves mutable:
// a name ESLint allows to mutate but the codemod makes readonly fails `tsc`
// after `fix:codemod`, and one the codemod leaves mutable but ESLint rejects
// cannot be written at all.
describe('the mutable prefixes agree with ts-codemod-lib', () => {
  const namePatterns = DEFAULT_MUTABLE_PREFIXES.map(
    (p) => `^${escapeRegExp(p)}`,
  );

  test('functional/immutable-data ignoreIdentifierPattern', () => {
    const [, option] = eslintFunctionalRules['functional/immutable-data'];

    // Every entry but these is a name prefix.
    const notPrefixes = new Set<string>([
      'this',
      'super',
      'window.location.href',
    ]);

    assert.deepStrictEqual(
      option.ignoreIdentifierPattern.filter((p) => !notPrefixes.has(p)),
      namePatterns,
    );
  });

  test('functional/immutable-data ignoreAccessorPattern', () => {
    const [, option] = eslintFunctionalRules['functional/immutable-data'];

    assert.deepStrictEqual(
      // a prefix of any property name, as `**.mut_**`
      option.ignoreAccessorPattern.filter((p) => /^\*\*\.[^.*]+\*\*$/u.test(p)),
      DEFAULT_MUTABLE_PREFIXES.map((p) => `**.${p}**`),
    );
  });

  test('functional/no-let ignoreIdentifierPattern', () => {
    const [, option] = eslintFunctionalRules['functional/no-let'];

    assert.deepStrictEqual<readonly string[]>(
      option.ignoreIdentifierPattern,
      namePatterns,
    );
  });
});

const escapeRegExp = (s: string): string =>
  s.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
