import { createBooleanState, createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [isActive$] = createBooleanState(false);

const [progress$] = createState(0.3);

export const Item = (): JSX.Element => (
  // One `Bindable<boolean>` per class name: each is toggled on its own.
  <li class={{ item: constant(true), active: isActive$ }}>
    {/* Or the whole class as one string. Never both on one element. */}
    <span class={view(isActive$, (active) => (active ? 'on' : 'off'))}>
      {constant('status')}
    </span>
    {/* One `Bindable<string>` per hyphenated CSS property name. */}
    <div
      style={{
        width: view(progress$, (p) => `${p * 100}%`),
        'background-color': constant('teal'),
      }}
    />
  </li>
);
