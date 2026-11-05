import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './section-title.module.css';

type Props = Readonly<{ children: Child }>;

export const SectionTitle = ({ children }: Props): JSX.Element => (
  <div class={constant(styles.title)}>{children}</div>
);
