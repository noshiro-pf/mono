import { useCallback } from 'react';

const isModifiedEvent = (
  ev: Record<'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey', boolean>,
): boolean => ev.metaKey || ev.altKey || ev.ctrlKey || ev.shiftKey;

type Path = Readonly<{
  /**
   * A URL pathname, beginning with a /.
   *
   * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#location.pathname
   */
  pathname: string;

  /**
   * A URL search string, beginning with a ?.
   *
   * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#location.search
   */
  search: string;

  /**
   * A URL fragment identifier, beginning with a #.
   *
   * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#location.hash
   */
  hash: string;
}>;

/**
 * Creates a string URL path from the given pathname, search, and hash
 * components.
 *
 * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#createpath
 */
const createPath = ({
  pathname = '/',
  search = '',
  hash = '',
}: Partial<Path>): string =>
  `${pathname}${
    search !== '' && search !== '?'
      ? search.startsWith('?')
        ? search
        : `?${search}`
      : ''
  }${
    hash !== '' && hash !== '#'
      ? hash.startsWith('#')
        ? hash
        : `#${hash}`
      : ''
  }`;

export const useRouterLinkClick = ({
  replace: replaceProp,
  redirectFn,
  pushFn,
}: Readonly<{
  replace?: boolean;
  redirectFn: (path: string) => void;
  pushFn: (path: string) => void;
}>): React.MouseEventHandler<HTMLElement> =>
  useCallback(
    (ev) => {
      const el = ev.target;
      if (!(el instanceof HTMLAnchorElement)) {
        console.warn(
          'useRouterLinkClick should be used for HTMLAnchorElement.',
        );
        return;
      }

      const href = el.href;

      if (
        !ev.defaultPrevented &&
        ev.button === 0 && // Ignore everything but left clicks
        (el.target === '' || el.target === '_self') && // Let browser handle "target=_blank" etc.
        !isModifiedEvent(ev) // Ignore clicks with modifier keys
      ) {
        ev.preventDefault();

        // If the URL hasn't changed, a regular <a> will do a replace instead of
        // a push, so do the same here.
        const replace =
          replaceProp === true || createPath(window.location) === href;

        if (replace) {
          redirectFn(href);
        } else {
          pushFn(href);
        }
      }
    },
    [replaceProp, pushFn, redirectFn],
  );
