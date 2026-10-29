import type { InitializedObservable } from 'synstate';
import { createBooleanState } from 'synstate-react-hooks';

export type MediaDeps = Readonly<{
  /**
   * Calls `onChange` with whether the narrow-screen media query matches, each
   * time that changes; returns what stops it.
   */
  watchIsMobile: (onChange: (isMobile: boolean) => void) => () => void;
}>;

/**
 * Whether the screen is narrow. It starts `false` and follows the media query
 * from its first change on, once started.
 */
export const createMediaStore = (deps: MediaDeps): MediaStore => {
  const [useIsMobile, { setState: setIsMobile, state: isMobile$ }] =
    createBooleanState(false);

  const start = (): (() => void) =>
    deps.watchIsMobile((isMobile) => {
      setIsMobile(isMobile);
    });

  return { useIsMobile, isMobile$, start } as const;
};

export type MediaStore = Readonly<{
  useIsMobile: () => boolean;
  isMobile$: InitializedObservable<boolean>;
  /** Starts following the media query; returns what stops it. */
  start: () => () => void;
}>;
