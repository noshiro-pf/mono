import { type DetailedFilterIcon } from '../../../types';
import { CustomIcon } from '../../atoms';
import { CheckboxView } from '../../bp';
import { IconCountNumericInput } from '../../molecules';
import {
  CheckboxWrapper,
  FilterItem,
  IconCountNumericInputWrapper,
  LessThanOrEqualTo,
  Plus,
} from './styled';

type Props = Readonly<{
  icon: DetailedFilterIcon;
  upperLimit: number;
  enabled: boolean;
  min: number;
  max: number;
  setEnabled: (value: boolean) => void;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}>;

export const DetailedFilterNumIcon = memoNamed<Props>(
  'DetailedFilterNumIcon',
  ({
    icon,
    upperLimit,
    enabled,
    max,
    min,
    setEnabled,
    onMinChange,
    onMaxChange,
  }) => (
    <FilterItem>
      <CheckboxWrapper>
        <CheckboxView
          state={enabled ? 'checked' : 'none'}
          onCheck={setEnabled}
        />
      </CheckboxWrapper>
      <IconCountNumericInputWrapper>
        <IconCountNumericInput
          count={min}
          disabled={!enabled}
          max={upperLimit}
          onCountChange={onMinChange}
        />
      </IconCountNumericInputWrapper>
      <LessThanOrEqualTo />

      {match(icon, {
        good: <CustomIcon iconName={'good'} />,
        fair: <CustomIcon iconName={'fair'} />,
        poor: <CustomIcon iconName={'poor'} />,
        fairPlusPoor: (
          <>
            <CustomIcon iconName={'fair'} />
            <Plus />
            <CustomIcon iconName={'poor'} />
          </>
        ),
        goodPlusFair: (
          <>
            <CustomIcon iconName={'good'} />
            <Plus />
            <CustomIcon iconName={'fair'} />
          </>
        ),
      })}
      <LessThanOrEqualTo />
      <IconCountNumericInputWrapper>
        <IconCountNumericInput
          count={max}
          disabled={!enabled}
          max={upperLimit}
          onCountChange={onMaxChange}
        />
      </IconCountNumericInputWrapper>
    </FilterItem>
  )
);
