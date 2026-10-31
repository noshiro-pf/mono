import { constant, mapBindable, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { loanStore } from '../../store/index.mjs';
import {
  PercentFloatNumericInput,
  YearNumericInput,
  YenNumericInput,
} from '../numeric-input/index.mjs';
import * as styles from './config-section.module.css';
import { RepaymentTypeRadioGroup } from './repayment-type-radio-group.js';

export const ConfigSection = (): JSX.Element => (
  <>
    <div class={constant(styles.title)}>{constant(dict.settings)}</div>
    <div class={constant(styles.element)}>
      <label class={constant(styles.field)}>
        {constant(dict.borrowingTotalManYen)}
        <YenNumericInput
          data-e2e={'numericInput-borrowingTotalManYen'}
          min={0}
          value={mapBindable(loanStore.inputs, (s) => s.borrowingTotalManYen)}
          onValueChange={loanStore.setBorrowingTotalManYen}
        />
      </label>
    </div>
    <div class={constant(styles.element)}>
      <label class={constant(styles.field)}>
        {constant(dict.borrowingPeriodYear)}
        <YearNumericInput
          data-e2e={'numericInput-borrowingPeriodYear'}
          value={mapBindable(loanStore.inputs, (s) => s.borrowingPeriodYear)}
          onValueChange={loanStore.setBorrowingPeriodYear}
        />
      </label>
    </div>
    <div class={constant(styles.element)}>
      <label class={constant(styles.field)}>
        {constant(dict.interestRatePerYear)}
        <PercentFloatNumericInput
          data-e2e={'numericInput-interestRatePerYear'}
          value={mapBindable(
            loanStore.inputs,
            (s) => s.interestRatePercentPerYear,
          )}
          onValueChange={loanStore.setInterestRatePercentPerYear}
        />
      </label>
    </div>
    <div
      class={constant(styles.element)}
      data-e2e={constant('repaymentTypeRadioGroup')}
    >
      <RepaymentTypeRadioGroup
        value={mapBindable(loanStore.inputs, (s) => s.repaymentType)}
        onValueChange={loanStore.setRepaymentType}
      />
    </div>
  </>
);
