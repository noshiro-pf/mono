# synstate-i18n

Internationalization for SynState applications: each text is an observable that
follows the current locale, so a synstate-dom component puts it straight into
its markup, and the compiler checks every key, every placeholder and every
translation.

It is private for now: it is written against
[synstate-next](../synstate-next/README.md), the rebuild that replaces synstate
in its next major release, and is published once that release is out.

- **Typed from the base catalog.** The catalog of the base locale, declared
  `as const`, is the type everything is checked against. `i18n.t.greeting()`
  without its `name`, a misspelt key, a parameter of the wrong type, and a
  translation that drops a key or a placeholder are compile errors.
- **Texts are observables.** `i18n.t.greeting({ name })` is an
  `InitializedObservable<string>`; a parameter may be an observable too, and the
  text follows both it and the locale. A text whose new value equals the old one
  does not emit, so a switch writes only the DOM text that changed.
- **Lazy locales.** A translation is an object or a loader
  (`() => import('./ja.mjs').then((m) => m.ja)`), loaded the first time its
  locale is asked for; the texts stay in the current locale until it has loaded.
- **Small.** Gzipped and on top of synstate, about 2.7 kB for `createI18n` and
  3.3 kB with every export (esbuild, minified).
  Plurals, numbers and dates come from the platform's `Intl`; the only runtime
  dependency beside synstate is ts-data-forge, of which a few functions are
  bundled.

## Catalogs

The base catalog defines the keys, the nesting and the parameters. A string
message names its parameters as `{name}` placeholders. A message that needs more
than placeholders, such as a plural, is a function of its parameters, whose
types the base catalog annotates.

```ts
import { plural } from 'synstate-i18n';

const p = plural('en');

export const en = {
    title: 'Event schedule',
    greeting: 'Hello, {name}!',
    answers: (params: Readonly<{ count: number }>) =>
        p(params.count, { one: '# answer', other: '# answers' }),
    deadline: { label: 'Answer by {date}' },
} as const;
```

A translation is written with `satisfies TranslationOf<typeof en>`, which checks
the keys, the nesting, the placeholders of each string (in any order) and the
parameters of each function, and types those parameters.

```ts
import { plural, type TranslationOf } from 'synstate-i18n';
import type { en } from './en.mjs';

const p = plural('ja');

export const ja = {
    title: '日程調整',
    greeting: 'こんにちは、{name}さん',
    answers: (params) => p(params.count, { other: '# 件の回答' }),
    deadline: { label: '{date} までに回答' },
} as const satisfies TranslationOf<typeof en>;
```

A placeholder is `{`, one or more characters other than braces, and `}`. There
is no escape: braces around a placeholder (`{{name}}`) stay as written, and a
message whose text needs a brace next to a word is a function. A number given
for a placeholder is written as `String` writes it (`12345`); for the locale's
format, pass `i18n.formatNumber(n)` as the parameter instead.

No message of the base catalog may be named `then`, at any level: its accessor
in `i18n.t` or `i18n.peek` would make the tree holding it a thenable, which
`await` and a promise call instead of resolving to. The type checker and
`createI18n` refuse one. A translation then has none either, since every key it
has beyond the base is one `checkTranslation` reports; `createI18n` refuses an
inline one whose top has a callable `then`, and a loader resolving to such a
translation never settles, since the promise it comes in takes it for a
thenable.

A locale is a BCP 47 language tag (`en`, `ja`, `zh-Hant`), since it is given to
`Intl` as it is; `createI18n` refuses one that is not. `baseLocale` is the
language `baseMessages` is written in, so it is one literal, never a locale
chosen at run time: to start in the user's locale, switch to it before the first
render (below). An entry for it in `translations` that holds a translation is
refused.

## The store

`createI18n` makes the store once, at module level; components import it. Its
nodes belong to an owner of its own, so it outlives whatever created it.

```ts
import { createI18n } from 'synstate-i18n';
import { en } from './en.mjs';

export const i18n = createI18n({
    baseLocale: 'en',
    baseMessages: en,
    translations: {
        // Loaded the first time the locale is asked for, as a chunk of its own.
        ja: () => import('./ja.mjs').then((m) => m.ja),
    },
});
```

`i18n.t` mirrors the base catalog. Each message is a function from its
parameters to an observable of its text; `i18n.peek` gives the text as a string,
read once.

```ts
const name = state('Alice');

const count = state(1);

// Observables of the text in the current locale.
const title = i18n.t.title();

const greeting = i18n.t.greeting({ name }); // a parameter may be an observable

const answers = i18n.t.answers({ count });

const deadline = i18n.t.deadline.label({ date: '12/1' });

assert.strictEqual(greeting.value, 'Hello, Alice!');

assert.strictEqual(answers.value, '1 answer');

name.set('Bob');

count.set(3);

assert.strictEqual(greeting.value, 'Hello, Bob!');

assert.strictEqual(answers.value, '3 answers');

// Loads `ja`, then switches every text at once.
await i18n.setLocale('ja');

assert.strictEqual(title.value, '日程調整');

assert.strictEqual(greeting.value, 'こんにちは、Bobさん');

assert.strictEqual(answers.value, '3 件の回答');

assert.strictEqual(deadline.value, '12/1 までに回答');

// A string now, for a toast or `document.title`.
assert.strictEqual(
    i18n.peek.greeting({ name: 'Carol' }),
    'こんにちは、Carolさん',
);
```

A text without parameters is one observable, shared by every component that asks
for it. A text with parameters is a node of the owner it is asked for in, and is
disposed with the component; asked for outside any owner, such as in an event
handler, it lives as long as the store, so read a text there with `peek`. A
parameter is plain data: a message that declares an observable as a parameter is
refused, since `t` hands it the observable's value.

`setLocale` switches at once to a locale that is loaded. Otherwise
`pendingLocale` holds the locale while it loads, and the switch happens when it
has; when `setLocale` was called again in the meantime, the later call wins. A
load that fails rejects, leaves the locale as it was, and is tried again next
time; one for a call that a later call for another locale has replaced resolves,
since its choice no longer applies. `preload` loads a locale without switching
to it.

`dispose` disposes the store's nodes, which keep their last values and emit no
more. Afterwards `t`, `peek`, `formatNumber` and `formatDateTime` throw, while
`setLocale` and `preload` resolve without doing anything, as does one still
loading at `dispose`, even if its load fails: a call nobody awaits never becomes
an unhandled rejection.

## In a synstate-dom component

A text goes wherever an observable does: a child, an attribute, a property.

```tsx
import { constant, For, type JSX } from 'synstate-dom-next';
import { map, type InitializedObservable } from 'synstate-next';
import { i18n } from './i18n.mjs';

const localeNames = { en: 'English', ja: '日本語' } as const;

export const Header = ({
    name,
    count,
}: Readonly<{
    name: InitializedObservable<string>;
    count: InitializedObservable<number>;
}>): JSX.Element => (
    <header>
        <h1>{i18n.t.title()}</h1>
        <p>{i18n.t.greeting({ name })}</p>
        <p title={i18n.t.deadline.label({ date: '12/1' })}>
            {i18n.t.answers({ count })}
        </p>
        <For items={constant(i18n.locales)} key={(locale) => locale}>
            {(locale) => (
                <button
                    type={constant('button')}
                    onClick={() => {
                        i18n.setLocale(locale.value).catch(console.error);
                    }}
                >
                    {locale.pipe(map((l) => localeNames[l]))}
                </button>
            )}
        </For>
    </header>
);

// Keeps `<html lang>` on the current locale, for screen readers and fonts.
i18n.locale.subscribe((locale) => {
    document.documentElement.setAttribute('lang', locale);
});
```

The store starts in the base locale. To start in the user's, negotiate it before
the first render:

```ts
// Before the first render, so that the page does not show English first.
await i18n.setLocale(negotiateLocale(navigator.languages, i18n.locales, 'en'));

render();
```

`negotiateLocale` tries each preferred tag in turn, as it is and then shortened
a subtag at a time (`zh-Hant-TW`, `zh-Hant`, `zh`), and ignores case. As RFC
4647's lookup does, it drops a single-character subtag together with the one
after it (`en-x-a` is tried as `en-x-a`, then `en`). An underscore reads as a
hyphen (`en_US`).

## Numbers and dates

`formatNumber` and `formatDateTime` format a value, or an observable, by
`Intl.NumberFormat` and `Intl.DateTimeFormat` in the current locale. Each call
makes one formatter per locale it is shown in. A value the formatter refuses,
such as an invalid date, is shown as an empty string.

```ts
const total = state(1234.5);

const price = i18n.formatNumber(total, {
    style: 'currency',
    currency: 'JPY',
});

const day = i18n.formatDateTime(Date.UTC(2026, 11, 1), {
    dateStyle: 'long',
    timeZone: 'UTC',
});

assert.strictEqual(price.value, '¥1,235');

assert.strictEqual(day.value, 'December 1, 2026');

await i18n.setLocale('ja');

assert.strictEqual(price.value, '￥1,235');

assert.strictEqual(day.value, '2026年12月1日');
```

Inside a function message, `plural(locale)` picks a form by `Intl.PluralRules`,
writing `#` as the count in the locale.

## Checking a translation

A translation the type checker never saw can lack a message or hold one of the
wrong kind; that message then shows the base locale's text rather than nothing.
One that is not a catalog at all is refused: `createI18n` throws for one given
inline, and `setLocale` and `preload` reject for a loader that resolves to one.

The type of a translation cannot tell a placeholder the base string does not
have, since a type can only require the base ones. `checkTranslation` reports
that, and everything else wrong with a translation the checker never saw, such
as one read from JSON. Call it in a test of each translation:

```ts
test('ja translates every message of en', () => {
    assert.deepStrictEqual(checkTranslation(en, ja), []);
});
```

## Compared with react-i18next

- **No context.** synstate-dom has no context, and the store is an ordinary
  module: a component imports `i18n` as it imports any store. There is no
  provider and no hook, and a text is read where it is shown, not when the
  component renders.
- **Accessors instead of key strings.** `i18n.t.deadline.label(…)` rather than
  `t('deadline.label', …)`: go to definition, rename and find references work on
  messages, and a call cannot name a key that does not exist.
- **Parameters checked both ways.** i18next 26 checks keys and the names of
  interpolation values; it does not reject a missing value, a value of the wrong
  type, or a translation whose placeholders differ from the base.
- **No plugins.** Loading is a function returning the translation, formatting is
  `Intl`. Translations for an external service are exported from, and read back
  into, the TypeScript catalogs; `checkTranslation` checks what comes back.
