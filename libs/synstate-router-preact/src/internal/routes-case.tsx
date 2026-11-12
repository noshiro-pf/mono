import type { ComponentChildren, JSX } from 'preact';

type Props = Readonly<{
  draw: (values: unknown) => ComponentChildren;
  values: unknown;
}>;

/**
 * A case of `Routes`, called in a component of its own: the hooks a case calls
 * are this component's, so that the key `Routes` gives it remounts them with the
 * case.
 */
export const RoutesCase = ({ draw, values }: Props): JSX.Element => (
  <>{draw(values)}</>
);
