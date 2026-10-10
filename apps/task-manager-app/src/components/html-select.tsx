import type { ComponentChildren, GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';

type Props = Readonly<{
  value: string;
  onChange: GenericEventHandler<HTMLSelectElement>;
  /** The `<option>`s. */
  children: ComponentChildren;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  'data-e2e'?: string;
  'aria-describedby'?: string | undefined;
  'aria-invalid'?: boolean;
}>;

/**
 * A native `<select>` in the markup of Blueprint's `HTMLSelect`: the wrapper
 * with its modifier classes, the select, and the double caret that says it
 * opens. Written out rather than imported, because importing the component
 * would bring `preact/compat` and Blueprint's scripts into the first load
 * for an icon; only the date picker is worth that, and it is lazy.
 *
 * The wrapper is a `<span>` where Blueprint has a `<div>`, so that it may sit
 * inside a `<label>`; the styles hang off the classes alone. The icon has no
 * `role="img"` on its `<svg>`, which Blueprint gives it: the icon is hidden
 * from assistive technology either way. `index.css` centres the caret and
 * keeps the text clear of it.
 */
export const HtmlSelect = memoNamed<Props>('HtmlSelect', (props) => {
  const {
    value,
    onChange,
    children,
    fill = false,
    'data-e2e': e2e,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
  } = props;

  return (
    <span className={fill ? 'bp6-html-select bp6-fill' : 'bp6-html-select'}>
      <select
        aria-describedby={describedBy}
        aria-invalid={invalid}
        data-e2e={e2e}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <span aria-hidden className={'bp6-icon bp6-icon-double-caret-vertical'}>
        <svg
          data-icon={'double-caret-vertical'}
          height={16}
          viewBox={'0 0 16 16'}
          width={16}
        >
          <path d={DOUBLE_CARET_VERTICAL_16} fillRule={'evenodd'} />
        </svg>
      </span>
    </span>
  );
});

/**
 * The 16px path of Blueprint's `double-caret-vertical` icon, as
 * `@blueprintjs/icons` (6.14) has it in
 * `lib/esm/generated/16px/paths/double-caret-vertical.js`. Copied: the
 * package is not a dependency of this app, and its paths are reachable only
 * through internal module paths.
 */
const DOUBLE_CARET_VERTICAL_16 =
  'M5 7h6a1.003 1.003 0 0 0 .71-1.71l-3-3C8.53 2.11 8.28 2 8 2s-.53.11-.71.29l-3 3A1.003 1.003 0 0 0 5 7m6 2H5a1.003 1.003 0 0 0-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0 0 11 9';
