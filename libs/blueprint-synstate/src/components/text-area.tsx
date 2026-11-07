import { onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { classObject, intentToggles, sizeClass } from '../internal/index.mjs';
import type { Intent, Size } from './intent.mjs';

type Props = Readonly<{
  value: Bindable<string>;
  /** Called when the value is committed: on blur. */
  onChange?: (
    changed: Readonly<{ currentTarget: HTMLTextAreaElement }>,
  ) => void;
  /** Called on every keystroke. */
  onInput?: (changed: Readonly<{ currentTarget: HTMLTextAreaElement }>) => void;
  /**
   * Grows and shrinks to fit its text, as it is typed and as `value` changes
   * (`bp6-text-area-auto-resize`). Not when only its width changes, as
   * Blueprint's does not.
   */
  autoResize?: boolean;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** It may change after mount. */
  intent?: Bindable<Intent> | Intent;
  size?: Size;
  placeholder?: Bindable<string>;
  disabled?: Bindable<boolean>;
  readOnly?: Bindable<boolean>;
  rows?: number;
  /** The `maxlength` attribute: the most characters that can be typed. */
  maxLength?: number;
  /** Classes after Blueprint's own. */
  class?: string;
  id?: string;
  'aria-label'?: Bindable<string>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `TextArea`: `textarea.bp6-input.bp6-text-area`.
 *
 * With `autoResize`, its height is set to that of its text, as Blueprint sets
 * it: once it is in the document, after every keystroke and after every change
 * of `value`.
 */
export const TextArea = ({
  value,
  onChange,
  onInput,
  autoResize = false,
  fill = false,
  intent = 'none',
  size = 'medium',
  placeholder,
  disabled,
  readOnly,
  rows,
  maxLength,
  class: className,
  id,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <textarea
    ref={(textarea) => {
      if (autoResize) {
        fitToText(textarea, value);
      }
    }}
    aria-label={ariaLabel}
    class={classObject(
      [
        'bp6-input',
        'bp6-text-area',
        sizeClass(size),
        fill && 'bp6-fill',
        autoResize && 'bp6-text-area-auto-resize',
        className,
      ],
      intentToggles(intent),
    )}
    data-e2e={e2e}
    disabled={disabled}
    id={id === undefined ? undefined : constant(id)}
    placeholder={placeholder}
    readOnly={readOnly}
    maxLength={maxLength === undefined ? undefined : constant(maxLength)}
    rows={rows === undefined ? undefined : constant(rows)}
    value={value}
    onChange={onChange}
    onInput={(event) => {
      if (autoResize) {
        fit(event.currentTarget);
      }

      onInput?.(event);
    }}
  />
);

/**
 * Sets the height to that of the text: from 0px, as Blueprint does, so that
 * `scrollHeight` is the least height that fits it rather than the current one.
 */
const fit = (textarea: HTMLTextAreaElement): void => {
  textarea.style.setProperty('height', '0px');

  textarea.style.setProperty('height', `${textarea.scrollHeight.toString()}px`);
};

/**
 * Keeps the height of `textarea` that of its text: once it is in the document,
 * and after `value` is written to it, as Blueprint's does on mount and on a new
 * `value`.
 */
const fitToText = (
  textarea: HTMLTextAreaElement,
  value: Bindable<string>,
): void => {
  // In the frame it is mounted in, before that frame is drawn: by then it is in
  // the document, and its text has a height to measure.
  const frame = requestAnimationFrame(() => {
    fit(textarea);
  });

  onScopeDispose(() => {
    cancelAnimationFrame(frame);
  });

  const value$ = toObservable(value);

  if (value$.isCompleted) {
    return;
  }

  // After the value binding has written the new text. Not for the text it is
  // mounted with, which the frame above fits.
  const afterUpdate = createAfterUpdate();

  const mut_state = { mounted: false };

  value$.subscribe(() => {
    if (!mut_state.mounted) {
      mut_state.mounted = true;

      return;
    }

    afterUpdate(() => {
      fit(textarea);
    });
  });
};
