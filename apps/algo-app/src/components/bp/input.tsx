import { constant, type Bindable, type JSX } from 'synstate-dom';
import * as styles from './input.module.css';

type Props = Readonly<{
  label: string;
  value: Bindable<string>;
  disabled: Bindable<boolean>;
  placeholder?: string;
  onValueChange: (value: string) => void;
}>;

/** A Blueprint-looking text input; the look is `input.module.css`. */
export const Input = ({
  label,
  value,
  disabled,
  placeholder,
  onValueChange,
}: Props): JSX.Element => (
  <input
    aria-label={constant(label)}
    class={constant(styles.input)}
    disabled={disabled}
    placeholder={placeholder === undefined ? undefined : constant(placeholder)}
    type={constant('text')}
    value={value}
    onInput={(ev) => {
      onValueChange(ev.currentTarget.value);
    }}
  />
);
