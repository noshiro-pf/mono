import { constant, type JSX } from 'synstate-dom';
import { aboutThisAppUrl, dict } from '../../constants/index.mjs';
import * as styles from './footer.module.css';

export const Footer = (): JSX.Element => (
  <div class={constant(styles.footer)}>
    <a
      href={constant(aboutThisAppUrl)}
      rel={constant('noopener noreferrer')}
      target={constant('_blank')}
    >
      {constant(dict.aboutThisApp)}
    </a>
  </div>
);
