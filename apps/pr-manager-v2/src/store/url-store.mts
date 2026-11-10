import { createState, type InitializedObservable } from 'synstate';
import { searchOf, type ParamCodec } from '../domain/index.mjs';
import type { Timers } from './timers.mjs';

/**
 * The query string, which holds what a reader chose to see (spec §13), and the
 * one writer of it.
 *
 * Each feature asks for a {@link UrlField} with its codec and gets a state read
 * from the URL the page opened with. A change to any field rewrites the query
 * string a moment later (`delayMs`, so that a drag does not rewrite the address
 * bar on every pointer move, which Safari also limits), keeping every parameter
 * no field owns — `repo`, and whatever a newer page wrote. A reload inside that
 * moment opens without the last change: a reload's address is fixed before any
 * page event could write it.
 */
export type UrlStore = Readonly<{
  field: <T>(
    codec: ParamCodec<T>,
    equals?: (a: T, b: T) => boolean,
  ) => UrlField<T>;
  /** Writes what is pending now, rather than after the delay. */
  flush: () => void;
}>;

export type UrlField<T> = Readonly<{
  value: InitializedObservable<T>;
  set: (value: T) => void;
  update: (fn: (prev: T) => T) => void;
  get: () => T;
}>;

/** Where the query string lives: the address bar, or a test's string. */
export type UrlIo = Readonly<{
  /** The query string as it is now, `?…` or `''`. */
  read: () => string;
  /** Replaces the query string without a history entry. */
  write: (search: string) => void;
}>;

export type UrlDeps = UrlIo &
  Readonly<{
    timers: Timers;
    delayMs: number;
  }>;

export const createUrlStore = (deps: UrlDeps): UrlStore => {
  const initial = new URLSearchParams(deps.read());

  const mut_writers: ((params: URLSearchParams) => void)[] = [];

  let mut_cancel: (() => void) | undefined = undefined;

  const flush = (): void => {
    mut_cancel?.();

    mut_cancel = undefined;

    const params = new URLSearchParams(deps.read());

    for (const writer of mut_writers) {
      writer(params);
    }

    const next = searchOf(params);

    if (next !== deps.read()) {
      deps.write(next);
    }
  };

  const schedule = (): void => {
    mut_cancel?.();

    mut_cancel = deps.timers.setTimer(deps.delayMs, flush);
  };

  const field = <T,>(
    codec: ParamCodec<T>,
    equals?: (a: T, b: T) => boolean,
  ): UrlField<T> => {
    const [value, setValue, { getSnapshot, updateState }] = createState(
      codec.read(initial),
      equals === undefined ? undefined : { equals },
    );

    mut_writers.push((params) => {
      codec.write(getSnapshot(), params);
    });

    return {
      value,
      get: getSnapshot,
      set: (next) => {
        setValue(next);

        schedule();
      },
      update: (fn) => {
        updateState(fn);

        schedule();
      },
    };
  };

  return { field, flush };
};

/** The real query string, rewritten with `replaceState`. */
export const browserUrl = (): UrlIo =>
  ({
    read: () => globalThis.location.search,
    write: (search) => {
      const { pathname, hash } = globalThis.location;

      try {
        // The whole path, since an empty URL would resolve to the current one,
        // old query included. Safari throws when a page calls this too often;
        // the choice still applies and reaches the URL on the next write.
        window.history.replaceState(
          window.history.state,
          '',
          `${pathname}${search}${hash}`,
        );
      } catch {
        // See above.
      }
    },
  }) as const;
