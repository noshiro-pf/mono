import { Label, NumericInput } from '@blueprintjs/core';

type Props = Readonly<{
  label: string;
  value?: number;
  disabled?: boolean;
  onValueChange?: (valueAsNumber: number) => void;
  min?: number;
  max?: number;
  cyId?: string;
}>;

export const BpNumericInputWithLabel = memoNamed<Props>(
  'BpNumericInputWithLabel',
  ({ label, value, disabled, onValueChange, min, max, cyId }) => (
    <Label>
      {label}
      <NumericInput
        allowNumericCharactersOnly={true}
        data-cy={cyId}
        disabled={disabled}
        max={max}
        min={min}
        value={value}
        onValueChange={onValueChange}
      />
    </Label>
  ),
);
