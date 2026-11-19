import { Icon } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import { pageWidthClass } from '../styled/index.mjs';
import * as styles from './header.module.css';
import { NavBar } from './navbar.js';

type Props = Readonly<{ title: string }>;

/** The navbar, screen-wide, and the page's title, at the page's width. */
export const Header = ({ title }: Props): JSX.Element => (
  <div>
    <NavBar />
    <div class={constant(`${styles.row} ${pageWidthClass}`)}>
      <span class={constant(styles.title)} data-e2e={constant('page-title')}>
        <Icon icon={'timeline-events'} size={28} />
        <div>{constant(title)}</div>
      </span>
    </div>
  </div>
);
