import { constant, type JSX } from 'synstate-dom';
import type { CardProps } from './card-props.mjs';

export const Card1 = (props: CardProps): JSX.Element => (
  <path
    d={constant('M93.5 56V183.5H70.8265V92.5L54 103.5V80.5L93.5 56Z')}
    fill={props.textColor}
  />
);
