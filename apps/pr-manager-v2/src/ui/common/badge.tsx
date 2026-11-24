import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { BadgeText } from '../../domain/index.mjs';
import './common.css';
import { PathIcon } from './path-icon.js';

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
      then={<PathIcon path={mapBindable(text, ({ icon }) => icon ?? '')} />}
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
