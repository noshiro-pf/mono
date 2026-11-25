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
