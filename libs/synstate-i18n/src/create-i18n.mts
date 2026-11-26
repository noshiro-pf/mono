import {
  batch,
  createRootOwner,
  derive,
  isObservable,
  map,
  state,
  type InitializedObservable,
} from 'synstate-next';
import { hasKey } from 'ts-data-forge';
import * as Arr from 'ts-data-forge/array';
import type { ReadonlyRecord, RelaxedExtract } from 'ts-type-forge';
import type { Catalog, MessageFn, TranslationOf } from './catalog.mjs';
import {
  compileMessage,
  fill,
  hasOwnThen,
  ignoreRejection,
  isCatalogLike,
  isGroup,
  isModuleNamespace,
  isPlainGroup,
  isThenable,
  loaderHint,
  messageNamedThen,
  nonMessageIn,
} from './internal/index.mjs';
import type { PlaceholdersOf, PlaceholderValue } from './placeholders.mjs';

/** A value, or an observable whose current value is used. */
export type MaybeObservable<T> = InitializedObservable<T> | T;

/**
 * A translation, or a function that loads it, called the first time its locale
 * is asked for: `() => import('./ja.mjs').then((m) => m.ja)`.
 */
export type TranslationSource<Base> =
  TranslationOf<Base> | (() => Promise<TranslationOf<Base>>);

/** The parameters of the text of message `M`, each a value or an observable. */
export type TextParams<M> = M extends string
  ? ReadonlyRecord<PlaceholdersOf<M>, MaybeObservable<PlaceholderValue>>
  : M extends (...args: infer A extends readonly unknown[]) => string
    ? EachObservable<FirstParamOf<A>>
    : never;

/** The parameters of message `M` as plain values. */
export type PeekParams<M> = M extends string
  ? ReadonlyRecord<PlaceholdersOf<M>, PlaceholderValue>
  : M extends (...args: infer A extends readonly unknown[]) => string
    ? FirstParamOf<A>
    : never;

/**
 * The base catalog `C` as functions: each message is a function from its
 * parameters to an observable of its text in the current locale. A message with
 * no parameters takes none, and a function message whose parameter is optional
 * takes it optionally.
 */
export type Texts<C> = Readonly<{
  [K in keyof C]: C[K] extends MessageFn | string
    ? TakesNoParams<C[K]> extends true
      ? () => InitializedObservable<string>
      : TakesOptionalParams<C[K]> extends true
        ? (params?: TextParams<C[K]>) => InitializedObservable<string>
        : (params: TextParams<C[K]>) => InitializedObservable<string>
    : Texts<C[K]>;
}>;

/**
 * The base catalog `C` as functions from plain parameters to the text in the
 * current locale, read once.
 */
export type Peeks<C> = Readonly<{
  [K in keyof C]: C[K] extends MessageFn | string
    ? TakesNoParams<C[K]> extends true
      ? () => string
      : TakesOptionalParams<C[K]> extends true
        ? (params?: PeekParams<C[K]>) => string
        : (params: PeekParams<C[K]>) => string
    : Peeks<C[K]>;
}>;

/** What {@link createI18n} returns. */
export type I18n<L extends string, C> = Readonly<{
  /** Every locale: the base one first, then the translations in order. */
  locales: readonly L[];

  /** The current locale. */
  locale: InitializedObservable<L>;

  /**
   * The locale being loaded for the latest {@link I18n.setLocale}, or
   * `undefined` when none is. Shows a spinner while a lazy locale loads.
   */
  pendingLocale: InitializedObservable<L | undefined>;

  /**
   * Switches to `locale`: at once when it is loaded, otherwise once it has
   * loaded, while the texts stay in the current locale. When it was called
   * again before the load settled, the later call wins. A message that throws
   * while the texts switch rejects the call with its error, the locale having
   * switched. A load that fails rejects, leaves the locale as it was, and is
   * tried again next time; one for a call that a later call for another locale
   * has replaced resolves, as its choice no longer applies. After
   * {@link I18n.dispose}, see there.
   */
  setLocale: (locale: L) => Promise<void>;

  /**
   * Loads `locale` without switching to it. After {@link I18n.dispose}, see
   * there.
   */
  preload: (locale: L) => Promise<void>;

  /**
   * The texts, as observables that follow the locale:
   * `i18n.t.greeting({ name })`. A parameter may be an observable, and the text
   * then follows it too. A text without parameters is one observable, shared by
   * everyone who asks for it; one with parameters belongs to the owner it is
   * asked for in, as any node does.
   */
  t: Texts<C>;

  /**
   * The texts in the current locale, read once, for code that needs a string
   * now (a toast, `document.title`, a confirmation dialog).
   */
  peek: Peeks<C>;

  /**
   * `value` formatted by `Intl.NumberFormat` in the current locale. A value it
   * refuses is shown as an empty string.
   */
  formatNumber: (
    value: MaybeObservable<number>,
    options?: Intl.NumberFormatOptions,
  ) => InitializedObservable<string>;

  /**
   * `value` formatted by `Intl.DateTimeFormat` in the current locale. A value
   * it refuses, such as an invalid date, is shown as an empty string.
   */
  formatDateTime: (
    value: MaybeObservable<Date | number>,
    options?: Intl.DateTimeFormatOptions,
  ) => InitializedObservable<string>;

  /**
   * Disposes the store's own nodes, the shared texts and `locale` and
   * `pendingLocale` among them: they keep their last values and emit no more.
   * Afterwards `t`, `peek`, `formatNumber` and `formatDateTime` throw, while
   * `setLocale` and `preload` resolve without doing anything, as does one still
   * loading at `dispose`, even if its load fails: a call nobody awaits never
   * becomes an unhandled rejection.
   */
  dispose: () => void;
}>;

/**
 * Creates the store of an application's texts: the current locale, the loaded
 * catalogs, and the texts as observables.
 *
 * `baseMessages` is the catalog of `baseLocale`, declared `as const`; it is
 * always loaded, and its type is what every translation and every call of `t`
 * is checked against. `translations` gives each other locale as a translation
 * or a loader. `baseLocale` is the language `baseMessages` is written in, so it
 * is one literal, never a locale chosen at run time; to start in the user's
 * locale, `await i18n.setLocale(locale)` before rendering. An entry for the
 * base locale in `translations`, a translation given inline that is not a
 * catalog, a locale that is not a BCP 47 tag, and a message named `then` are
 * refused, by the types where they can and here.
 *
 * Make the store once, at module level, and import it where texts are needed:
 * its nodes belong to an owner of its own, so it outlives whatever created it
 * until its `dispose`.
 */
export const createI18n = <
  const BaseLocale extends string,
  C extends Catalog,
  const OtherLocale extends string,
>({
  baseLocale,
  baseMessages,
  translations,
}: Readonly<{
  baseLocale: BaseLocale & OneLiteral<BaseLocale>;
  baseMessages: C & NoInfer<LiteralStrings<C>>;
  // The base locale's messages are `baseMessages`: it takes no translation.
  // Only for a literal base: for any other, `baseLocale` is the error.
  translations: ReadonlyRecord<OtherLocale, TranslationSource<NoInfer<C>>> &
    (IsOneLiteral<BaseLocale> extends true
      ? Partial<ReadonlyRecord<NoInfer<BaseLocale>, never>>
      : unknown);
}>): I18n<BaseLocale | OtherLocale, C> => {
  type L = BaseLocale | OtherLocale;

  const owner = createRootOwner();

  // A `TranslationOf<C>` is a `Catalog`: the same nesting, with strings and
  // functions for leaves. The checker cannot follow that through the mapped
  // type while `C` is a parameter.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
  const sources = translations as ReadonlyRecord<
    string,
    Catalog | (() => Promise<Catalog>)
  >;

  // Before any check below can throw: a promise given where a catalog goes, as
  // an `import()` without its loader's arrow is, would otherwise have its
  // rejection, should the import fail, reported as unhandled beside the error.
  ignoreRejection(baseMessages);

  for (const source of Object.values(sources)) {
    ignoreRejection(source);
  }

  /**
   * Whether a translation is a module namespace holding none of the base
   * messages: a loader returning `import('./ja.mjs')` whole, rather than the
   * export, whose every message would show the base text without a word.
   */
  const isWholeModule = (catalog: Catalog): boolean => {
    const keys = Object.keys(baseMessages);

    // An empty base has no message to miss.
    return (
      Arr.isNonEmpty(keys) &&
      isModuleNamespace(catalog) &&
      keys.every((key) => !hasKey(catalog, key))
    );
  };

  const isOtherLocale = (key: string): key is OtherLocale =>
    hasKey(translations, key);

  const mut_locales: L[] = [baseLocale];

  for (const [key, source] of Object.entries(sources)) {
    // Refused by the types too; here for a store made from untyped code. An
    // entry for the base left `undefined`, which the types allow without
    // `exactOptionalPropertyTypes`, is no translation. One for another locale
    // is refused below as no catalog: its locale is in the store's type, so
    // leaving it out of `locales` would put the two out of step.
    const entry: unknown = source;

    if (key === baseLocale && entry !== undefined) {
      throw new TypeError(
        `synstate-i18n: "${key}" is the base locale, whose messages are \`baseMessages\`, and takes no translation`,
      );
    }

    if (key !== baseLocale && isOtherLocale(key)) {
      mut_locales.push(key);
    }
  }

  const locales: readonly L[] = mut_locales;

  // A locale is given to `Intl` as it is, which throws for a tag that is not
  // BCP 47 in the middle of an update; refused here instead, where it is
  // written.
  const mut_canonical = new Map<string, L>();

  for (const l of locales) {
    const canonical = canonicalTag(l);

    const same = mut_canonical.get(canonical);

    // Two spellings of one locale would show as two in a locale picker.
    if (same !== undefined) {
      throw new RangeError(
        `synstate-i18n: locales "${same}" and "${l}" are one locale`,
      );
    }

    mut_canonical.set(canonical, l);
  }

  // Refused by the types too; here for a base catalog from untyped code, whose
  // array or `null` would leave accessors with nothing to look up.
  // A `then` of its own is a message named so, reported below by its path.
  if (
    !isPlainGroup(baseMessages) ||
    (isThenable(baseMessages) && !hasOwnThen(baseMessages))
  ) {
    throw new TypeError(
      `synstate-i18n: \`baseMessages\` is not a catalog${loaderHint(baseMessages)}`,
    );
  }

  const nonMessage = nonMessageIn(baseMessages);

  if (nonMessage !== undefined) {
    throw new TypeError(
      `synstate-i18n: the base message ${nonMessage.join('.')} is neither a string, a function nor a group of messages`,
    );
  }

  const namedThen = messageNamedThen(baseMessages);

  if (namedThen !== undefined) {
    throw new TypeError(
      `synstate-i18n: the message ${namedThen.join('.')} is named "then", which would make its accessors a thenable`,
    );
  }

  const mut_loaded = new Map<L, Catalog>([[baseLocale, baseMessages]]);

  for (const l of locales) {
    const source = sources[l];

    if (l === baseLocale || typeof source === 'function') {
      continue;
    }

    // As a loader's result is: a translation typed by hand can be anything.
    if (!isCatalogObject(source)) {
      throw new TypeError(
        `synstate-i18n: the translation of locale "${l}" is not a catalog${loaderHint(source)}`,
      );
    }

    if (isWholeModule(source)) {
      throw new TypeError(
        `synstate-i18n: the translation of locale "${l}" is a module${pickExport}`,
      );
    }

    mut_loaded.set(l, source);
  }

  // A loaded catalog travels through this store's promises in a box, so that
  // they do not read its `then`, which a proxy whose trap throws on unknown keys
  // would turn into a rejection. A loader's own promise reads it before this
  // code does, so such a proxy loads only when given inline.
  const mut_loading = new Map<L, Promise<Loaded>>();

  /**
   * The message at `path` in `catalog`, or `base`, the base catalog's, when
   * `catalog` has none of its kind there: a translation that `checkTranslation`
   * would report shows the base text rather than nothing. `base` comes with the
   * accessor, so that a render walks one catalog only.
   */
  const messageAt = (
    catalog: Catalog,
    path: readonly string[],
    base: MessageFn | string,
  ): MessageFn | string => {
    const found = lookUp(catalog, path);

    // Only a message of the base's kind: a function where the base has a string
    // would be called without its parameters, and a string where it has a
    // function filled with an object.
    if (
      typeof found === typeof base &&
      (typeof found === 'string' || typeof found === 'function')
    ) {
      return found;
    }

    return base;
  };

  const { current, locale, messages, pendingLocale } = owner.run(() => {
    const c = state<Readonly<{ locale: L; messages: Catalog }>>({
      locale: baseLocale,
      messages: baseMessages,
    });

    return {
      current: c,
      locale: c.pipe(map((v) => v.locale)),
      messages: c.pipe(map((v) => v.messages)),
      pendingLocale: state<L | undefined>(undefined),
    };
  });

  const mut_lifetime = { disposed: false };

  // Read through a function: a check after an `await` must not be narrowed by
  // one before it.
  const isDisposed = (): boolean => mut_lifetime.disposed;

  /** A disposed store has no nodes left to make texts from. */
  const assertAlive = (): void => {
    if (isDisposed()) {
      throw new Error('synstate-i18n: the store was disposed');
    }
  };

  // Called only by a store that is alive: `setLocale` and `preload` check that
  // right before.
  const load = (l: L): Promise<Loaded> => {
    const hit = mut_loaded.get(l);

    if (hit !== undefined) {
      return Promise.resolve({ catalog: hit });
    }

    const inFlight = mut_loading.get(l);

    if (inFlight !== undefined) {
      return inFlight;
    }

    // Own keys only: a locale from outside the types, such as `constructor`,
    // does not find a loader on `Object.prototype`.
    const source = hasKey(sources, l) ? sources[l] : undefined;

    if (typeof source !== 'function') {
      return Promise.reject(
        new Error(`synstate-i18n: no translation for locale "${l}"`),
      );
    }

    const promise = (async () => {
      // A result with a callable `then` of its own never arrives: the promise
      // it comes in takes it for a thenable before this code sees it, and the
      // load never settles. Nothing here can catch that; `checkTranslation`
      // reports the key, and the base catalog cannot have one.
      const loaded: unknown = await source();

      // A loader typed by hand can resolve to anything: the `default` of a
      // module that has none, or an untyped JSON import.
      if (!isCatalogObject(loaded)) {
        throw new TypeError(
          `synstate-i18n: the loader of locale "${l}" did not resolve to a catalog`,
        );
      }

      if (isWholeModule(loaded)) {
        throw new TypeError(
          `synstate-i18n: the loader of locale "${l}" resolved to a module${pickExport}`,
        );
      }

      // A disposed store keeps no catalogs.
      if (!isDisposed()) {
        mut_loaded.set(l, loaded);
      }

      return { catalog: loaded };
    })();

    mut_loading.set(l, promise);

    // Settled either way, the load is no longer in flight: a failed one is
    // tried again by the next call. Its rejection reaches the callers through
    // `promise`, so the chain that clears the entry swallows it.
    promise
      .finally(() => {
        mut_loading.delete(l);
      })
      .catch(() => {});

    return promise;
  };

  /**
   * The latest call of `setLocale`: its number, so that only it resets
   * `pendingLocale`; its locale; and the number of the first call of the run
   * that chose that locale, so that a load can tell whether its call's choice
   * still applies. A later call for the same locale makes the same choice; one
   * made before a call for another locale does not, even if the locale is
   * chosen again after.
   */
  const mut_chosen: { request: number; locale: L; since: number } = {
    request: 0,
    locale: baseLocale,
    since: 0,
  };

  const stillChosen = (l: L, request: number): boolean =>
    !isDisposed() && mut_chosen.locale === l && request >= mut_chosen.since;

  const switchTo = (l: L, loaded: Catalog): void => {
    batch(() => {
      pendingLocale.set(undefined);

      current.set({ locale: l, messages: loaded });
    });
  };

  const setLocale = async (l: L): Promise<void> => {
    // Nothing is left to switch; quiet, like a call still loading at `dispose`.
    if (isDisposed()) {
      return;
    }

    // Before anything changes: a locale from outside the types, such as a query
    // parameter, is neither shown as loading nor takes over a switch underway.
    if (!locales.includes(l)) {
      throw new Error(`synstate-i18n: no translation for locale "${l}"`);
    }

    mut_chosen.request += 1;

    if (l !== mut_chosen.locale) {
      mut_chosen.locale = l;

      mut_chosen.since = mut_chosen.request;
    }

    const request = mut_chosen.request;

    const hit = mut_loaded.get(l);

    if (hit !== undefined) {
      switchTo(l, hit);

      return;
    }

    pendingLocale.set(l);

    // Replaced by a subscriber of that, or disposed by one: no loader runs for
    // a choice that no longer applies.
    if (!stillChosen(l, request)) {
      return;
    }

    const loaded = await loadForSwitch(l, request);

    // Disposed while it loaded, or replaced by a call for another locale:
    // nothing is left to switch, and the call settles quietly, since it may be
    // one nobody awaits. Outside the load's `try`, so that a message throwing
    // while the texts switch is not taken for a failed load.
    if (loaded !== undefined && stillChosen(l, request)) {
      switchTo(l, loaded.catalog);
    }
  };

  /**
   * The catalog of `l` for the `setLocale` numbered `request`, or `undefined`
   * when the store was disposed, which settles the call quietly. A failed load
   * rejects while `l` is still the locale chosen last, and the latest call
   * clears `pendingLocale`; once a call for another locale has replaced it, it
   * settles quietly too.
   */
  const loadForSwitch = async (
    l: L,
    request: number,
  ): Promise<Loaded | undefined> => {
    try {
      // Still boxed: an async function's promise would read a catalog's `then`.
      return await load(l);
    } catch (error) {
      // A failure after `dispose`, or of a call one for another locale has
      // replaced, is as quiet as a success: its choice no longer applies.
      if (!stillChosen(l, request)) {
        return undefined;
      }

      if (request === mut_chosen.request) {
        pendingLocale.set(undefined);

        // Disposed or replaced by a subscriber of that reset: as quiet as above.
        if (!stillChosen(l, request)) {
          return undefined;
        }
      }

      throw error;
    }
  };

  const preload = async (l: L): Promise<void> => {
    if (isDisposed()) {
      return;
    }

    try {
      await load(l);
    } catch (error) {
      if (!isDisposed()) {
        throw error;
      }
    }
  };

  const mut_shared = new Map<string, InitializedObservable<string>>();

  const text = (
    path: readonly string[],
    base: MessageFn | string,
    params: ReadonlyRecord<string, unknown> | undefined,
  ): InitializedObservable<string> => {
    assertAlive();

    if (params === undefined) {
      // One-to-one, unlike a join on a character a key may hold.
      const key = JSON.stringify(path);

      const hit = mut_shared.get(key);

      if (hit !== undefined) {
        return hit;
      }

      const made = owner.run(() =>
        messages.pipe(map((m) => render(messageAt(m, path, base), undefined))),
      );

      mut_shared.set(key, made);

      return made;
    }

    const mut_observed: (readonly [string, InitializedObservable<unknown>])[] =
      [];

    // Only an object's keys can be observables (`TextParams`): an array,
    // rebuilt below, would turn into an object, and `null` or a number, which a
    // message's own parameter may be, has no keys to read.
    for (const [name, value] of isGroupNode(params)
      ? Object.entries(params)
      : []) {
      if (isParamObservable(value)) {
        mut_observed.push([name, value]);
      }
    }

    const observed: readonly (readonly [
      string,
      InitializedObservable<unknown>,
    ])[] = mut_observed;

    if (Arr.isEmpty(observed)) {
      return messages.pipe(
        map((m) => render(messageAt(m, path, base), params)),
      );
    }

    const parents: readonly [
      InitializedObservable<Catalog>,
      ...InitializedObservable<unknown>[],
    ] = Arr.toUnshifted(
      observed.map(([, o]) => o),
      messages,
    );

    return derive(parents, (m, ...values) => {
      const resolved: ReadonlyRecord<string, unknown> = {
        ...params,
        ...Object.fromEntries(
          observed.map(([name], i) => [name, values[i]] as const),
        ),
      } as const;

      return render(messageAt(m, path, base), resolved);
    });
  };

  const peekText = (
    path: readonly string[],
    base: MessageFn | string,
    params: ReadonlyRecord<string, unknown> | undefined,
  ): string => {
    assertAlive();

    return render(messageAt(current.value.messages, path, base), params);
  };

  const formatted = <V, F extends Readonly<{ format: (input: V) => string }>>(
    value: MaybeObservable<V>,
    make: (l: L) => F,
  ): InitializedObservable<string> => {
    assertAlive();

    const mut_formats = new Map<L, F>();

    const formatterIn = (l: L): F => {
      const hit = mut_formats.get(l);

      if (hit !== undefined) {
        return hit;
      }

      const made = make(l);

      mut_formats.set(l, made);

      return made;
    };

    // A value the formatter refuses, such as an invalid date, is shown as
    // nothing rather than thrown in the middle of the update that wrote it.
    // The formatter is made outside the `try`: options it refuses are the
    // caller's mistake, and throw.
    const formatIn = (l: L, v: V): string => {
      const formatter = formatterIn(l);

      try {
        return formatter.format(v);
      } catch {
        return '';
      }
    };

    return isObservable(value)
      ? derive([locale, value], formatIn)
      : locale.pipe(map((l) => formatIn(l, value)));
  };

  return {
    locales,
    locale,
    pendingLocale,
    setLocale,
    preload,
    t: tree(baseMessages, [], text),
    peek: tree(baseMessages, [], peekText),
    formatNumber: (value, options) =>
      formatted(value, (l) => new Intl.NumberFormat(l, options)),
    formatDateTime: (value, options) =>
      formatted(value, (l) => new Intl.DateTimeFormat(l, options)),
    dispose: () => {
      // `pendingLocale` is not cleared: a write here is dropped when `dispose`
      // runs during an update, and reaches a subscriber that reads a text while
      // the store is half torn down otherwise. Its last value stands, as the
      // doc above says of every node.
      mut_lifetime.disposed = true;

      mut_shared.clear();

      mut_loaded.clear();

      mut_loading.clear();

      owner.dispose();
    },
  };
};

// A string without placeholders, or a function message that declares no
// parameter, takes none.
type TakesNoParams<M> = M extends string
  ? [PlaceholdersOf<M>] extends [never]
    ? true
    : false
  : M extends (...args: infer A extends readonly unknown[]) => string
    ? [A] extends [readonly []]
      ? true
      : false
    : false;

// The type of a function message's first parameter, read from the whole list as
// `TakesOptionalParams` reads it, and as `FirstParam` in catalog.mts types a
// translation's: a rest parameter typed as a union of tuples, which inferring
// one parameter from would make `never`, gives the union of its first elements.
// Only the `undefined` that `?` adds is dropped; a required parameter that
// allows `null` or `undefined` keeps it.
type FirstParamOf<A extends readonly unknown[]> = [A] extends [readonly []]
  ? never
  : [A] extends [readonly [infer P, ...unknown[]]]
    ? P
    : [Required<A>] extends [readonly [infer P, ...unknown[]]]
      ? P
      : A[number];

// A function message whose first parameter is marked optional,
// `(p?: P) => string`, takes it optionally. Decided by the parameter list rather
// than by `undefined`, which a consumer compiling without `strictNullChecks`
// would find in every parameter. A rest parameter alone stays required: a
// translation's parameter, typed from it, does not expect `undefined`. The list
// is read whole, not distributed over a union of tuples. Matches `FirstParam`
// in catalog.mts.
type TakesOptionalParams<M> = M extends (
  ...args: infer A extends readonly unknown[]
) => string
  ? [A] extends [readonly [unknown, ...unknown[]]]
    ? false
    : [Required<A>] extends [readonly [unknown, ...unknown[]]]
      ? true
      : false
  : false;

/**
 * `B` when it is one literal, and otherwise a message saying so: the base locale
 * is the language the base catalog is written in, not a locale chosen at run
 * time, which would leave the store's locales and texts out of step.
 */
type OneLiteral<B extends string> =
  IsOneLiteral<B> extends true
    ? B
    : // Not a string literal, which a union or a pattern would swallow into
      // `never`, but a requirement no string meets, which the error names.
      Readonly<{
        __error: 'synstate-i18n: baseLocale is the language of baseMessages, one literal';
      }>;

/**
 * Whether `S` is a finite set of literals: not `string`, and not a template
 * literal pattern that matches many strings.
 */
type IsFinite<S extends string> =
  // Only a finite set makes a record with required keys, which an empty one
  // does not satisfy.
  // eslint-disable-next-line @typescript-eslint/no-generated-empty-object-type -- the empty record is the point
  ReadonlyRecord<never, never> extends ReadonlyRecord<S, 1> ? false : true;

/** Whether `S` is one string literal: finite, and not a union. */
type IsOneLiteral<S extends string, All extends string = S> =
  IsFinite<S> extends true
    ? S extends unknown
      ? [All] extends [S]
        ? true
        : false
      : never
    : false;

const pickExport =
  " holding none of the base messages (pick the export holding the translation, as `() => import('./ja.mjs').then((m) => m.ja)` does)";

/** A catalog in a box, which a promise resolves to without reading it. */
type Loaded = Readonly<{ catalog: Catalog }>;

/**
 * Each property of `P` as a value or an observable, for each member of `P` when
 * it is a union, so that a discriminated union keeps its members' own keys. An
 * array is taken whole, without observables: its parameters are rebuilt as an
 * object. A parameter the message declares as an observable is refused, since
 * `t` would hand the message its value instead; parameters are plain data.
 *
 * An observable whose value spans members, such as a `kind` that switches
 * between `'date'` and `'none'`, is refused on purpose: the other keys could not
 * be checked against the member it holds at the time. Where a parameter should
 * switch, declare it as one key with a union type rather than as a union of
 * objects.
 *
 * A key is refused when any member of its type is an observable, so that an
 * optional key or a union is caught too; a key typed `any` is taken for plain
 * data.
 */
type EachObservable<P> = P extends unknown
  ? P extends readonly unknown[]
    ? P
    : Readonly<{
        [K in keyof P]: 0 extends 1 & P[K]
          ? MaybeObservable<P[K]>
          : [RelaxedExtract<P[K], InitializedObservable<unknown>>] extends [
                never,
              ]
            ? MaybeObservable<P[K]>
            : 'synstate-i18n: a parameter of a message is plain data, since `t` reads an observable for it';
      }>
  : never;

/**
 * `C` with every string that is not a literal turned into a message saying so:
 * a base catalog not declared `as const` has `string` for its messages, whose
 * placeholders the types would then not see. A message named `then` is turned
 * into one too, as `createI18n` refuses it.
 */
type LiteralStrings<C> = Readonly<{
  [K in keyof C]: C[K] extends MessageFn | string
    ? K extends 'then'
      ? 'synstate-i18n: no message may be named `then`'
      : C[K] extends string
        ? string extends C[K]
          ? 'synstate-i18n: declare the base catalog `as const`'
          : C[K]
        : C[K]
    : LiteralStrings<C[K]>;
}>;

/**
 * `l` as `Intl` writes it, refused when it is not a BCP 47 language tag: `Intl`
 * would throw for it in the middle of an update.
 */
const canonicalTag = (l: string): string => {
  try {
    return Intl.getCanonicalLocales(l)[0] ?? l;
  } catch {
    throw new RangeError(
      `synstate-i18n: locale "${l}" is not a BCP 47 language tag`,
    );
  }
};

/**
 * Whether a parameter is an observable. A parameter is a `MaybeObservable`,
 * whose observables hold a value, so one that is an observable is an
 * `InitializedObservable`.
 */
const isParamObservable = (
  value: unknown,
): value is InitializedObservable<unknown> => isObservable(value);

const isCatalogObject = (value: unknown): value is Catalog =>
  isCatalogLike(value);

/** A node `lookUp` can step into: any group, as `checkTranslation` sees it. */
const isGroupNode = (value: unknown): value is Catalog => isGroup(value);

const lookUp = (
  catalog: Catalog,
  path: readonly string[],
): Catalog | MessageFn | string | undefined => {
  let mut_node: Catalog | MessageFn | string | undefined = catalog;

  for (const key of path) {
    // Own keys only: a key a catalog lacks is not read from `Object.prototype`.
    if (!isGroupNode(mut_node) || !hasKey(mut_node, key)) {
      return undefined;
    }

    mut_node = mut_node[key];
  }

  return mut_node;
};

// A message that throws is a bug in its catalog: the error surfaces where the
// text is computed, as the rejection of the `setLocale` that switched to it,
// rather than being hidden behind the base text. How far the switch got by then
// is how far synstate-next's update of the texts got.
const render = (
  message: MessageFn | string,
  params: ReadonlyRecord<string, unknown> | undefined,
): string => {
  if (typeof message === 'string') {
    return params === undefined
      ? message
      : fill(compileMessage(message), params);
  }

  // The parameters are the message's own: `t` takes what its type asks for.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
  return (message as (p: typeof params) => string)(params);
};

/**
 * The accessor tree of `catalog`: each message replaced by a function of its
 * parameters that calls `leaf` with the message's path and the message.
 */
const tree = <R, Tree>(
  catalog: Catalog,
  path: readonly string[],
  leaf: (
    at: readonly string[],
    base: MessageFn | string,
    params: ReadonlyRecord<string, unknown> | undefined,
  ) => R,
): Tree =>
  // The tree mirrors `catalog`, key for key, which is what `Tree` describes.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
  Object.fromEntries(
    Object.entries(catalog).map(([key, value]) => {
      const at = Arr.toPushed(path, key);

      return [
        key,
        // As `lookUp` steps: the base catalog holds no other object.
        isGroupNode(value)
          ? tree(value, at, leaf)
          : (params?: ReadonlyRecord<string, unknown>) =>
              leaf(at, value, params),
      ];
    }),
  ) as Tree;
