import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './custom-scrollbar-wrapper.module.css';

type Props = Readonly<{
  children: Child;
  /** Classes after the wrapper's own. */
  class?: string;
  /** Called with the scrolling `<div>`. */
  ref?: (element: HTMLDivElement) => void;
}>;

/** Scrolls sideways, with a thin rounded scroll bar. */
export const CustomScrollbarWrapper = ({
  children,
  class: className,
  ref,
}: Props): JSX.Element => (
  <div
    {...(ref === undefined ? {} : { ref })}
    class={constant(
      className === undefined
        ? styles.wrapper
        : `${styles.wrapper} ${className}`,
    )}
  >
    {children}
  </div>
);
