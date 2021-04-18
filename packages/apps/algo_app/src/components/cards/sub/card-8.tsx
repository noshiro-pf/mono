import { memoNamed } from '@noshiro/preact-utils';
import { CardProps, useCardAttributes } from './common';

export const Card8 = memoNamed(
  'Card8',
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
        <ellipse cx='72.5' cy='79.5' rx='38.5' ry='33.5' fill={textColor} />
        <path
          d='M118 141C118 161.987 97.4051 179 72 179C46.5949 179 26 161.987 26 141C26 120.013 36 103 72 103C108.5 103 118 120.013 118 141Z'
          fill={textColor}
        />
        <ellipse cx='72.5' cy='81.5' rx='16.5' ry='17.5' fill={color} />
        <ellipse cx='72' cy='137.5' rx='24' ry='20.5' fill={color} />
      </svg>
    );
  }
);
