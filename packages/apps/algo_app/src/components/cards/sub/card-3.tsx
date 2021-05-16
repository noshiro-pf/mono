import { memoNamed } from '@noshiro/preact-utils';
import type { CardProps } from './common';
import { useCardAttributes } from './common';

export const Card3 = memoNamed(
  'Card3',
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
          d='M118.5 135C118.5 158.196 96.3381 177 69 177C41.6619 177 19.5 158.196 19.5 135C19.5 111.804 40.5 98.0714 69 94C104 89 118.5 111.804 118.5 135Z'
          fill={textColor}
        />
        <path d='M24.3 161L56.5 134.75L10.5 119L24.3 161Z' fill={color} />
        <path
          d='M75.5 76.5L51.5 109L56.6089 138.5L7 120L75.5 76.5Z'
          fill={color}
        />
        <path
          d='M96.5 131.5C96.5 145.031 84.1878 156 69 156C53.8122 156 41.5 145.031 41.5 131.5C41.5 117.969 36 109 69 107C84.1878 107 96.5 117.969 96.5 131.5Z'
          fill={color}
        />
        <path
          d='M117 52L85.5 94.5L60.5 97L78.5 72H33.5V52H117Z'
          fill={textColor}
        />
      </svg>
    );
  }
);
