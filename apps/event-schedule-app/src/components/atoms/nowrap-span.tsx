import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './nowrap-span.module.css';

type Props = Readonly<{ children: Child }>;

export const NoWrapSpan = ({ children }: Props): JSX.Element => (
  <span class={constant(styles.nowrap)}>{children}</span>
);
