import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './mui-card.module.css';

type Props = Readonly<{
  children: Child;
  /** Lets the content take the width the card has, scrolling what overflows. */
  fill?: boolean;
}>;

/**
 * MUI's `Card` (an elevation-1 `Paper`) holding one `CardContent`, in the
 * default theme's look.
 */
export const MuiCard = ({ children, fill = false }: Props): JSX.Element => (
  <div class={constant(styles.card)}>
    <div
      class={constant(
        fill ? `${styles.content} ${styles.fill}` : styles.content,
      )}
    >
      {children}
    </div>
  </div>
);
