import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { BadgeText } from '../../domain/index.mjs';
import './common.css';

type Props = Readonly<{ text: Bindable<BadgeText> }>;

/** A status: its tone, a glyph and a word, and what it rests on on hover. */
export const Badge = ({ text }: Props): JSX.Element => (
  <span
    class={constant('badge')}
    data-tone={mapBindable(text, ({ tone }) => tone)}
    title={mapBindable(text, ({ title }) => title)}
  >
    <If
      cond={mapBindable(text, ({ icon }) => icon !== undefined)}
      then={
        <svg
          aria-hidden={constant('true')}
          class={constant('badge-icon')}
          fill={constant('none')}
          stroke={constant('currentColor')}
          stroke-linecap={constant('round')}
          stroke-linejoin={constant('round')}
          stroke-width={constant(1.6)}
          viewBox={constant('0 0 16 16')}
        >
          <path d={mapBindable(text, ({ icon }) => icon ?? '')} />
        </svg>
      }
      else={
        <span aria-hidden={constant('true')}>
          {mapBindable(text, ({ glyph }) => glyph)}
        </span>
      }
    />
    {mapBindable(text, ({ word }) => word)}
    <If
      cond={mapBindable(text, ({ counts }) => counts !== '')}
      then={
        <span class={constant('badge-counts')}>
          {mapBindable(text, ({ counts }) => counts)}
        </span>
      }
    />
  </span>
);
