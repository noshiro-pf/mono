import { createState, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';

const [radius$] = createState(10);

// `svg` and `circle` are created in the SVG namespace.
export const Dot = (): JSX.Element => (
  <svg viewBox={constant('0 0 100 100')} width={constant(100)}>
    <circle
      cx={constant(50)}
      cy={constant(50)}
      r={radius$}
      fill={radius$.pipe(map((r) => (r > 30 ? 'tomato' : 'teal')))}
    />
  </svg>
);
