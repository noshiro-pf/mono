/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as React from 'react';
import { type Router, type RoutesDefInput } from 'synstate-router';

type LinkProps<D extends RoutesDefInput> = Readonly<{
  router: Router<D>;
  to: string;
  replace?: boolean;
  children?: React.ReactNode;
}> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

/**
 * History-aware link component for SPA navigation.
 *
 * - Same-origin links use `router.push()` or `router.redirect()` (based on `replace` prop)
 * - External links use standard browser navigation
 * - Modifier keys (Ctrl, Cmd, Shift, Alt) bypass SPA navigation
 * - `target` attribute is respected
 */

const LinkInner = <D extends RoutesDefInput>(
  {
    router,
    to,
    replace: shouldReplace = false,
    children,
    ...rest
  }: LinkProps<D>,
  ref: React.Ref<HTMLAnchorElement>,
): React.JSX.Element => {
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.currentTarget.getAttribute('target') ?? undefined;

      if (target !== undefined && target !== '_self') return;

      try {
        const url = new URL(to, globalThis.window.location.href);

        if (url.origin !== globalThis.window.location.origin) return;
      } catch {
        return;
      }

      e.preventDefault();

      if (shouldReplace) {
        router.redirect(to);
      } else {
        router.push(to);
      }
    },
    [router, to, shouldReplace],
  );

  return React.createElement(
    'a',
    { ...rest, href: to, onClick: handleClick, ref },
    children,
  );
};

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
export const Link = React.forwardRef(LinkInner) as <D extends RoutesDefInput>(
  props: LinkProps<D> & Readonly<{ ref?: React.Ref<HTMLAnchorElement> }>,
) => React.JSX.Element;
