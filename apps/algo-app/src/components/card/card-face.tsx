import { For, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import type { CardNumber } from '../../types/index.mjs';
import {
  Card0,
  Card1,
  Card10,
  Card11,
  Card2,
  Card3,
  Card4,
  Card5,
  Card6,
  Card7,
  Card8,
  Card9,
  type CardProps,
} from './cards-sub/index.mjs';

type Props = CardProps & Readonly<{ number: Bindable<CardNumber | undefined> }>;

/**
 * The face of the card `number`, or nothing while it is `undefined`: a `For`
 * of at most one row keyed by the number, so the face is drawn again only when
 * the number changes, and each row draws the number it was made for.
 */
export const CardFace = ({ number, color, textColor }: Props): JSX.Element => (
  <For
    items={mapBindable(number, (n) => (n === undefined ? [] : [n]))}
    key={(n) => n}
  >
    {(number$) =>
      CardComponents[number$.getSnapshot().value]({ color, textColor })
    }
  </For>
);

const CardComponents = [
  Card0,
  Card1,
  Card2,
  Card3,
  Card4,
  Card5,
  Card6,
  Card7,
  Card8,
  Card9,
  Card10,
  Card11,
] as const;
