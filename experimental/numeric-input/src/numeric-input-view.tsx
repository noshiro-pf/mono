import * as React from 'react';

type Props = Readonly<{
  value: string;
  onValueChange: (next: string) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onBlur?: () => void;
}>;

export const NumericInputView = React.memo<Props>((props) => {
  const { onValueChange, value, min, max, step, disabled, onBlur } = props;

  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(ev.target.value);
    },
    [onValueChange],
  );

  return (
    <input
      type='number'
      className='numeric-input'
      disabled={disabled}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
});
