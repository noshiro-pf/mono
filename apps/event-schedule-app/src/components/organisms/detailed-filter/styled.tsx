import { Icon, type IconName } from 'blueprint-synstate';
import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './styled.module.css';

type Props = Readonly<{ children: Child; 'data-e2e'?: string }>;

const wrapper =
  (className: string) =>
  ({ children, 'data-e2e': e2e }: Props): JSX.Element => (
    <div
      class={constant(className)}
      data-e2e={e2e === undefined ? undefined : constant(e2e)}
    >
      {children}
    </div>
  );

export const FilterItem = wrapper(styles.filterItem);

/** A `<label>`, so that its text toggles the checkbox in it. */
export const CheckboxWrapper = ({
  children,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <label
    class={constant(styles.checkboxWrapper)}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
  >
    {children}
  </label>
);

export const IconCountNumericInputWrapper = wrapper(
  styles.iconCountNumericInputWrapper,
);

export const FilterItemContent = wrapper(styles.filterItemContent);

export const RangeSliderWrapper = wrapper(styles.rangeSliderWrapper);

export const CheckboxWithRightLabel = wrapper(styles.checkboxWithRightLabel);

export const CheckboxWithBottomLabel = wrapper(styles.checkboxWithBottomLabel);

export const HorizontalCheckboxesWrapper = wrapper(
  styles.horizontalCheckboxesWrapper,
);

export const VerticalCheckboxesWrapper = wrapper(
  styles.verticalCheckboxesWrapper,
);

const operator = (icon: IconName) => (): JSX.Element => (
  <div class={constant(styles.operator)}>
    <Icon icon={icon} size={12} />
  </div>
);

export const LessThanOrEqualTo = operator('less-than-or-equal-to');

export const GreaterThanOrEqualTo = operator('greater-than-or-equal-to');

export const Plus = operator('plus');
