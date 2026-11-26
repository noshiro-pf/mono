import { expectType } from 'ts-data-forge';
import {
  fillPlaceholders,
  placeholdersIn,
  type PlaceholdersOf,
  type WithPlaceholders,
} from '../src/index.mjs';

describe('PlaceholdersOf', () => {
  test('names each `{name}` once', () => {
    expectType<PlaceholdersOf<'Hello, {name}!'>, 'name'>('=');

    expectType<PlaceholdersOf<'{a} and {b}, then {a}'>, 'a' | 'b'>('=');

    expectType<PlaceholdersOf<'no placeholders'>, never>('=');
  });

  test('reads the innermost braces, as the run-time scan does', () => {
    expectType<PlaceholdersOf<'{{a}}'>, 'a'>('=');

    expectType<PlaceholdersOf<'a {b {c} d}'>, 'c'>('=');

    expectType<PlaceholdersOf<'{} is empty'>, never>('=');
  });

  test('a string that is not a literal has none', () => {
    expectType<PlaceholdersOf<string>, never>('=');
  });
});

describe('WithPlaceholders', () => {
  test('is a string containing every placeholder', () => {
    expectType<WithPlaceholders<never>, string>('=');

    expectType<
      WithPlaceholders<'a' | 'b'>,
      `${string}{a}${string}` & `${string}{b}${string}`
    >('=');

    expectType<'{b} then {a}', WithPlaceholders<'a' | 'b'>>('<=');

    expectType<'{a} only', WithPlaceholders<'a' | 'b'>>('!<=');
  });
});

describe(placeholdersIn, () => {
  test('lists the placeholders in order of first appearance', () => {
    assert.deepStrictEqual(placeholdersIn('{a} and {b}, then {a}'), ['a', 'b']);
  });

  test('agrees with PlaceholdersOf on nested and empty braces', () => {
    assert.deepStrictEqual(placeholdersIn('{{a}}'), ['a']);

    assert.deepStrictEqual(placeholdersIn('a {b {c} d}'), ['c']);

    assert.deepStrictEqual(placeholdersIn('{} is empty'), []);
  });
});

describe(fillPlaceholders, () => {
  test('replaces every occurrence', () => {
    assert.strictEqual(
      fillPlaceholders('{a} and {b}, then {a}', { a: 'x', b: 2 }),
      'x and 2, then x',
    );
  });

  test('keeps the text around nested braces', () => {
    assert.strictEqual(fillPlaceholders('{{a}}', { a: 'x' }), '{x}');
  });

  test('leaves a placeholder with no value as written', () => {
    assert.strictEqual(fillPlaceholders('{a} {b}', { a: 'x' }), 'x {b}');
  });

  test('does not read a value through the prototype', () => {
    assert.strictEqual(fillPlaceholders('{toString}', {}), '{toString}');
  });

  test('a value that looks like a placeholder is not filled again', () => {
    assert.strictEqual(
      fillPlaceholders('{a} {b}', { a: '{b}', b: 'y' }),
      '{b} y',
    );
  });
});
