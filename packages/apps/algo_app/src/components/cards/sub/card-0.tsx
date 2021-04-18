import { memoNamed } from '@noshiro/preact-utils';
import { CardProps, useCardAttributes } from './common';

export const Card0 = memoNamed(
  'Card0',
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
          d='M103.259 55.5944C111.417 63.6585 116 74.5957 116 86H72.5L29 86C29 74.5957 33.583 63.6585 41.7409 55.5944C49.8987 47.5303 60.9631 43 72.5 43C84.0369 43 95.1013 47.5303 103.259 55.5944Z'
          fill={textColor}
        />
        <path
          d='M103.259 168.406C111.417 160.342 116 149.404 116 138H72.5L29 138C29 149.404 33.583 160.342 41.7409 168.406C49.8987 176.47 60.9631 181 72.5 181C84.0369 181 95.1013 176.47 103.259 168.406Z'
          fill={textColor}
        />
        <rect x='29' y='85' width='87' height='54' fill={textColor} />
        <path
          d='M86.2886 72.2721C89.9455 75.6477 92 80.2261 92 85H72.5L53 85C53 80.2261 55.0545 75.6477 58.7114 72.2721C62.3684 68.8964 67.3283 67 72.5 67C77.6717 67 82.6316 68.8964 86.2886 72.2721Z'
          fill={color}
        />
        <path
          d='M86.2886 150.728C89.9455 147.352 92 142.774 92 138H72.5L53 138C53 142.774 55.0545 147.352 58.7114 150.728C62.3684 154.104 67.3283 156 72.5 156C77.6717 156 82.6316 154.104 86.2886 150.728Z'
          fill={color}
        />
        <rect x='53' y='84' width='39' height='55' fill={color} />
      </svg>
    );
  }
);
