import { mapBindable, type Child, type JSX } from 'synstate-dom';
import type { AnyRouteNode, Href } from 'synstate-router';
import { Link, router } from '../routes.mjs';

type Props = Readonly<{
  to: Href;
  /** The node whose pages mark this link current. */
  node: AnyRouteNode;
  /** Current only on the node itself, not below it. */
  exact?: boolean;
  children: Child;
}>;

export const NavLink = (props: Props): JSX.Element => (
  <Link
    aria-current={mapBindable(
      router.isActive(props.node, { exact: props.exact ?? false }),
      (active) => (active ? 'page' : undefined),
    )}
    to={props.to}
  >
    {props.children}
  </Link>
);
