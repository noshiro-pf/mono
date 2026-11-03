import type * as React from 'react';

type Props = Readonly<{
  draw: (values: unknown) => React.ReactNode;
  values: unknown;
}>;

/**
 * A case of `Routes`, called in a component of its own: the hooks a case calls
 * are this component's, so that the key `Routes` gives it remounts them with the
 * case.
 */
// eslint-disable-next-line react-coding-style/require-react-memo -- drawn again whenever `Routes` is, as the case was before it had a component: a case may read what its parent's render did
export const RoutesCase = ({ draw, values }: Props): React.JSX.Element => (
  <>{draw(values)}</>
);
