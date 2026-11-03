import * as React from 'react';
import type { AnyRouteNode, Href } from 'synstate-router';
import { Link, useIsActive } from '../routes.mjs';

type Props = Readonly<{
  to: Href;
  /** The node whose pages mark this link current. */
  node: AnyRouteNode;
  /** Current only on the node itself, not below it. */
  exact?: boolean;
  children: React.ReactNode;
}>;

export const NavLink = React.memo<Props>((props) => {
  const { to, node, exact = false, children } = props;

  const active = useIsActive(node, { exact });

  return (
    <Link aria-current={active ? 'page' : undefined} to={to}>
      {children}
    </Link>
  );
});

NavLink.displayName = 'NavLink';
