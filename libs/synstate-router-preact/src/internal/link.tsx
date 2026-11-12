import type { JSX, TargetedMouseEvent } from 'preact';
import { useCallback } from 'preact/hooks';
import {
  handleLinkClick,
  isHref,
  type AnyRoutes,
  type Router,
} from 'synstate-router';
import type { LinkProps } from '../link-props.mjs';

/** `Link` bound to `router` (`PreactRouter['Link']`). */
export const createLink = <R extends AnyRoutes>(
  router: Router<R>,
): ((props: LinkProps) => JSX.Element) => {
  // Named, so that Preact's devtools say `Link`.
  const Link = ({
    to,
    replace,
    onClick,
    children,
    ...anchorProps
  }: LinkProps): JSX.Element => {
    const handleClick = useCallback(
      (clickEvent: TargetedMouseEvent<HTMLAnchorElement>): void => {
        onClick?.(clickEvent);

        if (isHref(to)) {
          handleLinkClick(router, clickEvent, { replace });
        }
      },
      [onClick, to, replace],
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
