import { constant, type Bindable, type JSX } from 'synstate-dom';
import { classObject, sizeClass } from '../internal/index.mjs';
import type { Size } from './intent.mjs';

type Props = Readonly<{
  /** Called when files are chosen. */
  onInputChange: (
    changed: Readonly<{ currentTarget: HTMLInputElement }>,
  ) => void;
  /** The text in the box: what is chosen, or a prompt. */
  text?: Bindable<string>;
  /** The text of the button at the end of the box. */
  buttonText?: string;
  /** Draws `text` as chosen rather than as a prompt. */
  hasSelection?: Bindable<boolean>;
  /** The file types, as `<input accept>` takes them. */
  accept?: string;
  disabled?: Bindable<boolean>;
  size?: Size;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Classes after Blueprint's own on the `<label>`. */
  class?: string;
  /** On the `<input>`. */
  'aria-label'?: Bindable<string>;
  /** On the `<input>`. */
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `FileInput`: the native file input, hidden, under a box with
 * a button, all in a `<label>` so that clicking anywhere opens the chooser.
 *
 * The box's text is not changed when a file is chosen; that is the
 * caller's, through `text` and `hasSelection`, as it is with Blueprint.
 */
export const FileInput = ({
  onInputChange,
  text = constant('Choose file...'),
  buttonText,
  hasSelection,
  accept,
  disabled,
  size = 'medium',
  fill = false,
  class: className,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <label
    class={classObject(
      ['bp6-file-input', sizeClass(size), fill && 'bp6-fill', className],
      [
        ['bp6-disabled', disabled],
        ['bp6-file-input-has-selection', hasSelection],
      ],
    )}
  >
    <input
      accept={accept === undefined ? undefined : constant(accept)}
      aria-label={ariaLabel}
      data-e2e={e2e}
      disabled={disabled}
      type={constant('file')}
      onChange={onInputChange}
    />
    <span
      ref={(mut_span) => {
        // An attribute of Blueprint's own, which its style sheet reads with
        // `attr()`; not one synstate-dom's props can name.
        if (buttonText !== undefined) {
          mut_span.setAttribute('bp6-button-text', buttonText);
        }
      }}
      class={constant(
        buttonText === undefined
          ? 'bp6-file-upload-input'
          : 'bp6-file-upload-input bp6-file-upload-input-custom-text',
      )}
    >
      {text}
    </span>
  </label>
);
