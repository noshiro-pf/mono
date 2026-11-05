import { onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { classObject, intentToggles, sizeClass } from '../internal/index.mjs';
import { Icon, type IconName } from './icon.js';
import type { Intent, Size } from './intent.mjs';

type Props = Readonly<{
  value: Bindable<string>;
  /** Called when the value is committed: on blur, or on Enter. */
  onChange?: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
  /** Called on every keystroke. */
  onInput?: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
  /** Called when the input loses focus, changed or not. */
  onBlur?: (event: FocusEvent) => void;
  /** The `autocomplete` hint, such as `current-password`. */
  autoComplete?: AutoFill;
  /**
   * Focused once drawn, as React's `autoFocus`, and marked with the `autofocus`
   * attribute that an overlay looks for as it opens.
   */
  autoFocus?: boolean;
  /** One that changes, as a password shown and hidden, is written as it does. */
  type?: Bindable<InputType> | InputType;
  /** For `type="number"`: the step, or `any`. */
  step?: string;
  placeholder?: Bindable<string>;
  disabled?: Bindable<boolean>;
  readOnly?: Bindable<boolean>;
  /** One that changes is drawn as it does. */
  intent?: Bindable<Intent> | Intent;
  size?: Size;
  /** Drawn inside the input, before the text. */
  leftIcon?: IconName;
  /**
   * Drawn inside the input, after the text, in `span.bp6-input-action`: a
   * button that clears it, say. The input is padded on the right by its width.
   */
  rightElement?: Child;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Classes after Blueprint's own on the wrapper. */
  class?: string;
  id?: string;
  /** Called with the `<input>`, as Blueprint's `inputRef` is. */
  inputRef?: (input: HTMLInputElement) => void;
  'aria-label'?: Bindable<string>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `InputGroup`: `input.bp6-input` in `div.bp6-input-group`, which
 * carries the modifier classes, with an optional icon before the text and an
 * optional element after it.
 *
 * Unlike React's `onChange`, synstate-dom's is the DOM's `change`, which fires
 * when the value is committed; `onInput` is the one for every keystroke.
 */
export const InputGroup = ({
  value,
  onChange,
  onInput,
  onBlur,
  autoComplete,
  autoFocus = false,
  type = 'text',
  step,
  placeholder,
  disabled,
  readOnly,
  intent = 'none',
  size = 'medium',
  leftIcon,
  rightElement,
  fill = false,
  class: className,
  id,
  inputRef,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const mut_parts: { input: HTMLInputElement | undefined } = {
    input: undefined,
  };

  if (autoFocus) {
    // As React's `autoFocus`, which Blueprint's passes on: once drawn, at any
    // time. The attribute alone is honoured once per page, by the first.
    createAfterUpdate()(() => {
      if (mut_parts.input?.isConnected === true) {
        mut_parts.input.focus();
      }
    });
  }

  return (
    <div
      class={classObject(
        ['bp6-input-group', sizeClass(size), fill && 'bp6-fill', className],
        [
          ...intentToggles(intent),
          ['bp6-disabled', disabled],
          ['bp6-read-only', readOnly],
        ],
      )}
    >
      {leftIcon === undefined ? [] : <Icon icon={leftIcon} />}
      <input
        ref={(input) => {
          mut_parts.input = input;

          inputRef?.(input);
        }}
        aria-label={ariaLabel}
        autocomplete={
          autoComplete === undefined ? undefined : constant(autoComplete)
        }
        autofocus={autoFocus ? constant(true) : undefined}
        class={constant('bp6-input')}
        data-e2e={e2e}
        disabled={disabled}
        id={id === undefined ? undefined : constant(id)}
        placeholder={placeholder}
        readOnly={readOnly}
        step={step === undefined ? undefined : constant(step)}
        type={typeof type === 'string' ? constant(type) : type}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        onInput={onInput}
      />
      {rightElement === undefined ? (
        []
      ) : (
        <span
          ref={(action) => {
            padForAction(action, () => mut_parts.input);
          }}
          class={constant('bp6-input-action')}
        >
          {rightElement}
        </span>
      )}
    </div>
  );
};

type InputType =
  'email' | 'month' | 'number' | 'password' | 'search' | 'text' | 'url';

/**
 * Pads the input on the right by the width of `action`, as Blueprint does, so
 * that the text does not run under it: once it is laid out, and whenever its
 * width changes.
 */
const padForAction = (
  action: HTMLElement,
  input: () => HTMLInputElement | undefined,
): void => {
  const observer = new ResizeObserver(() => {
    input()?.style.setProperty(
      'padding-right',
      `${action.clientWidth.toString()}px`,
    );
  });

  observer.observe(action);

  onScopeDispose(() => {
    observer.disconnect();
  });
};
