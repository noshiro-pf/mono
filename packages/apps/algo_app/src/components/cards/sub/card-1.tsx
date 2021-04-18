import { memoNamed } from '@noshiro/preact-utils';
import { CardProps, useCardAttributes } from './common';

export const Card1 = memoNamed(
  'Card1',
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
          d='M85.5 48V175.5H62.8265V84.5L46 95.5V72.5L85.5 48Z'
          fill={textColor}
        />
      </svg>
    );
  }
);
