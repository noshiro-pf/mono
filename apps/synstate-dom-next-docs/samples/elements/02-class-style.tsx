import { constant, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';

const [isActive$] = createBooleanState(false);

const [progress$] = createState(0.3);

export const Item = (): JSX.Element => (
  // One `Bindable<boolean>` per class name: each is toggled on its own.
  <li class={{ item: constant(true), active: isActive$ }}>
    {/* Or the whole class as one string. Never both on one element. */}
    <span class={isActive$.pipe(map((active) => (active ? 'on' : 'off')))}>
      {constant('status')}
    </span>
    {/* One `Bindable<string>` per hyphenated CSS property name. */}
    <div
      style={{
        width: progress$.pipe(map((p) => `${p * 100}%`)),
        'background-color': constant('teal'),
      }}
    />
  </li>
);
