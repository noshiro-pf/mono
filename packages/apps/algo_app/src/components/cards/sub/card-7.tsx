import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './common';
import { useCardAttributes } from './common';

export const Card7 = memoNamed(
  'Card7',
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
          d='M52.5 93H31V51H124.5L69.5 174.5H46.5L92 71.5H52.5V93Z'
          fill={textColor}
        />
      </svg>
    );
  }
);
