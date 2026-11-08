import { constant, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

const [radius$] = createState(10);

// Everything inside `<svg>` is created in the SVG namespace, down to a
// `<foreignObject>`, whose contents are HTML again.
export const Dot = (): JSX.Element => (
  <svg viewBox={constant('0 0 100 100')} width={constant(100)}>
    {/* `a` and `title` are SVG elements here, because of where they stand. */}
    <a href={constant('#dot')}>
      <title>{constant('A dot')}</title>
      <circle
        cx={constant(50)}
        cy={constant(50)}
        r={radius$}
        fill={radius$.pipe(map((r) => (r > 30 ? 'tomato' : 'teal')))}
      />
    </a>
    <foreignObject
      x={constant(0)}
      y={constant(80)}
      width={constant(100)}
      height={constant(20)}
    >
      {/* HTML again: a real `<p>`, laid out as text. */}
      <p>{radius$.pipe(map((r) => `r = ${r}`))}</p>
    </foreignObject>
  </svg>
);
