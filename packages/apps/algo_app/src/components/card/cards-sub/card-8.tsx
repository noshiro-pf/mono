import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './card-props';

export const Card8 = memoNamed('Card8', ({ color, textColor }: CardProps) => (
  <>
    <ellipse cx='80.5' cy='87.5' fill={textColor} rx='38.5' ry='33.5' />
    <path
      d='M126 149C126 169.987 105.405 187 80 187C54.5949 187 34 169.987 34 149C34 128.013 44 111 80 111C116.5 111 126 128.013 126 149Z'
      fill={textColor}
    />
    <ellipse cx='80.5' cy='89.5' fill={color} rx='16.5' ry='17.5' />
    <ellipse cx='80' cy='145.5' fill={color} rx='24' ry='20.5' />
  </>
));
