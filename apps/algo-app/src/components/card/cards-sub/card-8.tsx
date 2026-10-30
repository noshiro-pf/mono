import { constant, type JSX } from 'synstate-dom';
import type { CardProps } from './card-props.mjs';

export const Card8 = ({ color, textColor }: CardProps): JSX.Element => (
  <>
    <ellipse
      cx={constant('80.5')}
      cy={constant('87.5')}
      fill={textColor}
      rx={constant('38.5')}
      ry={constant('33.5')}
    />
    <path
      d={constant(
        'M126 149C126 169.987 105.405 187 80 187C54.5949 187 34 169.987 34 149C34 128.013 44 111 80 111C116.5 111 126 128.013 126 149Z',
      )}
      fill={textColor}
    />
    <ellipse
      cx={constant('80.5')}
      cy={constant('89.5')}
      fill={color}
      rx={constant('16.5')}
      ry={constant('17.5')}
    />
    <ellipse
      cx={constant('80')}
      cy={constant('145.5')}
      fill={color}
      rx={constant('24')}
      ry={constant('20.5')}
    />
  </>
);
