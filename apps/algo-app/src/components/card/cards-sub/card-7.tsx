import { memoNamed } from 'preact-utils';
import { type CardProps } from './card-props.mjs';

export const Card7 = memoNamed('Card7', (props: CardProps) => (
  <path
    d={'M60.5 101H39V59H132.5L77.5 182.5H54.5L100 79.5H60.5V101Z'}
    fill={props.textColor}
  />
));
