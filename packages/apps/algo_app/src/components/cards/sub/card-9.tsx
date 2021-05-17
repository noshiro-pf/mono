import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './common';
import { useCardAttributes } from './common';

export const Card9 = memoNamed(
  'Card9',
  ({ color, size, visibleToMe }: CardProps) => {
    const { textColor, width, height, style } = useCardAttributes(
      color,
      size,
      visibleToMe
    );

    return (
      <svg
        width={width}
        height={height}
        viewBox='0 0 145 225'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={style}
      >
        <rect width='145' height='225' rx='14' fill={color} />
        <ellipse cx='67.5' cy='90' rx='46.5' ry='44' fill={textColor} />
        <circle cx='67.5' cy='90.5' r='24.5' fill={color} />
        <path
          d='M123 71.5L87.1864 178.5L63 177L104.5 69L123 71.5Z'
          fill={textColor}
        />
      </svg>
    );
  }
);
