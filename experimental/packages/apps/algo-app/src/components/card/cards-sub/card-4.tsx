import { type CardProps } from './card-props';

export const Card4 = memoNamed('Card4', ({ textColor }: CardProps) => (
  <path
    d={
      'M73.5 57H96.5L63.5 131.5H91V101H113.5V131.5H130.5V152H113.5V182.5H91V152H32L73.5 57Z'
    }
    fill={textColor}
  />
));
