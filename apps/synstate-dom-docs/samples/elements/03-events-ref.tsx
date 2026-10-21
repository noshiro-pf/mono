import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [position$, setPosition] = createState('');

const [width$, setWidth] = createState(0);

const resizeObserver = new ResizeObserver((entries) => {
  setWidth(entries[0]?.contentRect.width ?? 0);
});

export const Pad = (): JSX.Element => (
  <div
    ref={(element) => {
      // Called once, right after the element is created and before anything
      // is bound or its children are mounted.
      resizeObserver.observe(element);
    }}
    onPointerMove={(event) => {
      // `currentTarget` is narrowed to the element: HTMLDivElement here.
      const rect = event.currentTarget.getBoundingClientRect();

      setPosition(
        `${Math.round(event.clientX - rect.left)}, ${Math.round(event.clientY - rect.top)}`,
      );
    }}
  >
    {constant('Pointer at ')}
    {position$}
    {view(width$, (w) => ` in a pad ${Math.round(w)}px wide`)}
  </div>
);
