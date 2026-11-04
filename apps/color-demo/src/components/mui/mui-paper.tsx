import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './mui-paper.module.css';

type Props = Readonly<{
  children: Child;
  /** `outlined` is MUI's `variant="outlined"`; `elevation` its default. */
  variant: 'elevation' | 'outlined';
  /** Spacing the app adds around an outlined paper. */
  spaced?: boolean;
  'data-e2e'?: string;
}>;

/** MUI's `Paper`, rounded, in the default theme's look. */
export const MuiPaper = ({
  children,
  variant,
  spaced = false,
  'data-e2e': dataE2e,
}: Props): JSX.Element => (
  <div
    class={{
      [styles.paper]: constant(true),
      [styles.elevation1]: constant(variant === 'elevation'),
      [styles.outlined]: constant(variant === 'outlined'),
      [styles.spaced]: constant(spaced),
    }}
    data-e2e={dataE2e === undefined ? undefined : constant(dataE2e)}
  >
    {children}
  </div>
);
