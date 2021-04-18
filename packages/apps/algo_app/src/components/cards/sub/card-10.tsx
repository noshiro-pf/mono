import { memoNamed } from '@noshiro/preact-utils';
import { CardProps, useCardAttributes } from './common';

export const Card10 = memoNamed(
  'Card10',
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
          d='M118.895 57.7157C125.365 65.2172 129 75.3913 129 86H94.5L60 86C60 75.3913 63.6348 65.2172 70.1048 57.7157C76.5748 50.2143 85.35 46 94.5 46C103.65 46 112.425 50.2143 118.895 57.7157Z'
          fill={textColor}
        />
        <path
          d='M118.895 167.284C125.365 159.783 129 149.609 129 139H94.5L60 139C60 149.609 63.6348 159.783 70.1048 167.284C76.5748 174.786 85.35 179 94.5 179C103.65 179 112.425 174.786 118.895 167.284Z'
          fill={textColor}
        />
        <path d='M60 85H129V140H60V85Z' fill={textColor} />
        <path
          d='M105.46 73.9792C108.367 77.1673 110 81.4913 110 86H94.5L79 86C79 81.4913 80.633 77.1673 83.5398 73.9792C86.4467 70.7911 90.3891 69 94.5 69C98.6109 69 102.553 70.7911 105.46 73.9792Z'
          fill={color}
        />
        <path
          d='M105.46 151.021C108.367 147.833 110 143.509 110 139H94.5L79 139C79 143.509 80.633 147.833 83.5398 151.021C86.4467 154.209 90.3891 156 94.5 156C98.6109 156 102.553 154.209 105.46 151.021Z'
          fill={color}
        />
        <rect x='79' y='85' width='31' height='55' fill={color} />
        <path
          d='M51 48V175H31.4836V84.3569L17 95.3137V72.4039L51 48Z'
          fill={textColor}
        />
      </svg>
    );
  }
);
