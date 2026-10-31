/**
 * Whether the header is folded into the toolbar: the title, the token panel and
 * the time of reading are kept to one line, and the actions stay.
 *
 * Kept in IndexedDB (`settings-db.mts`) rather than the URL that keeps the
 * rest: it is how much room this screen has to spare, not a way of looking at
 * the page worth sharing in a link. It starts unfolded, which is what the page
 * draws until `load` answers; only then is anything handed to `save`, so the
 * default never overwrites what was saved, and a toggle made in that moment is
 * kept over it.
 */

import {
  createState,
  type InitializedObservable,
  type Subscription,
} from 'synstate';

export type HeaderDeps = Readonly<{
  /** What was saved, as it was saved; it rejects when nothing can be read. */
  load: () => Promise<unknown>;
  save: (folded: boolean) => void;
}>;

export type HeaderStore = Readonly<{
  folded: InitializedObservable<boolean>;
  toggle: () => void;
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createHeaderStore = (deps: HeaderDeps): HeaderStore => {
  const [folded, setFolded, { updateState: updateFolded }] = createState(false);

  // Whether the reader has toggled it yet.
  const mut_reader = { changed: false };

  const toggle = (): void => {
    mut_reader.changed = true;

    updateFolded((current) => !current);
  };

  const start = (): (() => void) => {
    const mut_run: { stopped: boolean; saving: Subscription | undefined } = {
      stopped: false,
      saving: undefined,
    };

    const resume = (stored: unknown): void => {
      if (mut_run.stopped) {
        return;
      }

      if (!mut_reader.changed) {
        setFolded(stored === true);
      }

      mut_run.saving = folded.subscribe(deps.save);
    };

    deps
      .load()
      .catch(() => undefined)
      .then(resume)
      .catch(() => undefined);

    return () => {
      mut_run.stopped = true;

      mut_run.saving?.unsubscribe();
    };
  };

  return { folded, toggle, start };
};
