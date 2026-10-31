import {
  constant,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { CardNumber } from '../../types/index.mjs';
import { CardFace } from './card-face.js';
import * as styles from './card-side.module.css';
import type { CardProps } from './cards-sub/index.mjs';

type Props = CardProps &
  Readonly<{
    /** Turned away, so that the other side shows. */
    turnedAway: Bindable<boolean>;
    rectStyle: ReadonlyRecord<string, Bindable<string | undefined>>;
    number: Bindable<CardNumber | undefined>;
    children?: Child;
  }>;

/**
 * One side of a card: its outline, the face `number` while it is set, and
 * `children` on top. Both sides lie on each other and turn about the vertical
 * axis; the side turned away is hidden.
 */
export const CardSide = ({
  turnedAway,
  rectStyle,
  number,
  color,
  textColor,
  children = [],
}: Props): JSX.Element => (
  <svg
    class={constant(styles.side)}
    fill={constant('none')}
    style={{
      transform: mapBindable(turnedAway, (away) =>
        away ? 'rotateY(180deg)' : 'rotateY(0)',
      ),
    }}
    viewBox={constant('0 0 161 241')}
  >
    <rect
      height={constant(233)}
      rx={constant(18)}
      style={rectStyle}
      width={constant(153)}
      x={constant(4)}
      y={constant(4)}
    />
    <CardFace color={color} number={number} textColor={textColor} />
    {children}
  </svg>
);
