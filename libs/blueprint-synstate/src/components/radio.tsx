import {
  constant,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { classObject, uniqueId } from '../internal/index.mjs';

/** One choice of a {@link RadioGroup}. */
export type RadioGroupOption<T extends string> = Readonly<{
  value: T;
  /** The text after the circle; `value` when omitted. */
  label?: Child;
  disabled?: boolean;
  /** On the `<input>`. */
  'data-e2e'?: string;
}>;

type RadioProps = Readonly<{
  /** The text after the circle, inside the `<label>`. */
  label: Child;
  value: string;
  checked: Bindable<boolean>;
  onChange: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
  /** The group the browser keeps to one choice. */
  name?: string;
  disabled?: Bindable<boolean>;
  /** Sits in a line with what is next to it (`bp6-inline`). */
  inline?: boolean;
  /** Classes after Blueprint's own on the `<label>`. */
  class?: string;
  /** On the `<input>`. */
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `Radio`: the native radio button, hidden, and the circle
 * Blueprint draws in its place, in a `<label>` with the text.
 */
export const Radio = ({
  label,
  value,
  checked,
  onChange,
  name,
  disabled,
  inline = false,
  class: className,
  'data-e2e': e2e,
}: RadioProps): JSX.Element => (
  <label
    class={classObject(
      ['bp6-control', 'bp6-radio', inline && 'bp6-inline', className],
      [['bp6-disabled', disabled]],
    )}
  >
    <input
      checked={checked}
      class={constant('bp6-control-input')}
      data-e2e={e2e}
      disabled={disabled}
      name={name === undefined ? undefined : constant(name)}
      type={constant('radio')}
      value={constant(value)}
      onChange={onChange}
    />
    <span class={constant('bp6-control-indicator')} />
    {label}
  </label>
);

type RadioGroupProps<T extends string> = Readonly<{
  options: readonly RadioGroupOption<T>[];
  value: Bindable<T>;
  onValueChange: (value: T) => void;
  /** The text above the choices, in `label.bp6-label`. */
  label?: Child;
  /** The `name` of the radio buttons; one unique on the page by default. */
  name?: string;
  disabled?: Bindable<boolean>;
  /** Puts the choices in a line (`bp6-inline` on each). */
  inline?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `RadioGroup`: one {@link Radio} per option in
 * `div.bp6-radio-group`, a `radiogroup` named by its label. The browser keeps
 * the buttons to one choice and moves between them with the arrow keys.
 */
export const RadioGroup = <T extends string>({
  options,
  value,
  onValueChange,
  label,
  name = uniqueId('bp6-radio-group'),
  disabled,
  inline = false,
  class: className,
  'data-e2e': e2e,
}: RadioGroupProps<T>): JSX.Element => {
  const labelId =
    label === undefined ? undefined : uniqueId('bp6-radio-group-label');

  return (
    <div
      aria-labelledby={labelId === undefined ? undefined : constant(labelId)}
      class={classObject(['bp6-radio-group', className])}
      data-e2e={e2e}
      role={constant('radiogroup')}
    >
      {labelId === undefined ? (
        []
      ) : (
        <label class={constant('bp6-label')} id={constant(labelId)}>
          {label}
        </label>
      )}
      {options.map((option) => (
        <Radio
          checked={mapBindable(value, (v) => v === option.value)}
          data-e2e={
            option['data-e2e'] === undefined
              ? undefined
              : constant(option['data-e2e'])
          }
          disabled={option.disabled === true ? constant(true) : disabled}
          inline={inline}
          label={option.label ?? constant<string>(option.value)}
          name={name}
          value={option.value}
          onChange={() => {
            onValueChange(option.value);
          }}
        />
      ))}
    </div>
  );
};
