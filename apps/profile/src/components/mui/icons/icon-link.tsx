import { constant, type JSX } from 'synstate-dom';
import * as styles from './icon-link.module.css';

type Props = Readonly<{
  href: string;
  /** The link's accessible name: the icon alone has none. */
  label: string;
  /** An SVG path on a 24 × 24 view box. */
  path: string;
}>;

/** A 32 px icon linking to another site, opened in a new tab. */
export const IconLink = ({ href, label, path }: Props): JSX.Element => (
  <a
    aria-label={constant(label)}
    class={constant(styles.link)}
    href={constant(href)}
    rel={constant('noreferrer')}
    target={constant('_blank')}
  >
    <svg
      fill={constant('none')}
      height={constant(32)}
      viewBox={constant('0 0 24 24')}
      width={constant(32)}
    >
      <path d={constant(path)} fill={constant('rgba(0, 0, 0, 0.54)')} />
    </svg>
  </a>
);
