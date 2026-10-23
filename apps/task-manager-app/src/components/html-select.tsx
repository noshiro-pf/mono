import {
  constant,
  toObservable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { createAfterUpdate, subscribeInScope } from './scope-effects.mjs';

type Props = Readonly<{
  value: Bindable<string>;
  onChange: (changed: Readonly<{ currentTarget: HTMLSelectElement }>) => void;
  /** The `<option>`s. */
  children: Child;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  'data-e2e'?: Bindable<string>;
  'aria-describedby'?: Bindable<string | undefined>;
  'aria-invalid'?: Bindable<string>;
}>;

/**
 * A native `<select>` in the markup of Blueprint's `HTMLSelect`: the wrapper
 * with its modifier classes, the select, and the double caret that says it
 * opens. Written out, since only Blueprint's style sheet is used.
 *
 * The wrapper is a `<span>` where Blueprint has a `<div>`, so that it may sit
 * inside a `<label>`; the styles hang off the classes alone. The icon has no
 * `role="img"` on its `<svg>`, which Blueprint gives it: the icon is hidden
 * from assistive technology either way. `index.css` centres the caret and
 * keeps the text clear of it.
 *
 * The value is written again once each update has finished, when the
 * options it may have brought are in place: an option and the value that
 * picks it can change together, and the value is bound before the option
 * is there.
 */
export const HtmlSelect = ({
  value,
  onChange,
  children,
  fill = false,
  'data-e2e': e2e,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: Props): JSX.Element => (
  <span class={constant(fill ? 'bp6-html-select bp6-fill' : 'bp6-html-select')}>
    <select
      ref={(mut_select) => {
        const value$ = toObservable(value);

        if (value$.isCompleted) {
          return;
        }

        const afterUpdate = createAfterUpdate();

        subscribeInScope(value$, () => {
          afterUpdate(() => {
            mut_select.value = value$.getSnapshot().value;
          });
        });
      }}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      data-e2e={e2e}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
    <span
      aria-hidden={constant('true')}
      class={constant('bp6-icon bp6-icon-double-caret-vertical')}
    >
      <svg
        data-icon={constant('double-caret-vertical')}
        height={constant(16)}
        viewBox={constant('0 0 16 16')}
        width={constant(16)}
      >
        <path
          d={constant(DOUBLE_CARET_VERTICAL_16)}
          fill-rule={constant('evenodd')}
        />
      </svg>
    </span>
  </span>
);

/**
 * The 16px path of Blueprint's `double-caret-vertical` icon, as
 * `@blueprintjs/icons` (6.14) has it in
 * `lib/esm/generated/16px/paths/double-caret-vertical.js`. Copied: the
 * package is not a dependency of this app, and its paths are reachable only
 * through internal module paths.
 */
const DOUBLE_CARET_VERTICAL_16 =
  'M5 7h6a1.003 1.003 0 0 0 .71-1.71l-3-3C8.53 2.11 8.28 2 8 2s-.53.11-.71.29l-3 3A1.003 1.003 0 0 0 5 7m6 2H5a1.003 1.003 0 0 0-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0 0 11 9';
