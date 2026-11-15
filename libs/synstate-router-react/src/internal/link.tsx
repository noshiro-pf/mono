import * as React from 'react';
import {
  handleLinkClick,
  isHref,
  type AnyRoutes,
  type Router,
} from 'synstate-router';
import type { LinkProps } from '../link-props.mjs';

/** `Link` bound to `router` (`ReactRouter['Link']`). */
export const createLink = <R extends AnyRoutes>(
  router: Router<R>,
): ((props: LinkProps) => React.JSX.Element) => {
  // Named, so that React's component stacks and DevTools say `Link`.
  // eslint-disable-next-line react-coding-style/require-react-memo -- its `children` are new elements on most renders, so a memo would compare and draw anyway
  const Link = ({
    to,
    replace,
    viewTransition,
    state,
    onClick,
    children,
    ...anchorProps
  }: LinkProps): React.JSX.Element => {
    const handleClick = React.useCallback(
      (clickEvent: React.MouseEvent<HTMLAnchorElement>): void => {
        onClick?.(clickEvent);

        if (isHref(to)) {
          handleLinkClick(router, clickEvent, {
            replace,
            viewTransition,
            state,
          });
        }
      },
      [onClick, to, replace, viewTransition, state],
    );

    return (
      <a
        // An `<a>` with a router behind it: every anchor attribute passes on.
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...anchorProps}
        href={isHref(to) ? router.toUrl(to) : to}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  };

  return Link;
};
