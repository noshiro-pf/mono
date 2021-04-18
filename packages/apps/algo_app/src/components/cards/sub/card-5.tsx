import { memoNamed } from '@noshiro/preact-utils';
import { CardProps, useCardAttributes } from './common';

export const Card5 = memoNamed(
  'Card5',
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
          d='M112 49V69.5H59L58 92.5L34.5 115L39 49H112Z'
          fill={textColor}
        />
        <path
          d='M122 129.5C122 154.077 100.734 174 74.5 174C48.2665 174 19 162.077 19 137.5C23.5 114 52.7665 85.5 79 85.5C105.234 85.5 122 104.923 122 129.5Z'
          fill={textColor}
        />
        <path d='M76.5 115L19 163L11 115H76.5Z' fill={color} />
        <path d='M35 92.5L34.5 117L22.5 114.5L35 92.5Z' fill={color} />
        <path
          d='M99 129.5C99 143.031 87.3594 154 73 154C49.5 151.5 38.5 139.5 47 129.5C47 115.969 58.6406 105 73 105C87.3594 105 99 115.969 99 129.5Z'
          fill={color}
        />
      </svg>
    );
  }
);
