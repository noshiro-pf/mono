import { createState, type InitializedObservable } from 'synstate';
import type { SettingsDb } from './settings-db.mjs';

export type HeaderStore = Readonly<{
  folded: InitializedObservable<boolean>;
  toggle: () => void;
  start: () => () => void;
}>;

/**
 * Whether the header is folded into a one-line toolbar (spec §5). Starts
 * unfolded; once IndexedDB answers, takes what was kept, unless the reader
 * pressed the chevron first. Each press is kept.
 */
export const createHeaderStore = (db: SettingsDb): HeaderStore => {
  const [folded, setFolded, { getSnapshot }] = createState(false);

  let mut_touched = false;

  return {
    folded,
    toggle: () => {
      mut_touched = true;

      const next = !getSnapshot();

      setFolded(next);

      db.write(KEY, next).catch(() => undefined);
    },
    start: () => {
      let mut_stopped = false;

      db.read(KEY)
        .then((kept) => {
          if (!mut_stopped && !mut_touched && typeof kept === 'boolean') {
            setFolded(kept);
          }
        })
        .catch(() => undefined);

      return () => {
        mut_stopped = true;
      };
    },
  };
};

const KEY = 'header-folded';
