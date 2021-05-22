import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './card-props';

export const Card1 = memoNamed('Card1', ({ textColor }: CardProps) => (
  <>
    <path
      d='M93.5 56V183.5H70.8265V92.5L54 103.5V80.5L93.5 56Z'
      fill={textColor}
    />
  </>
));
