import {
  createState,
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
 * Whether a media query matches, kept current: the screen is narrow, the
 * system is dark. A phone turned on its side changes the first.
 */
export const createMediaStore = (deps: MediaDeps): MediaStore => {
  const [matches, setMatches] = createState(deps.matches());

  return {
    matches,
    start: () => {
      const subscription = deps.change.subscribe(() => {
        setMatches(deps.matches());
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
