import { expectType } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { checkTranslation, type TranslationOf } from '../src/index.mjs';

const en = {
  title: 'Event schedule',
  greeting: 'Hello, {name}!',
  answers: {
    count: (p: Readonly<{ n: number }>) =>
      p.n === 1 ? ('1 answer' as const) : (`${p.n} answers` as const),
  },
  deadline: 'Answer by {date}',
} as const;

describe('TranslationOf', () => {
  test('keeps the keys and nesting, and the placeholders of each string', () => {
    expectType<
      TranslationOf<typeof en>,
      Readonly<{
        title: string;
        greeting: `${string}{name}${string}`;
        answers: Readonly<{
          count: (params: Readonly<{ n: number }>) => string;
        }>;
        deadline: `${string}{date}${string}`;
      }>
    >('=');
  });

  test('a translation written with `satisfies` checks against it', () => {
    const ja = {
      title: '日程調整',
      greeting: 'こんにちは、{name}さん',
      answers: { count: (p) => `${p.n} 件の回答` },
      deadline: '{date} までに回答',
    } as const satisfies TranslationOf<typeof en>;

    expectType<typeof ja, TranslationOf<typeof en>>('<=');

    assert.deepStrictEqual(checkTranslation(en, ja), []);

    expectType<
      Readonly<{
        title: '日程調整';
        greeting: 'こんにちは、{nam}さん';
        answers: Readonly<{ count: (p: Readonly<{ n: number }>) => string }>;
        deadline: '{date}';
      }>,
      TranslationOf<typeof en>
    >('!<=');

    expectType<
      Readonly<{
        title: '日程調整';
        greeting: '{name}';
        answers: Readonly<{ count: (p: Readonly<{ n: string }>) => string }>;
        deadline: '{date}';
      }>,
      TranslationOf<typeof en>
    >('!<=');

    expectType<
      Readonly<{
        title: '日程調整';
        greeting: '{name}';
        answers: ReadonlyRecord<string, never>;
        deadline: '{date}';
      }>,
      TranslationOf<typeof en>
    >('!<=');
  });
});

describe(checkTranslation, () => {
  const ja = {
    title: '日程調整',
    greeting: 'こんにちは、{name}さん',
    answers: { count: (p: Readonly<{ n: number }>) => `${p.n} 件の回答` },
    deadline: '{date} までに回答',
  } as const satisfies TranslationOf<typeof en>;

  test('a complete translation has no problems', () => {
    assert.deepStrictEqual(checkTranslation(en, ja), []);
  });

  test('reports a placeholder the base string does not have', () => {
    // The type admits extra placeholders: it can only require the base ones.
    const extra = {
      ...ja,
      greeting: 'こんにちは、{name}さん（{nickname}）',
    } as const satisfies TranslationOf<typeof en>;

    assert.deepStrictEqual(checkTranslation(en, extra), [
      'greeting: placeholder {nickname} is not in the base message',
    ]);
  });

  test('reports what a translation the checker never saw got wrong', () => {
    // As a translation read from JSON would be.
    const parsed: unknown = JSON.parse(
      '{"title":1,"greeting":"こんにちは","answers":"件","extra":"x"}',
    );

    assert.deepStrictEqual(checkTranslation(en, parsed), [
      'title: expected a string, got number',
      'greeting: placeholder {name} is missing',
      'answers: expected a nested catalog, got string',
      'deadline: missing',
      'extra: not in the base catalog',
    ]);
  });

  test('reports a function message given as something else', () => {
    assert.deepStrictEqual(
      checkTranslation(en, { ...ja, answers: { count: '件' } }),
      ['answers.count: expected a function, got string'],
    );
  });

  test('reports a translation that is not an object', () => {
    assert.deepStrictEqual(checkTranslation(en, null), [
      '(root): expected a nested catalog, got null',
    ]);
  });

  test('reports a then of its own at the root as a key the base lacks', () => {
    assert.deepStrictEqual(
      checkTranslation(en, {
        ...ja,
        // oxlint-disable-next-line unicorn/no-thenable -- the catalog under test
        then: () => '次に',
      }),
      ['then: not in the base catalog'],
    );
  });

  test('reports a promise at the root, where the loader is missing its arrow', () => {
    const promise = Promise.resolve(ja);

    assert.deepStrictEqual(checkTranslation(en, promise), [
      '(root): expected a nested catalog, got promise (is the loader missing its `() =>`?)',
    ]);

    assert.deepStrictEqual(checkTranslation(en, { ...ja, answers: promise }), [
      'answers.count: missing',
    ]);

    // Below the root nothing is loaded: a thenable group is checked like any
    // other.
    assert.deepStrictEqual(
      checkTranslation(en, {
        ...ja,
        // oxlint-disable-next-line unicorn/no-thenable -- the group under test
        answers: { ...ja.answers, then: () => '次に' },
      }),
      ['answers.then: not in the base catalog'],
    );

    // Below the root nothing is loaded: no loader to blame.
    assert.deepStrictEqual(
      checkTranslation(en, { ...ja, title: Promise.resolve('x') }),
      ['title: expected a string, got promise'],
    );
  });

  test('reports a thenable that is no promise as one, without blaming a loader', () => {
    /** A lazy query, whose `then` is on its prototype. */
    const query: unknown = Object.create({
      // oxlint-disable-next-line unicorn/no-thenable -- the thenable under test
      then: (resolve: (value: unknown) => void) => {
        resolve(ja);
      },
    });

    assert.deepStrictEqual(checkTranslation(en, query), [
      '(root): expected a nested catalog, got thenable (it is a thenable)',
    ]);
  });
});
