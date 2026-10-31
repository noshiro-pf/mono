import { constant, type JSX } from 'synstate-dom';
import type { CardProps } from './card-props.mjs';

export const Card6 = ({ color, textColor }: CardProps): JSX.Element => (
  <>
    <path
      d={constant(
        'M128 144C128 168.577 106.734 188.5 80.5 188.5C54.2665 188.5 33 168.577 33 144C33 119.423 44.5 99 86 99C112.234 99 128 119.423 128 144Z',
      )}
      fill={textColor}
    />
    <circle
      cx={constant('80.5')}
      cy={constant('143')}
      fill={color}
      r={constant('24.5')}
    />
    <path
      d={constant('M80 52L103 60.5L75 102L40 117L80 52Z')}
      fill={textColor}
    />
  </>
);
