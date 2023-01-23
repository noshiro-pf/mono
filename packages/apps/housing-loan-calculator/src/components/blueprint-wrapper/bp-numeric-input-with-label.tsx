import { Label, NumericInput } from '@blueprintjs/core';

type Props = Readonly<{
  label: string;
  value?: number;
  disabled?: boolean;
  onValueChange?: (valueAsNumber: number) => void;
  min?: number;
  max?: number;
}>;

export const BpNumericInputWithLabel = memoNamed<Props>(
  'BpNumericInputWithLabel',
  ({ label, value, disabled, onValueChange, min, max }) => (
    <Label>
      {label}
      <NumericInput
        allowNumericCharactersOnly={true}
        disabled={disabled}
        max={max}
        min={min}
        value={value}
        onValueChange={onValueChange}
      />
    </Label>
  )
);
