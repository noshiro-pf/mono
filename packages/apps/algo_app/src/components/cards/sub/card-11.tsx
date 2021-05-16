import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './common';
import { useCardAttributes } from './common';

export const Card11 = memoNamed(
  'Card11',
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
          d='M66.5 48V175.5H43.8265V84.5L27 95.5V72.5L66.5 48Z'
          fill={textColor}
        />
        <path
          d='M118 48V175.5H95.3265V84.5L78.5 95.5V72.5L118 48Z'
          fill={textColor}
        />
      </svg>
    );
  }
);
