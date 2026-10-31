/** @jsxImportSource preact */
import { computed, effect, signal } from '@preact/signals-core';
import type { InputEventHandler } from 'preact';
import { useCallback, useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  combine,
  createScope,
  createState,
  map,
  switchMap,
  timer,
  withInitialValue,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import type { Lang } from '../constants.mjs';
import { LogPanel } from './log-panel.jsx';
import {
  requestMs,
  type LogEntry,
  type SearchState,
  type ViewRow,
} from './search-view.mjs';
import { searchViewText as text } from './text.mjs';

type Props = Readonly<{ lang: Lang }>;

/**
 * The search box of the "operators on signals" page, built twice: with an
 * effect that writes a signal, as Preact Signals has no `switchMap`, and with
 * SynState's `switchMap`. A timer stands in for the request. Each panel lists
 * every run of its view.
 */
export const SearchViewDemo = ({ lang }: Props): preact.JSX.Element => {
  const [viewCreatedFirst, setViewCreatedFirst] = useState(true);

  const [generation, setGeneration] = useState(0);

  const [query, setQuery] = useState(initialQuery);

  const [preactLog, setPreactLog] = useState<readonly LogEntry[]>([]);

  const [synstateLog, setSynstateLog] = useState<readonly LogEntry[]>([]);

  // A ref rather than state, so that a keystroke is never sent to the graphs
  // an order change has just disposed; built before paint, so that none is
  // dropped.
  const mut_setters = useRef<Setters>(noSetters);

  useLayoutEffect(() => {
    setQuery(initialQuery);

    setPreactLog([]);

    setSynstateLog([]);

    // Both graphs start from an empty query and are then given the first
    // one, so that both logs begin from the same write: `switchMap` projects
    // the values a source emits, not the one it holds when it is created.
    // With the view created first, that write already shows the glitch.
    let mut_logging = false;

    let mut_seq = 0;

    const entry = (row: ViewRow): LogEntry => {
      mut_seq += 1;

      return { id: mut_seq, row };
    };

    const preact = buildPreact(viewCreatedFirst, (row) => {
      if (mut_logging) {
        setPreactLog(prependEntry(entry(row)));
      }
    });

    const synstate = buildSynState((row) => {
      if (mut_logging) {
        setSynstateLog(prependEntry(entry(row)));
      }
    });

    mut_logging = true;

    preact.setQuery(initialQuery);

    synstate.setQuery(initialQuery);

    mut_setters.current = {
      preact: preact.setQuery,
      synstate: synstate.setQuery,
    };

    return () => {
      mut_setters.current = noSetters;

      preact.dispose();

      synstate.dispose();
    };
  }, [viewCreatedFirst, generation]);

  const changeQuery = useCallback<InputEventHandler<HTMLInputElement>>((e) => {
    const q = e.currentTarget.value;

    setQuery(q);

    mut_setters.current.preact(q);

    mut_setters.current.synstate(q);
  }, []);

  const createViewFirst = useCallback(() => {
    setViewCreatedFirst(true);
  }, []);

  const createViewAfter = useCallback(() => {
    setViewCreatedFirst(false);
  }, []);

  const reset = useCallback(() => {
    setGeneration((g) => g + 1);
  }, []);

  return (
    <div className={'signals-demo'}>
      <div className={'signals-demo-controls'}>
        <label className={'signals-demo-field'}>
          <span>{text.query[lang]}</span>
          <input type={'text'} value={query} onInput={changeQuery} />
        </label>
        <fieldset className={'signals-demo-order'}>
          <legend>{text.order[lang]}</legend>
          <label>
            <input
              checked={viewCreatedFirst}
              name={'view-order'}
              type={'radio'}
              onChange={createViewFirst}
            />
            {text.viewFirst[lang]}
          </label>
          <label>
            <input
              checked={!viewCreatedFirst}
              name={'view-order'}
              type={'radio'}
              onChange={createViewAfter}
            />
            {text.viewAfter[lang]}
          </label>
        </fieldset>
        <button type={'button'} onClick={reset}>
          {text.reset[lang]}
        </button>
      </div>
      <div className={'signals-demo-panels'}>
        <LogPanel
          entries={preactLog}
          lang={lang}
          title={text.preactTitle[lang]}
        />
        <LogPanel
          entries={synstateLog}
          lang={lang}
          title={text.synstateTitle[lang]}
        />
      </div>
      <p className={'signals-demo-caption'}>{text.caption[lang]}</p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// The two implementations
// ---------------------------------------------------------------------------

type Built = Readonly<{ setQuery: (q: string) => void; dispose: () => void }>;

type Setters = Readonly<{
  preact: (q: string) => void;
  synstate: (q: string) => void;
}>;

const emptyQuery = '';

const initialQuery = 'a';

const noSetters: Setters = { preact: () => {}, synstate: () => {} } as const;

const maxEntries = 50;

const buildPreact = (
  viewCreatedFirst: boolean,
  onView: (row: ViewRow) => void,
): Built => {
  const mut_query = signal(emptyQuery);

  const mut_searchState = signal<SearchState>({
    status: 'loading',
    query: emptyQuery,
  });

  const view = computed((): ViewRow => ({
    query: mut_query.value,
    state: mut_searchState.value,
  }));

  const watchView = (): (() => void) =>
    effect(() => {
      onView(view.value);
    });

  // switchMap((q) => request(q)), written as an effect.
  const search = (): (() => void) =>
    effect(() => {
      const q = mut_query.value;

      mut_searchState.value = { status: 'loading', query: q };

      const answer = setTimeout(() => {
        mut_searchState.value = { status: 'success', query: q };
      }, requestMs);

      // A newer query cancels the request in flight.
      return () => {
        clearTimeout(answer);
      };
    });

  const disposers = viewCreatedFirst
    ? ([watchView(), search()] as const)
    : ([search(), watchView()] as const);

  return {
    setQuery: (q) => {
      mut_query.value = q;
    },
    dispose: () => {
      for (const dispose of disposers) {
        dispose();
      }
    },
  };
};

const buildSynState = (onView: (row: ViewRow) => void): Built => {
  const scope = createScope();

  return scope.run(() => {
    const [query, setQuery] = createState(emptyQuery);

    const searchState = query.pipe(
      switchMap((q) =>
        timer(requestMs)
          .pipe(map((): SearchState => ({ status: 'success', query: q })))
          .pipe(withInitialValue<SearchState>({ status: 'loading', query: q })),
      ),
    );

    const view = combine([query, searchState]).pipe(
      map(([q, state]): ViewRow => ({ query: q, state })),
    );

    view.subscribe(onView);

    return {
      setQuery,
      dispose: () => {
        scope.dispose();
      },
    };
  });
};

/** The newest run first, and no more runs than the panel is worth keeping. */
const prependEntry =
  (newest: LogEntry) =>
  (log: readonly LogEntry[]): readonly LogEntry[] =>
    Arr.toUnshifted(newest)(log).slice(0, maxEntries);
