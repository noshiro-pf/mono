import { Slider } from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

export const MuiSlider = memoNamed<
  Readonly<{
    value: number;
    onChange: (v: number) => void;
    ariaLabelledby: string;
    step: number;
    min: number;
    max: number;
  }>
>('MuiSlider', ({ value, onChange, ariaLabelledby, step, min, max }) => {
  const sliderOnChange = useCallback(
    (_: unknown, _value: number | readonly number[]) => {
      onChange(_value as number);
    },
    [onChange]
  );

  return (
    <Slider
      aria-labelledby={ariaLabelledby}
      marks={true}
      max={max}
      min={min}
      step={step}
      value={value}
      valueLabelDisplay='auto'
      onChange={sliderOnChange}
    />
  );
});
