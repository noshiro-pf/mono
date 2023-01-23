import { type CardProps } from './card-props';

export const Card9 = memoNamed('Card9', ({ color, textColor }: CardProps) => (
  <>
    <ellipse cx='75.5' cy='98' fill={textColor} rx='46.5' ry='44' />
    <circle cx='75.5' cy='98.5' fill={color} r='24.5' />
    <path
      d='M131 79.5L95.1864 186.5L71 185L112.5 77L131 79.5Z'
      fill={textColor}
    />
  </>
));
