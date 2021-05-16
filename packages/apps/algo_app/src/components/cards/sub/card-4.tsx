import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './common';
import { useCardAttributes } from './common';

export const Card4 = memoNamed(
  'Card4',
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
          d='M65.5 49H88.5L55.5 123.5H83V93H105.5V123.5H122.5V144H105.5V174.5H83V144H24L65.5 49Z'
          fill={textColor}
        />
      </svg>
    );
  }
);
