import { constant, type JSX } from 'synstate-dom';
import type { CardProps } from './card-props.mjs';

export const Card11 = (props: CardProps): JSX.Element => (
  <>
    <path
      d={constant('M74.5 56V183.5H51.8265V92.5L35 103.5V80.5L74.5 56Z')}
      fill={props.textColor}
    />
    <path
      d={constant('M126 56V183.5H103.327V92.5L86.5 103.5V80.5L126 56Z')}
      fill={props.textColor}
    />
  </>
);
