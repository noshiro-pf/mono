import { useState } from 'better-preact-use-state';
import { useEffect, useMemo } from 'preact/hooks';

type MediaQueryState = Readonly<{
  matches: boolean;
  media: string;
}>;

/**
 * What `preact-media-hook`'s `useMedia` did, ported here.
 *
 * The package is a thin wrapper over `matchMedia` and has no successor in this
 * repository, so it follows the precedent set by `getPlatform` and
 * `PromiseState` in `apps/react-utils`: port the one function the app uses into
 * the app that uses it, rather than take a dependency for it.
 *
 * The subscription is what the wrapper was for — a bare `matchMedia` read would
 * never update when the viewport crosses the breakpoint.
 *
 * `useState` is called without an explicit type argument: the React Compiler's
 * `react-hooks/hooks` rule reads `useState<MediaQueryState>(…)` here as a
 * reference to the hook rather than a call. `initialState` carries the type
 * instead, which pins it just as well.
 */
export const useMedia = (query: string): MediaQueryState => {
  const mediaQueryList = useMemo(() => matchMedia(query), [query]);

  const initialState: MediaQueryState = {
    matches: mediaQueryList.matches,
    media: mediaQueryList.media,
  } as const;

  const [state, setMediaState] = useState(initialState);

  useEffect(() => {
    const onChange = (): void => {
      setMediaState({
        matches: mediaQueryList.matches,
        media: mediaQueryList.media,
      });
    };

    // `query` may have changed since the initial state was computed.
    onChange();

    mediaQueryList.addEventListener('change', onChange);

    return () => {
      mediaQueryList.removeEventListener('change', onChange);
    };
  }, [mediaQueryList, setMediaState]);

  return state;
};
