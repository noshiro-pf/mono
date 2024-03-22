import * as React from 'react';

type Props = Readonly<{
  value: string;
  disabled: boolean;
  min: number;
  max: number;
  step: number;
  onChange: (value: string) => void;
  onBlur: () => void;
}>;

export const NumericInputView = React.memo<Props>((props) => {
  const { value, disabled, max, min, step, onChange, onBlur } = props;

  const handleChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onChange(ev.target.value);
    },
    [onChange],
  );

  return (
    <input
      disabled={disabled}
      max={max}
      min={min}
      step={step}
      type='number'
      value={value}
      onBlur={onBlur}
      onChange={handleChange}
    />
  );
});
