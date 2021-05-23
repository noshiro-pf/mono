import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './card-props';

export const Card5 = memoNamed('Card5', ({ color, textColor }: CardProps) => (
  <>
    <path d='M120 57V77.5H67L66 100.5L42.5 123L47 57H120Z' fill={textColor} />
    <path
      d='M130 137.5C130 162.077 108.734 182 82.5 182C56.2665 182 27 170.077 27 145.5C31.5 122 60.7665 93.5 87 93.5C113.234 93.5 130 112.923 130 137.5Z'
      fill={textColor}
    />
    <path d='M84.5 123L27 171L19 123H84.5Z' fill={color} />
    <path d='M43 100.5L42.5 125L30.5 122.5L43 100.5Z' fill={color} />
    <path
      d='M107 137.5C107 151.031 95.3594 162 81 162C57.5 159.5 46.5 147.5 55 137.5C55 123.969 66.6406 113 81 113C95.3594 113 107 123.969 107 137.5Z'
      fill={color}
    />
  </>
));
