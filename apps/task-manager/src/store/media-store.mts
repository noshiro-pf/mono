import {
  createState,
  empty,
  map,
  switchMap,
  withInitialValue,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';

export type MediaDeps = Readonly<{
  matches: () => boolean;
  change: SynstateObservable<unknown>;
}>;

export type MediaStore = Readonly<{
  matches: InitializedObservable<boolean>;
  /** Starts listening, and returns what stops it. */
  start: () => () => void;
}>;

/**
 * Whether a media query matches, kept current: the screen is narrow, the system
 * is dark. A phone turned on its side changes the first.
 */
export const createMediaStore = (deps: MediaDeps): MediaStore => {
  // Listened to only while started; switching away disposes the listener.
  const [started, setStarted] = createState(false);

  const matches = started
    .pipe(
      switchMap((isStarted) =>
        isStarted
          ? deps.change.pipe(map(() => deps.matches()))
          : empty<boolean>(),
      ),
    )
    .pipe(withInitialValue(deps.matches()));

  return {
    matches,
    start: () => {
      setStarted(true);

      return () => {
        setStarted(false);
      };
    },
  };
};
