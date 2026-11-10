import { Button, Switch } from 'blueprint-synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import type { SafeUint } from 'ts-type-forge';
import { dict } from '../../../../constants/index.mjs';
import type { NumIconFilterState } from '../../../../types/index.mjs';
import { IconCountNumericInput } from '../../../molecules/index.mjs';
import * as styles from '../answer-table.module.css';

const dc = dict.answerPage.answers.iconHeaderFilter;

type Props = Readonly<{
  state: Bindable<NumIconFilterState>;
  upperLimit: Bindable<SafeUint>;
  onMinChange: (value: SafeUint) => void;
  onMaxChange: (value: SafeUint) => void;
  enableFiltering: () => void;
  disableFiltering: () => void;
  onClose: () => void;
}>;

export const FilterByIconPopoverContent = ({
  state,
  upperLimit,
  onMinChange,
  onMaxChange,
  onClose,
  enableFiltering,
  disableFiltering,
}: Props): JSX.Element => {
  const disabled = mapBindable(state, (s) => !s.enabled);

  return (
    <div
      class={constant(styles.filterPopover)}
      data-e2e={constant('icon-filter-popover')}
    >
      <div class={constant(styles.filterRow)}>
        <div class={constant(styles.filterInput)}>
          <IconCountNumericInput
            count={mapBindable(state, (s) => s.min)}
            disabled={disabled}
            max={upperLimit}
            onCountChange={onMinChange}
          />
        </div>
        <div class={constant(styles.filterSuffix)}>{constant(dc.ge)}</div>
      </div>
      <div class={constant(styles.filterRow)}>
        <div class={constant(styles.filterInput)}>
          <IconCountNumericInput
            count={mapBindable(state, (s) => s.max)}
            disabled={disabled}
            max={upperLimit}
            onCountChange={onMaxChange}
          />
        </div>
        <div class={constant(styles.filterSuffix)}>{constant(dc.le)}</div>
      </div>

      <div class={constant(styles.filterFooter)}>
        <div class={constant(styles.filterSwitch)}>
          <Switch
            checked={mapBindable(state, (s) => s.enabled)}
            class={styles.switchWithoutMargin}
            label={constant(dc.enableFilteringSwitchLabel)}
            onChange={({ currentTarget }) => {
              if (currentTarget.checked) {
                enableFiltering();
              } else {
                disableFiltering();
              }
            }}
          />
        </div>
        <Button
          intent={'primary'}
          text={constant(dict.common.buttonText.close)}
          onClick={onClose}
        />
      </div>
    </div>
  );
};
