import type { DeepReadonly } from '@noshiro/ts-utils';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { withSlash } from '../constants';

type Router = DeepReadonly<{
  pathname: string;
  push: (nextPath: string) => void;
  replace: (nextPath: string) => void;
  back: () => void;
}>;

export const useRouter = (): Router => {
  const [pathname, setPathname] = useState<string>(location.pathname);

  const pathnameWithSlash = withSlash(pathname);

  const updatePathname = useCallback(() => {
    setPathname(location.pathname);
  }, []);

  const push = useCallback(
    (nextPath: string) => {
      const p = withSlash(nextPath);
      history.pushState({}, '', p);
      updatePathname();
    },
    [updatePathname]
  );

  const back = useCallback(() => {
    window.history.back();
    updatePathname();
  }, [updatePathname]);

  const replace = useCallback(
    (nextPath: string) => {
      const p = withSlash(nextPath);
      window.history.replaceState({}, '', p);
      updatePathname();
    },
    [updatePathname]
  );

  useEffect(() => {
    window.addEventListener('popstate', updatePathname);
    return () => {
      window.removeEventListener('popstate', updatePathname);
    };
  }, [updatePathname]);

  return {
    pathname: pathnameWithSlash,
    push,
    replace,
    back,
  };
};
