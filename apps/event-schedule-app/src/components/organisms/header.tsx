import { Icon } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import * as styles from './header.module.css';
import { NavBar } from './navbar.js';

type Props = Readonly<{ title: string }>;

export const Header = ({ title }: Props): JSX.Element => (
  <div>
    <NavBar />
    <div class={constant(styles.row)}>
      <span class={constant(styles.title)}>
        <Icon icon={'timeline-events'} size={28} />
        <div>{constant(title)}</div>
      </span>
    </div>
  </div>
);
