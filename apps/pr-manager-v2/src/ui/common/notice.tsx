import { constant, type Child, type JSX } from 'synstate-dom';

/** A paragraph that says something about the whole page. */
export const Notice = ({
  children,
}: Readonly<{ children: Child }>): JSX.Element => (
  <p class={constant('notice')}>{children}</p>
);
