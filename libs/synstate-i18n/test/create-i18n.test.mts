// cspell:ignore Planification réponses Répondre avant titel
import { runInNewContext } from 'node:vm';
import { createRootOwner, state, type InitializedObservable } from 'synstate';
import { expectType } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  createI18n,
  plural,
  type I18n,
  type MaybeObservable,
  type TranslationOf,
} from '../src/index.mjs';

/**
 * A catalog read from JSON, as one back from a translation service is, typed as
 * a translation of `Base` whatever it holds.
 */
const fromJson = <Base,>(json: string): TranslationOf<Base> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the tests is a value the types do not describe
  JSON.parse(json) as unknown as TranslationOf<Base>;

const pluralEn = plural('en');

const en = {
  title: 'Event schedule',
  greeting: 'Hello, {name}!',
  answers: {
    count: (p: Readonly<{ n: number }>) =>
      pluralEn(p.n, { one: '# answer', other: '# answers' }),
  },
  deadline: 'Answer by {date}',
  sameEverywhere: 'OK',
} as const;

const ja = {
  title: '日程調整',
  greeting: 'こんにちは、{name}さん',
  answers: { count: (p) => `${p.n} 件の回答` },
  deadline: '{date} までに回答',
  sameEverywhere: 'OK',
} as const satisfies TranslationOf<typeof en>;

const fr = {
  title: 'Planification',
  greeting: 'Bonjour, {name} !',
  answers: { count: (p) => `${p.n} réponses` },
  deadline: 'Répondre avant le {date}',
  sameEverywhere: 'OK',
} as const satisfies TranslationOf<typeof en>;

/** A loader the test settles by hand. */
const deferred = <T,>(): Readonly<{
  load: () => Promise<T>;
  calls: () => number;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}> => {
  const mut_hooks: {
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
    calls: number;
  } = { resolve: () => {}, reject: () => {}, calls: 0 };

  return {
    load: () => {
      mut_hooks.calls += 1;

      return new Promise<T>((resolve, reject) => {
        mut_hooks.resolve = resolve;

        mut_hooks.reject = reject;
      });
    },
    calls: () => mut_hooks.calls,
    resolve: (value) => {
      mut_hooks.resolve(value);
    },
    reject: (error) => {
      mut_hooks.reject(error);
    },
  };
};

const make = (): I18n<'en' | 'fr' | 'ja', typeof en> =>
  createI18n({
    baseLocale: 'en',
    baseMessages: en,
    translations: { ja, fr: () => Promise.resolve(fr) },
  });

describe(createI18n, () => {
  test('starts in the base locale', () => {
    const i18n = make();

    expectType<typeof i18n.locales, readonly ('en' | 'ja' | 'fr')[]>('=');

    assert.deepStrictEqual(i18n.locales, ['en', 'ja', 'fr']);

    assert.strictEqual(i18n.locale.value, 'en');

    assert.strictEqual(i18n.pendingLocale.value, undefined);

    assert.strictEqual(i18n.t.title().value, 'Event schedule');

    i18n.dispose();
  });

  test('a text follows the locale', async () => {
    const i18n = make();

    const title = i18n.t.title();

    await i18n.setLocale('ja');

    assert.strictEqual(i18n.locale.value, 'ja');

    assert.strictEqual(title.value, '日程調整');

    await i18n.setLocale('fr');

    assert.strictEqual(title.value, 'Planification');

    i18n.dispose();
  });

  test('fills placeholders from constants and observables', async () => {
    const i18n = make();

    const name = state('Alice');

    const greeting = i18n.t.greeting({ name });

    const deadline = i18n.t.deadline({ date: '12/1' });

    assert.strictEqual(greeting.value, 'Hello, Alice!');

    assert.strictEqual(deadline.value, 'Answer by 12/1');

    name.set('Bob');

    assert.strictEqual(greeting.value, 'Hello, Bob!');

    await i18n.setLocale('ja');

    assert.strictEqual(greeting.value, 'こんにちは、Bobさん');

    assert.strictEqual(deadline.value, '12/1 までに回答');

    i18n.dispose();
  });

  test('calls a function message with its parameters', async () => {
    const i18n = make();

    const n = state(1);

    const count = i18n.t.answers.count({ n });

    assert.strictEqual(count.value, '1 answer');

    n.set(1000);

    assert.strictEqual(count.value, '1,000 answers');

    await i18n.setLocale('ja');

    assert.strictEqual(count.value, '1000 件の回答');

    i18n.dispose();
  });

  test('the parameters of a text are checked', () => {
    expectType<typeof _textMistakes, (store: ReturnType<typeof make>) => void>(
      '=',
    );

    expectType<typeof _catalogMistakes, () => void>('=');

    const i18n = make();

    expectType<Parameters<typeof i18n.t.title>['length'], 0>('=');

    expectType<
      Parameters<typeof i18n.t.greeting>[0],
      Readonly<{
        name: string | number | InitializedObservable<string | number>;
      }>
    >('<=');

    i18n.dispose();
  });

  test('a text without parameters is one observable however often it is asked for', () => {
    const i18n = make();

    assert.strictEqual(i18n.t.title(), i18n.t.title());

    i18n.dispose();
  });

  test('a text that reads the same in the new locale does not emit', async () => {
    const i18n = make();

    const mut_seen: string[] = [];

    const unsubscribe = i18n.t.sameEverywhere().subscribe((v) => {
      mut_seen.push(v);
    });

    await i18n.setLocale('ja');

    assert.deepStrictEqual(mut_seen, ['OK']);

    unsubscribe();

    i18n.dispose();
  });

  test('peek gives the text of the current locale as a string', async () => {
    const i18n = make();

    assert.strictEqual(i18n.peek.greeting({ name: 'Alice' }), 'Hello, Alice!');

    await i18n.setLocale('ja');

    assert.strictEqual(
      i18n.peek.greeting({ name: 'Alice' }),
      'こんにちは、Aliceさん',
    );

    assert.strictEqual(i18n.peek.answers.count({ n: 2 }), '2 件の回答');

    i18n.dispose();
  });
});

describe('setLocale', () => {
  test('loads a lazy locale once, and switches only when it has loaded', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load },
    });

    const title = i18n.t.title();

    const switched = i18n.setLocale('ja');

    assert.strictEqual(i18n.pendingLocale.value, 'ja');

    assert.strictEqual(i18n.locale.value, 'en');

    assert.strictEqual(title.value, 'Event schedule');

    loader.resolve(ja);

    await switched;

    assert.strictEqual(i18n.pendingLocale.value, undefined);

    assert.strictEqual(title.value, '日程調整');

    await i18n.setLocale('en');

    await i18n.setLocale('ja');

    assert.strictEqual(loader.calls(), 1);

    i18n.dispose();
  });

  test('two calls for a locale still loading share one load', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load },
    });

    const first = i18n.setLocale('ja');

    const second = i18n.preload('ja');

    loader.resolve(ja);

    await Promise.all([first, second]);

    assert.strictEqual(loader.calls(), 1);

    assert.strictEqual(i18n.locale.value, 'ja');

    i18n.dispose();
  });

  test('preload of a locale already loaded settles at once and switches nothing', async () => {
    const i18n = make();

    await i18n.preload('ja');

    await i18n.preload('en');

    assert.strictEqual(i18n.locale.value, 'en');

    assert.strictEqual(i18n.pendingLocale.value, undefined);

    i18n.dispose();
  });

  test('the last call wins over a load that settles after it', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load, fr },
    });

    const slow = i18n.setLocale('ja');

    await i18n.setLocale('fr');

    assert.strictEqual(i18n.locale.value, 'fr');

    assert.strictEqual(i18n.pendingLocale.value, undefined);

    loader.resolve(ja);

    await slow;

    assert.strictEqual(i18n.locale.value, 'fr');

    // Loaded all the same, so switching to it now is immediate.
    await i18n.setLocale('ja');

    assert.strictEqual(loader.calls(), 1);

    i18n.dispose();
  });

  test('a failed load rejects, keeps the locale, and is tried again next time', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load },
    });

    const failed = i18n.setLocale('ja');

    const error = new Error('offline');

    loader.reject(error);

    await expect(failed).rejects.toBe(error);

    assert.strictEqual(i18n.locale.value, 'en');

    assert.strictEqual(i18n.pendingLocale.value, undefined);

    const retried = i18n.setLocale('ja');

    loader.resolve(ja);

    await retried;

    assert.strictEqual(loader.calls(), 2);

    assert.strictEqual(i18n.locale.value, 'ja');

    i18n.dispose();
  });

  test('a failed load superseded by a later call does not clear its pending locale', async () => {
    const jaLoader = deferred<TranslationOf<typeof en>>();

    const frLoader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: jaLoader.load, fr: frLoader.load },
    });

    const toJa = i18n.setLocale('ja');

    const toFr = i18n.setLocale('fr');

    jaLoader.reject(new Error('offline'));

    // Replaced by the later call: its failure no longer applies.
    await toJa;

    assert.strictEqual(i18n.pendingLocale.value, 'fr');

    frLoader.resolve(fr);

    await toFr;

    assert.strictEqual(i18n.locale.value, 'fr');

    i18n.dispose();
  });

  test('a failed load rejects every call for its locale, a repeated one too', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load },
    });

    // A double click: the second call makes the same choice as the first.
    const first = i18n.setLocale('ja');

    const second = i18n.setLocale('ja');

    const error = new Error('offline');

    loader.reject(error);

    await expect(first).rejects.toBe(error);

    await expect(second).rejects.toBe(error);

    assert.strictEqual(i18n.locale.value, 'en');

    assert.strictEqual(i18n.pendingLocale.value, undefined);

    i18n.dispose();
  });

  test('a call replaced by another locale resolves, even when its locale is chosen again', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load, fr },
    });

    const first = i18n.setLocale('ja');

    await i18n.setLocale('fr');

    const again = i18n.setLocale('ja');

    const error = new Error('offline');

    loader.reject(error);

    await first;

    await expect(again).rejects.toBe(error);

    assert.strictEqual(i18n.locale.value, 'fr');

    i18n.dispose();
  });

  test('a call that a subscriber of the pending locale replaces runs no loader', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load, fr },
    });

    // Turns any choice of Japanese into French, at once.
    i18n.pendingLocale.subscribe((pending) => {
      if (pending === 'ja') {
        i18n.setLocale('fr').catch(() => undefined);
      }
    });

    await i18n.setLocale('ja');

    assert.strictEqual(loader.calls(), 0);

    assert.strictEqual(i18n.locale.value, 'fr');

    i18n.dispose();
  });

  test('a call that a subscriber of the reset replaces resolves', async () => {
    const loader = deferred<TranslationOf<typeof en>>();

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: loader.load, fr },
    });

    const toJa = i18n.setLocale('ja');

    // Falls back to French once loading stops without a switch.
    i18n.pendingLocale.subscribe((pending) => {
      if (pending === undefined && i18n.locale.value === 'en') {
        i18n.setLocale('fr').catch(() => undefined);
      }
    });

    loader.reject(new Error('offline'));

    await toJa;

    assert.strictEqual(i18n.locale.value, 'fr');

    i18n.dispose();
  });
});

describe('a translation the type checker never saw', () => {
  const withProtoKey = {
    title: 'Event schedule',
    toString: 'Show as text',
  } as const;

  test('shows the base text for a message it lacks, even one named like a prototype member', async () => {
    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: withProtoKey,
      translations: {
        ja: () =>
          Promise.resolve(
            fromJson<typeof withProtoKey>('{"title":"日程調整"}'),
          ),
      },
    });

    const shown = i18n.t.toString();

    await i18n.setLocale('ja');

    assert.strictEqual(i18n.t.title().value, '日程調整');

    assert.strictEqual(shown.value, 'Show as text');

    i18n.dispose();
  });

  test('shows the base text for a message of the wrong kind', async () => {
    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: withProtoKey,
      translations: {
        ja: () =>
          Promise.resolve(
            fromJson<typeof withProtoKey>('{"title":{"x":"y"},"toString":1}'),
          ),
      },
    });

    await i18n.setLocale('ja');

    assert.strictEqual(i18n.peek.title(), 'Event schedule');

    assert.strictEqual(i18n.peek.toString(), 'Show as text');

    i18n.dispose();
  });

  test('shows the base text for a group that is null', async () => {
    const grouped = { deadline: { label: 'Answer by {date}' } } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: grouped,
      translations: {
        ja: () =>
          Promise.resolve(fromJson<typeof grouped>('{"deadline":null}')),
      },
    });

    await i18n.setLocale('ja');

    assert.strictEqual(
      i18n.peek.deadline.label({ date: '12/1' }),
      'Answer by 12/1',
    );

    i18n.dispose();
  });

  test('a locale named like a prototype member has no loader, and is never shown as loading', async () => {
    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: withProtoKey,
      translations: {},
    });

    const mut_pending: (string | undefined)[] = [];

    i18n.pendingLocale.subscribe((l) => {
      mut_pending.push(l);
    });

    await expect(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a locale from outside the types, such as a query parameter
      i18n.setLocale('constructor' as 'en'),
    ).rejects.toThrow('synstate-i18n: no translation for locale "constructor"');

    await expect(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a locale from outside the types, such as a query parameter
      i18n.preload('constructor' as 'en'),
    ).rejects.toThrow('synstate-i18n: no translation for locale "constructor"');

    assert.deepStrictEqual(mut_pending, [undefined]);

    i18n.dispose();
  });

  test('a locale outside the store does not take over a switch underway', async () => {
    const i18n = make();

    const switching = i18n.setLocale('fr');

    await expect(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a locale from outside the types, such as a query parameter
      i18n.setLocale('xx' as 'en'),
    ).rejects.toThrow('synstate-i18n: no translation for locale "xx"');

    await switching;

    assert.strictEqual(i18n.locale.value, 'fr');

    assert.isUndefined(i18n.pendingLocale.value);

    i18n.dispose();
  });

  test('shows the base text for a message of the other kind', async () => {
    const base = {
      title: 'Event',
      count: (p: Readonly<{ n: number }>) => `${p.n} events`,
    } as const;

    const swapped: unknown = {
      title: (p: Readonly<{ x: string }>) => p.x,
      count: '{n} 件',
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {
        ja: () =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
          Promise.resolve(swapped as TranslationOf<typeof base>),
      },
    });

    await i18n.setLocale('ja');

    assert.strictEqual(i18n.peek.title(), 'Event');

    assert.strictEqual(i18n.peek.count({ n: 2 }), '2 events');

    i18n.dispose();
  });

  test('a loader that resolves to something other than a catalog rejects', async () => {
    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: withProtoKey,
      translations: {
        ja: () => Promise.resolve(fromJson<typeof withProtoKey>('null')),
      },
    });

    await expect(i18n.setLocale('ja')).rejects.toThrow(
      'synstate-i18n: the loader of locale "ja" did not resolve to a catalog',
    );

    assert.strictEqual(i18n.locale.value, 'en');

    i18n.dispose();
  });
});

describe('an inline translation that is not a catalog', () => {
  test('is refused when the store is made', () => {
    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: {
          ja: fromJson<typeof en>('null'),
        },
      }),
    ).toThrow('synstate-i18n: the translation of locale "ja" is not a catalog');
  });

  test('a promise is refused with a hint; a module namespace is not', async () => {
    // Failing, as an import can: no rejection is left unhandled, that of an
    // entry after the one refused or of one beside another error included.
    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: {
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
          ja: Promise.reject(new Error('offline')) as unknown as typeof ja,
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
          fr: Promise.reject(new Error('offline')) as unknown as typeof ja,
        },
      }),
    ).toThrow('synstate-i18n: the translation of locale "ja" is not a catalog');

    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: {
          en_US: ja,
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
          fr: Promise.reject(new Error('offline')) as unknown as typeof ja,
        },
      }),
    ).toThrow('synstate-i18n: locale "en_US" is not a BCP 47 language tag');

    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
        translations: { ja: Promise.resolve(ja) as unknown as typeof ja },
      }),
    ).toThrow(
      'synstate-i18n: the translation of locale "ja" is not a catalog (is the loader missing its `() =>`?)',
    );

    // A module namespace whose exports are the messages is a catalog.
    const moduleLike = { ...ja, [Symbol.toStringTag]: 'Module' } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- as `() => import('./ja.mjs')` resolves
        ja: () => Promise.resolve(moduleLike as unknown as typeof ja),
      },
    });

    await i18n.setLocale('ja');

    assert.strictEqual(i18n.peek.title(), '日程調整');

    i18n.dispose();
  });

  test('a proxy whose trap throws on unknown keys is a catalog, given inline', () => {
    const strict = new Proxy(ja, {
      get: (target, key) => {
        if (!Reflect.has(target, key)) {
          throw new Error('unknown key');
        }

        return Reflect.get(target, key);
      },
    });

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: { ja: strict },
    });

    i18n.setLocale('ja').catch(() => undefined);

    assert.strictEqual(i18n.peek.title(), '日程調整');

    i18n.dispose();
  });

  test('a module namespace holding none of the base messages is refused, with a hint', async () => {
    // As `() => import('./ja.mjs')` resolves, whose export is `ja`.
    const wholeModule = { ja, [Symbol.toStringTag]: 'Module' } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
        ja: () => Promise.resolve(wholeModule as unknown as typeof ja),
      },
    });

    await expect(i18n.setLocale('ja')).rejects.toThrow(
      'synstate-i18n: the loader of locale "ja" resolved to a module holding none of the base messages (pick the export holding the translation',
    );

    i18n.dispose();

    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: {
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
          ja: wholeModule as unknown as typeof ja,
        },
      }),
    ).toThrow(
      'synstate-i18n: the translation of locale "ja" is a module holding none of the base messages',
    );
  });

  test('undefined is refused too', () => {
    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: {
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
          ja: undefined as unknown as TranslationOf<typeof en>,
        },
      }),
    ).toThrow('synstate-i18n: the translation of locale "ja" is not a catalog');
  });
});

describe('a base catalog from untyped code', () => {
  test('a value that is neither a message nor a group is refused when the store is made', () => {
    for (const [value, path] of [
      [{ list: ['one', 'two'] }, 'list'],
      [{ group: { none: null } }, 'group.none'],
      [{ count: 1 }, 'count'],
      [{ day: new Date(0) }, 'day'],
      [{ group: new Map<string, string>([['a', 'A']]) }, 'group'],
    ] as const) {
      expect(() =>
        createI18n({
          baseLocale: 'en',
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
          baseMessages: value as unknown as typeof en,
          translations: {},
        }),
      ).toThrow(
        `synstate-i18n: the base message ${path} is neither a string, a function nor a group of messages`,
      );
    }

    expect(() =>
      createI18n({
        baseLocale: 'en',
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
        baseMessages: null as unknown as typeof en,
        translations: {},
      }),
    ).toThrow('synstate-i18n: `baseMessages` is not a catalog');

    expect(() =>
      createI18n({
        baseLocale: 'en',
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
        baseMessages: new Map<string, string>() as unknown as typeof en,
        translations: {},
      }),
    ).toThrow('synstate-i18n: `baseMessages` is not a catalog');

    // An import not awaited, failing as an import can.
    expect(() =>
      createI18n({
        baseLocale: 'en',
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the point of the test is a value the types do not describe
        baseMessages: Promise.reject(
          new Error('offline'),
        ) as unknown as typeof en,
        translations: {},
      }),
    ).toThrow(
      'synstate-i18n: `baseMessages` is not a catalog (is the loader missing its `() =>`?)',
    );
  });
});

describe('a base catalog of plain objects', () => {
  test('takes a group without a prototype, or from another realm', () => {
    const bare: unknown = Object.setPrototypeOf({ label: 'Label' }, null);

    const foreign: unknown = runInNewContext('({ label: "Foreign" })');

    const i18n = createI18n({
      baseLocale: 'en',
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- groups the types describe, made another way
      baseMessages: { bare, foreign } as unknown as Readonly<{
        bare: Readonly<{ label: 'Label' }>;
        foreign: Readonly<{ label: 'Foreign' }>;
      }>,
      translations: {},
    });

    assert.strictEqual(i18n.peek.bare.label(), 'Label');

    assert.strictEqual(i18n.peek.foreign.label(), 'Foreign');

    i18n.dispose();
  });
});

describe('a message named then', () => {
  test('is refused at any level, by the types and when the store is made', () => {
    expect(() =>
      createI18n({
        baseLocale: 'en',
        // @ts-expect-error no message may be named `then`
        // oxlint-disable-next-line unicorn/no-thenable -- the catalog under test
        baseMessages: { then: () => 'Then' } as const,
        translations: {},
      }),
    ).toThrow(
      'synstate-i18n: the message then is named "then", which would make its accessors a thenable',
    );

    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: {
          // @ts-expect-error no message may be named `then`
          // oxlint-disable-next-line unicorn/no-thenable -- the catalog under test
          steps: { first: 'First', then: 'Then' },
        } as const,
        translations: {},
      }),
    ).toThrow(
      'synstate-i18n: the message steps.then is named "then", which would make its accessors a thenable',
    );

    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: {
          // @ts-expect-error no message may be named `then`
          // oxlint-disable-next-line unicorn/no-thenable -- the catalog under test
          steps: { first: 'First', then: () => 'Then' },
        } as const,
        translations: {},
      }),
    ).toThrow(
      'synstate-i18n: the message steps.then is named "then", which would make its accessors a thenable',
    );
  });

  test('an inline translation that is a thenable is taken for a forgotten loader arrow', () => {
    /** A promise of another library: `then` on its prototype. */
    // oxlint-disable-next-line promise/spec-only -- the prototype itself, not a method of it
    const foreignPromise: unknown = Object.create(Promise.prototype);

    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: {
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a value the types do not describe
          ja: foreignPromise as typeof ja,
        },
      }),
    ).toThrow(
      'synstate-i18n: the translation of locale "ja" is not a catalog (is the loader missing its `() =>`?)',
    );
  });

  test('an inline translation with a then of its own is told so', () => {
    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: {
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a value the types do not describe
          ja: { ...ja, then: () => 'x' } as unknown as typeof ja, // oxlint-disable-line unicorn/no-thenable -- the catalog under test
        },
      }),
    ).toThrow(
      'synstate-i18n: the translation of locale "ja" is not a catalog (it has a `then` of its own',
    );
  });
});

describe('locale tags', () => {
  test('an entry for the base locale is refused, by the types and when the store is made', () => {
    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        // @ts-expect-error the base locale takes no translation
        translations: { en: ja, ja },
      }),
    ).toThrow('synstate-i18n: "en" is the base locale');

    // Left undefined: no translation, and nothing to refuse.
    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      // @ts-expect-error under `exactOptionalPropertyTypes`, as here; without it the types allow it
      translations: { en: undefined, ja },
    });

    assert.deepStrictEqual(i18n.locales, ['en', 'ja']);

    i18n.dispose();
  });

  test('a message parameter declared as an observable is refused', () => {
    expectType<typeof _observableParam, () => void>('=');
  });

  test('the base locale is one literal, never a locale chosen at run time', () => {
    expectType<typeof _chosenBase, (picked: 'en' | 'ja', any: string) => void>(
      '=',
    );
  });

  test('two spellings of one locale are refused', () => {
    expect(() =>
      createI18n({
        baseLocale: 'en-US',
        baseMessages: en,
        translations: { 'en-us': ja },
      }),
    ).toThrow('synstate-i18n: locales "en-US" and "en-us" are one locale');
  });

  test('a locale that is not a BCP 47 tag is refused when the store is made', () => {
    expect(() =>
      createI18n({
        baseLocale: 'en',
        baseMessages: en,
        translations: { en_US: ja },
      }),
    ).toThrow('synstate-i18n: locale "en_US" is not a BCP 47 language tag');
  });
});

describe('function messages with an optional parameter', () => {
  test('take their parameters, or none', async () => {
    const base = {
      items: (p?: Readonly<{ n: number }>) =>
        p === undefined ? ('Items' as const) : (`${p.n} items` as const),
    } as const;

    const itemsJa = {
      items: (p) =>
        p === undefined ? ('項目' as const) : (`${p.n} 件` as const),
    } as const satisfies TranslationOf<typeof base>;

    // Never called: for the type checker.
    const _careless = {
      // @ts-expect-error the translation must handle a missing parameter
      items: (p) => `${p.n} 件`,
    } as const satisfies TranslationOf<typeof base>;

    expectType<typeof _careless, unknown>('<=');

    // An optional parameter: zero or one argument.
    expectType<
      Parameters<TranslationOf<typeof base>['items']>['length'],
      0 | 1
    >('=');

    expectType<
      Parameters<TranslationOf<typeof base>['items']>[0],
      Readonly<{ n: number }> | undefined
    >('=');

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: { ja: itemsJa },
    });

    assert.strictEqual(i18n.t.items({ n: 3 }).value, '3 items');

    assert.strictEqual(i18n.peek.items({ n: 2 }), '2 items');

    assert.strictEqual(i18n.t.items().value, 'Items');

    assert.strictEqual(i18n.peek.items(), 'Items');

    expectType<
      typeof i18n.peek.items,
      (params?: Readonly<{ n: number }>) => string
    >('=');

    await i18n.setLocale('ja');

    assert.strictEqual(i18n.peek.items(), '項目');

    assert.strictEqual(i18n.peek.items({ n: 2 }), '2 件');

    i18n.dispose();
  });

  test('a rest parameter stays required, and its translation must be a function', () => {
    const base = {
      list: (...ps: readonly Readonly<{ n: number }>[]) =>
        ps.map((p) => p.n).join(', '),
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    assert.strictEqual(i18n.peek.list({ n: 2 }), '2');

    // Never called: for the type checker.
    const _noParams = (): void => {
      // @ts-expect-error a translation's parameter does not expect undefined
      i18n.peek.list();
    };

    expectType<typeof _noParams, () => void>('=');

    expectType<
      TranslationOf<typeof base>['list'],
      (params: Readonly<{ n: number }>) => string
    >('=');

    i18n.dispose();
  });

  test('a required parameter that allows null or undefined takes it', () => {
    const base = {
      count: (n: number | null) =>
        n === null ? ('none' as const) : n.toString(),
      maybe: (p: Readonly<{ n: number }> | undefined) =>
        p === undefined ? ('none' as const) : p.n.toString(),
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    assert.strictEqual(i18n.peek.count(null), 'none');

    assert.strictEqual(i18n.t.count(null).value, 'none');

    assert.strictEqual(i18n.t.count(2).value, '2');

    assert.strictEqual(i18n.peek.maybe(undefined), 'none');

    expectType<
      TranslationOf<typeof base>['count'],
      (params: number | null) => string
    >('=');

    i18n.dispose();
  });

  test('a rest parameter typed as a union of tuples is read whole, as `t` reads it', () => {
    const base = {
      either: (...args: readonly [] | readonly [Readonly<{ n: number }>]) =>
        (args[0]?.n ?? 0).toString(),
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    assert.strictEqual(i18n.peek.either({ n: 2 }), '2');

    // Required in `peek`, and so in a translation.
    expectType<
      TranslationOf<typeof base>['either'],
      (params: Readonly<{ n: number }>) => string
    >('=');

    i18n.dispose();

    // A union one of whose members marks it optional takes it optionally, in
    // `t` and `peek` as in a translation.
    const optional = {
      either: (
        ...args:
          | readonly [p: Readonly<{ a: number }>]
          | readonly [p?: Readonly<{ b: string }>]
      ) => (args[0] === undefined ? ('none' as const) : ('one' as const)),
    } as const;

    const withOptional = createI18n({
      baseLocale: 'en',
      baseMessages: optional,
      translations: {},
    });

    assert.strictEqual(withOptional.peek.either(), 'none');

    assert.strictEqual(withOptional.t.either().value, 'none');

    expectType<
      TranslationOf<typeof optional>['either'],
      (params?: Readonly<{ a: number } | { b: string }>) => string
    >('=');

    withOptional.dispose();
  });

  test('a parameter followed by a rest parameter keeps its own type and optionality', () => {
    const base = {
      required: (p: Readonly<{ n: number }>, ...extra: readonly string[]) =>
        `${p.n}${extra.join('')}`,
      optional: (p?: Readonly<{ n: number }>, ...extra: readonly string[]) =>
        `${p?.n ?? 0}${extra.join('')}`,
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    expectType<
      TranslationOf<typeof base>['required'],
      (params: Readonly<{ n: number }>) => string
    >('=');

    expectType<
      TranslationOf<typeof base>['optional'],
      (params?: Readonly<{ n: number }>) => string
    >('=');

    assert.strictEqual(i18n.peek.optional(), '0');

    assert.strictEqual(i18n.peek.required({ n: 1 }), '1');

    i18n.dispose();
  });

  test('a required parameter followed by an optional one stays required', () => {
    const base = {
      count: (p: Readonly<{ n: number }>, unit?: string) =>
        `${p.n}${unit ?? ''}`,
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    assert.strictEqual(i18n.peek.count({ n: 2 }), '2');

    // Never called: for the type checker.
    const _noParams = (): void => {
      // @ts-expect-error the first parameter is required
      i18n.peek.count();
    };

    expectType<typeof _noParams, () => void>('=');

    i18n.dispose();
  });
});

describe('shared texts', () => {
  test('are told apart by their whole path', () => {
    const base = { 'a\0b': 'X', a: { b: 'Y' } } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    assert.strictEqual(i18n.t['a\0b']().value, 'X');

    assert.strictEqual(i18n.t.a.b().value, 'Y');

    i18n.dispose();
  });
});

describe('function messages whose parameter is an array', () => {
  test('an array parameter is passed whole', () => {
    const base = {
      list: (p: readonly string[]) => p.join(', '),
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    assert.strictEqual(i18n.t.list(['a', 'b']).value, 'a, b');

    // Never called: for the type checker.
    const _observableElement = (): void => {
      // @ts-expect-error an array is taken whole, without observables
      i18n.t.list(['a', state('b')]);
    };

    expectType<typeof _observableElement, () => void>('=');

    i18n.dispose();
  });
});

describe('function messages whose parameter is a union', () => {
  test('take the parameters of each member', () => {
    const base = {
      due: (
        p: Readonly<{ kind: 'date'; date: string } | { kind: 'none' }>,
      ): string =>
        p.kind === 'date'
          ? (`Due ${p.date}` as const)
          : ('No due date' as const),
    } as const;

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: base,
      translations: {},
    });

    const date = state('12/1');

    assert.strictEqual(i18n.t.due({ kind: 'date', date }).value, 'Due 12/1');

    assert.strictEqual(i18n.peek.due({ kind: 'none' }), 'No due date');

    expectType<
      Parameters<typeof i18n.t.due>[0],
      Readonly<
        | {
            kind: MaybeObservable<'date'>;
            date: MaybeObservable<string>;
          }
        | { kind: MaybeObservable<'none'> }
      >
    >('=');

    // Never called: for the type checker.
    const _missingKey = (): void => {
      // @ts-expect-error each member keeps its own keys
      i18n.peek.due({ kind: 'date' });
    };

    expectType<typeof _missingKey, () => void>('=');

    i18n.dispose();
  });
});

describe('formatNumber and formatDateTime', () => {
  test('format in the current locale', async () => {
    const i18n = make();

    const n = state(1234.5);

    const number = i18n.formatNumber(n);

    const date = i18n.formatDateTime(Date.UTC(2026, 11, 1), {
      dateStyle: 'medium',
      timeZone: 'UTC',
    });

    assert.strictEqual(number.value, '1,234.5');

    assert.strictEqual(date.value, 'Dec 1, 2026');

    n.set(10);

    assert.strictEqual(number.value, '10');

    await i18n.setLocale('fr');

    assert.strictEqual(i18n.formatNumber(1234.5).value, '1\u{202F}234,5');

    assert.strictEqual(date.value, '1 déc. 2026');

    i18n.dispose();
  });
});

describe('formatDateTime of a value the formatter refuses', () => {
  test('shows an empty string instead of throwing in the update', () => {
    const i18n = make();

    const date = state(Date.UTC(2026, 0, 1));

    const shown = i18n.formatDateTime(date, { timeZone: 'UTC' });

    date.set(Number.NaN);

    assert.strictEqual(shown.value, '');

    i18n.dispose();
  });

  test('options the formatter refuses throw where they are given', () => {
    const i18n = make();

    expect(() => i18n.formatNumber(5, { style: 'currency' })).toThrow(
      TypeError,
    );

    i18n.dispose();
  });
});

describe('ownership', () => {
  test('a text asked for inside an owner is disposed with it; the store is not', async () => {
    const i18n = make();

    const owner = createRootOwner();

    const name = state('Alice');

    const greeting = owner.run(() => i18n.t.greeting({ name }));

    const title = owner.run(() => i18n.t.title());

    owner.dispose();

    await i18n.setLocale('ja');

    // Shared texts outlive whoever asked for them first.
    assert.strictEqual(title.value, '日程調整');

    assert.strictEqual(i18n.t.title().value, '日程調整');

    // The greeting was the owner's: it stopped following.
    assert.strictEqual(greeting.value, 'Hello, Alice!');

    i18n.dispose();
  });

  test('a disposed store refuses to make texts, and switches nothing', async () => {
    const mut_loads = { count: 0 };

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: {
        ja: () => {
          mut_loads.count += 1;

          return Promise.resolve(ja);
        },
      },
    });

    i18n.dispose();

    expect(() => i18n.t.title()).toThrow(
      'synstate-i18n: the store was disposed',
    );

    await i18n.setLocale('ja');

    await i18n.preload('ja');

    assert.strictEqual(i18n.locale.value, 'en');

    assert.strictEqual(mut_loads.count, 0);

    expect(() => i18n.peek.title()).toThrow(
      'synstate-i18n: the store was disposed',
    );

    expect(() => i18n.t.greeting({ name: 'x' })).toThrow(
      'synstate-i18n: the store was disposed',
    );

    expect(() => i18n.formatNumber(1)).toThrow(
      'synstate-i18n: the store was disposed',
    );

    expect(() => i18n.formatDateTime(0)).toThrow(
      'synstate-i18n: the store was disposed',
    );
  });

  test('a store disposed at once by a subscriber of the pending locale runs no loader', async () => {
    const mut_loads = { count: 0 };

    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: {
        ja: () => {
          mut_loads.count += 1;

          return Promise.resolve(ja);
        },
      },
    });

    i18n.pendingLocale.subscribe((pending) => {
      if (pending === 'ja') {
        i18n.dispose();
      }
    });

    await i18n.setLocale('ja');

    assert.strictEqual(mut_loads.count, 0);
  });

  test('a switch or preload whose load fails after the store is disposed resolves', async () => {
    const i18n = createI18n({
      baseLocale: 'en',
      baseMessages: en,
      translations: {
        fr: () => Promise.reject(new Error('offline')),
      },
    });

    const switching = i18n.setLocale('fr');

    const preloading = i18n.preload('fr');

    i18n.dispose();

    await switching;

    await preloading;

    assert.strictEqual(i18n.locale.value, 'en');
  });

  test('a switch or preload still loading when the store is disposed settles without switching', async () => {
    const i18n = make();

    const switching = i18n.setLocale('fr');

    const preloading = i18n.preload('fr');

    i18n.dispose();

    await switching;

    await preloading;

    assert.strictEqual(i18n.locale.value, 'en');
  });

  test('a store made inside an owner outlives it', async () => {
    const owner = createRootOwner();

    const i18n = owner.run(make);

    owner.dispose();

    await i18n.setLocale('ja');

    assert.strictEqual(i18n.t.title().value, '日程調整');

    i18n.dispose();
  });
});

// Never called: for the type checker.
const _observableParam = (): void => {
  const i18n = createI18n({
    baseLocale: 'en',
    baseMessages: {
      g: (p: Readonly<{ o: InitializedObservable<number> }>) =>
        `v=${p.o.value}`,
    },
    translations: {},
  });

  // @ts-expect-error a parameter is plain data
  i18n.t.g({ o: state(3) });

  const optional = createI18n({
    baseLocale: 'en',
    baseMessages: {
      g: (p: Readonly<{ o?: InitializedObservable<number> | number }>) =>
        typeof p.o === 'number' ? 'number' : 'observable',
    },
    translations: {},
  });

  // @ts-expect-error optional, or one member of a union, it is refused too
  optional.t.g({ o: state(3) });

  // A key typed `any` is plain data.
  const anyParam = createI18n({
    baseLocale: 'en',
    baseMessages: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the point of the test
      g: (p: Readonly<{ value: any }>) => (p.value === 1 ? 'one' : 'other'),
    },
    translations: {},
  });

  anyParam.t.g({ value: 1 });
};

// Never called: for the type checker.
const _chosenBase = (picked: 'en' | 'ja', any: string): void => {
  createI18n({
    // @ts-expect-error a union
    baseLocale: picked,
    baseMessages: en,
    translations: { fr },
  });

  createI18n({
    // @ts-expect-error a string
    baseLocale: any,
    baseMessages: en,
    translations: { fr },
  });
};

// Never called: for the type checker.
const _textMistakes = (i18n: ReturnType<typeof make>): void => {
  // @ts-expect-error a placeholder misspelt
  i18n.t.greeting({ nam: 'x' });

  // @ts-expect-error a placeholder left out
  i18n.t.greeting();

  // @ts-expect-error a key misspelt
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- the call is the type error under test
  i18n.t.titel();

  // @ts-expect-error a parameter of the wrong type
  i18n.t.answers.count({ n: 'three' });

  // @ts-expect-error a parameter for a message with none
  i18n.t.title({ x: 1 });

  // @ts-expect-error peek takes plain values only
  i18n.peek.greeting({ name: state('x') });

  // @ts-expect-error a locale that has no translation
  const _noSuchLocale: Promise<void> = i18n.setLocale('de');
};

// Never called: for the type checker.
const _catalogMistakes = (): void => {
  const notConst: ReadonlyRecord<string, string> = {
    greeting: 'Hello, {name}!',
  } as const;

  createI18n({
    baseLocale: 'en',
    // @ts-expect-error a base catalog not declared `as const`
    baseMessages: notConst,
    translations: {},
  });

  createI18n({
    baseLocale: 'en',
    baseMessages: en,
    translations: {
      // @ts-expect-error a translation missing a placeholder
      ja: { ...ja, greeting: 'こんにちは' },
    },
  });
};
