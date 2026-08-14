import { CheckboxView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { type SafeUint } from 'ts-type-forge';
import { type DetailedFilterIcon } from '../../../types/index.mjs';
import { match } from '../../../utils-ported/index.mjs';
import { CustomIcon } from '../../atoms/index.mjs';
import { IconCountNumericInput } from '../../molecules/index.mjs';
import {
  CheckboxWrapper,
  FilterItem,
  IconCountNumericInputWrapper,
  LessThanOrEqualTo,
  Plus,
} from './styled.js';

type Props = Readonly<{
  icon: DetailedFilterIcon;
  upperLimit: SafeUint;
  enabled: boolean;
  min: SafeUint;
  max: SafeUint;
  setEnabled: (value: boolean) => void;
  onMinChange: (value: SafeUint) => void;
  onMaxChange: (value: SafeUint) => void;
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
  ),
);
