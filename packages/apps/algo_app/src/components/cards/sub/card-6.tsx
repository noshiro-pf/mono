import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './common';
import { useCardAttributes } from './common';

export const Card6 = memoNamed(
  'Card6',
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
        <path
          d='M120 136C120 160.577 98.7335 180.5 72.5 180.5C46.2665 180.5 25 160.577 25 136C25 111.423 36.5 91 78 91C104.234 91 120 111.423 120 136Z'
          fill={textColor}
        />
        <circle cx='72.5' cy='135' r='24.5' fill={color} />
        <path d='M72 44L95 52.5L67 94L32 109L72 44Z' fill={textColor} />
      </svg>
    );
  }
);
