import type { JSX } from 'synstate-dom';
import type { ReadonlyRecord, SafeUint } from 'ts-type-forge';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import type { DetailedFilterIcon } from '../../../types/index.mjs';
import { CustomIcon } from '../../atoms/index.mjs';
import { CheckboxView, IconCountNumericInput } from '../../molecules/index.mjs';
import { filterView } from './filter-state.mjs';
import {
  CheckboxWrapper,
  FilterItem,
  IconCountNumericInputWrapper,
  LessThanOrEqualTo,
  Plus,
} from './styled.js';

type Props = Readonly<{ icon: DetailedFilterIcon }>;

/* 記号の数で絞り込み */
export const DetailedFilterNumIcon = ({ icon }: Props): JSX.Element => {
  const { setEnabled, onMinChange, onMaxChange } = handlers[icon];

  const disabled = filterView((s) => !s.iconState[icon].enabled);

  const upperLimit = filterView((s) => s.iconState.upperLimit);

  return (
    <FilterItem>
      <CheckboxWrapper>
        <CheckboxView
          state={filterView((s) =>
            s.iconState[icon].enabled ? 'checked' : 'none',
          )}
          onCheck={setEnabled}
        />
      </CheckboxWrapper>
      <IconCountNumericInputWrapper>
        <IconCountNumericInput
          count={filterView((s) => s.iconState[icon].min)}
          disabled={disabled}
          max={upperLimit}
          onCountChange={onMinChange}
        />
      </IconCountNumericInputWrapper>
      <LessThanOrEqualTo />
      {icons(icon)}
      <LessThanOrEqualTo />
      <IconCountNumericInputWrapper>
        <IconCountNumericInput
          count={filterView((s) => s.iconState[icon].max)}
          disabled={disabled}
          max={upperLimit}
          onCountChange={onMaxChange}
        />
      </IconCountNumericInputWrapper>
    </FilterItem>
  );
};

const icons = (icon: DetailedFilterIcon): JSX.Element => {
  switch (icon) {
    case 'good':
    case 'fair':
    case 'poor':
      return <CustomIcon iconName={icon} />;

    case 'fairPlusPoor':
      return (
        <>
          <CustomIcon iconName={'fair'} />
          <Plus />
          <CustomIcon iconName={'poor'} />
        </>
      );

    case 'goodPlusFair':
      return (
        <>
          <CustomIcon iconName={'good'} />
          <Plus />
          <CustomIcon iconName={'fair'} />
        </>
      );
  }
};

const handlers: ReadonlyRecord<
  DetailedFilterIcon,
  Readonly<{
    setEnabled: (value: boolean) => void;
    onMinChange: (value: SafeUint) => void;
    onMaxChange: (value: SafeUint) => void;
  }>
> = {
  good: {
    setEnabled: AnswerFilterAndSortStore.setEnabledFilteringByGoodIcon,
    onMinChange: AnswerFilterAndSortStore.setMinCountOfGoodIcon,
    onMaxChange: AnswerFilterAndSortStore.setMaxCountOfGoodIcon,
  },
  fair: {
    setEnabled: AnswerFilterAndSortStore.setEnabledFilteringByFairIcon,
    onMinChange: AnswerFilterAndSortStore.setMinCountOfFairIcon,
    onMaxChange: AnswerFilterAndSortStore.setMaxCountOfFairIcon,
  },
  poor: {
    setEnabled: AnswerFilterAndSortStore.setEnabledFilteringByPoorIcon,
    onMinChange: AnswerFilterAndSortStore.setMinCountOfPoorIcon,
    onMaxChange: AnswerFilterAndSortStore.setMaxCountOfPoorIcon,
  },
  goodPlusFair: {
    setEnabled: AnswerFilterAndSortStore.setEnabledFilteringByGoodPlusFair,
    onMinChange: AnswerFilterAndSortStore.setGoodPlusFairMin,
    onMaxChange: AnswerFilterAndSortStore.setGoodPlusFairMax,
  },
  fairPlusPoor: {
    setEnabled: AnswerFilterAndSortStore.setEnabledFilteringByFairPlusPoor,
    onMinChange: AnswerFilterAndSortStore.setFairPlusPoorMin,
    onMaxChange: AnswerFilterAndSortStore.setFairPlusPoorMax,
  },
} as const;
