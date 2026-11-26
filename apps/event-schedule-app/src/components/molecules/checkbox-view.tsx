import {
  constant,
  mapBindable,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import * as styles from './checkbox-view.module.css';

export type CheckboxViewState = 'checked' | 'indeterminate' | 'none';

type Props = Readonly<{
  state: Bindable<CheckboxViewState>;
  disabled?: Bindable<boolean>;
  onCheck: (checked: boolean) => void;
  'data-e2e'?: Bindable<string>;
}>;

/**
 * A bare checkbox, drawn by its own square, that can be indeterminate.
 *
 * Put it in a `label`, whose text names it and takes a click on the square:
 * the input under the square takes none itself.
 */
export const CheckboxView = ({
  state,
  disabled,
  onCheck,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <span class={constant(styles.root)}>
    <input
      ref={(mut_input) => {
        toObservable(state).subscribe((s) => {
          mut_input.indeterminate = s === 'indeterminate';
        });
      }}
      checked={mapBindable(state, (s) => s === 'checked')}
      data-e2e={e2e}
      disabled={disabled}
      type={constant('checkbox')}
      onChange={({ currentTarget }) => {
        onCheck(currentTarget.checked);
      }}
    />
    <span />
  </span>
);
