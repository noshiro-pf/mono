import { constant, type JSX } from 'synstate-dom';
import type { CardProps } from './card-props.mjs';

export const Card9 = ({ color, textColor }: CardProps): JSX.Element => (
  <>
    <ellipse
      cx={constant('75.5')}
      cy={constant('98')}
      fill={textColor}
      rx={constant('46.5')}
      ry={constant('44')}
    />
    <circle
      cx={constant('75.5')}
      cy={constant('98.5')}
      fill={color}
      r={constant('24.5')}
    />
    <path
      d={constant('M131 79.5L95.1864 186.5L71 185L112.5 77L131 79.5Z')}
      fill={textColor}
    />
  </>
);
