import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { classObject, intentToggles } from '../internal/index.mjs';
import type { Intent } from './intent.mjs';

type Props = Readonly<{
  /** The control, or controls, the group labels. */
  children: Child;
  /**
   * The text above the content, in `label.bp6-label`; none while it is empty or
   * left out, as Blueprint draws none for `label: ''`.
   */
  label?: Bindable<string>;
  /** The `id` of the control the label names. */
  labelFor?: string;
  /** Muted text after the label, such as `(required)`. */
  labelInfo?: Child;
  /** Below the content; nothing while it is `undefined` or empty. */
  helperText?: Bindable<string | undefined>;
  /** Colours the label and the helper text; it may change after mount. */
  intent?: Bindable<Intent> | Intent;
  /** The label beside the content rather than above it (`bp6-inline`). */
  inline?: boolean;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  disabled?: Bindable<boolean>;
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `FormGroup`: `div.bp6-form-group` round a label, the content in
 * `div.bp6-form-content`, and the helper text below it.
 */
export const FormGroup = ({
  children,
  label,
  labelFor,
  labelInfo,
  helperText,
  intent = 'none',
  inline = false,
  fill = false,
  disabled,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <div
    class={classObject(
      ['bp6-form-group', fill && 'bp6-fill', inline && 'bp6-inline', className],
      Arr.toPushed(intentToggles(intent), ['bp6-disabled', disabled]),
    )}
    data-e2e={e2e}
  >
    {label === undefined ? (
      []
    ) : (
      <If
        cond={mapBindable(label, (l) => l !== '')}
        then={
          <label
            class={constant('bp6-label')}
            htmlFor={labelFor === undefined ? undefined : constant(labelFor)}
          >
            {label}
            {constant(' ')}
            <span class={constant('bp6-text-muted')}>{labelInfo ?? []}</span>
          </label>
        }
      />
    )}
    <div class={constant('bp6-form-content')}>
      {children}
      {helperText === undefined ? (
        []
      ) : (
        <If
          cond={mapBindable(helperText, (t) => t !== undefined && t !== '')}
          then={
            <div class={constant('bp6-form-helper-text')}>
              {mapBindable(helperText, (t) => t ?? '')}
            </div>
          }
        />
      )}
    </div>
  </div>
);
