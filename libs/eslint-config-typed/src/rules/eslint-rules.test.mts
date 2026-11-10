import { Linter } from 'eslint';
import { restrictedSyntax } from './eslint-rules.mjs';

const linter = new Linter();

const entry: Linter.RuleEntry =
  // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing -- the type `Arr.toUnshifted` returns is not assignable to `Linter.RuleEntry`
  ['error', ...restrictedSyntax] as const;

/** Lints `code` with `no-restricted-syntax` set to `restrictedSyntax`. */
const lintRestrictedSyntax = (code: string): readonly string[] =>
  linter
    .verify(code, { rules: { 'no-restricted-syntax': entry } }, 'file.mjs')
    .map((m) => m.message);

describe('restrictedSyntax', () => {
  // `Object.hasOwn` alone answers `false` for what `in` finds on the prototype
  // chain (a method, a DOM accessor, a Promise's `then`), so a message naming it
  // alone leaves those checks a lint disable as the only way to write them.
  test('reports `key in obj` naming an own-property and an inherited-property replacement', () => {
    const messages = lintRestrictedSyntax('export const f = (o, k) => k in o;');

    assert.lengthOf(messages, 1);

    assert.include(messages[0], 'Object.hasOwn');

    assert.include(messages[0], 'Reflect.has');
  });

  // A private brand check has no replacement: neither `Object.hasOwn` nor
  // `Reflect.has` can name a private field.
  test('leaves `#field in obj` alone', () => {
    assert.deepStrictEqual(
      lintRestrictedSyntax(
        'export class Widget { #brand = 0; static is(o) { return #brand in o; } }',
      ),
      [],
    );
  });
});
