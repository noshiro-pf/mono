import type { InitializedObservable } from 'synstate';
import { createBooleanState } from 'synstate-react-hooks';

export type MediaDeps = Readonly<{
  /** Whether the narrow-screen media query matches now. */
  isMobile: () => boolean;
  /**
   * Calls `onChange` with whether the narrow-screen media query matches, each
   * time that changes; returns what stops it.
   */
  watchIsMobile: (onChange: (isMobile: boolean) => void) => () => void;
}>;

/**
 * Whether the screen is narrow. It starts from the media query as it matches on
 * creation, so that the first render has it, and follows its changes once
 * started. Each start reads it again first, because nothing replays a change
 * made while no listener was attached (before the first start, or after a
 * stop). The app starts it once, in the same task it creates it, so this is a
 * guarantee of the store rather than a case the app reaches.
 */
export const createMediaStore = (deps: MediaDeps): MediaStore => {
  const [useIsMobile, { setState: setIsMobile, state: isMobile$ }] =
    createBooleanState(deps.isMobile());

  const start = (): (() => void) => {
    setIsMobile(deps.isMobile());

    return deps.watchIsMobile((isMobile) => {
      setIsMobile(isMobile);
    });
  };

  return { useIsMobile, isMobile$, start } as const;
};

export type MediaStore = Readonly<{
  useIsMobile: () => boolean;
  isMobile$: InitializedObservable<boolean>;
  /**
   * Sets `isMobile$` from the media query as it is now, then follows it;
   * returns what stops it.
   */
  start: () => () => void;
}>;
