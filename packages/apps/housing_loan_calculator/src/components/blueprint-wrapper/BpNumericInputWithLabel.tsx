import { Label, NumericInput } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';

interface Props {
  label: string;
  value?: number;
  disabled?: boolean;
  onValueChange?: (valueAsNumber: number) => void;
  min?: number;
  max?: number;
}

export const BpNumericInputWithLabel = memoNamed<Props>(
  'BpNumericInputWithLabel',
  ({ label, value, disabled, onValueChange, min, max }) => (
    <Label>
      {label}
      <NumericInput
        allowNumericCharactersOnly={true}
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
        min={min}
        max={max}
      />
    </Label>
  )
);
