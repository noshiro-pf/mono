import { memoNamed } from '@noshiro/preact-utils';
import type { StrictOmit } from '@noshiro/ts-utils';
import type { CardProps } from './common';
import { useCardAttributes } from './common';

export const CardEmpty = memoNamed(
  'CardEmpty',
  ({ color, size }: StrictOmit<CardProps, 'visibleToMe'>) => {
    const { width, height, style } = useCardAttributes(color, size, false);

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
      </svg>
    );
  }
);
