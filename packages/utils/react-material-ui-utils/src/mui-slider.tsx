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
    (_: unknown, _value: number | number[]) => {
      onChange(_value as number);
    },
    [onChange]
  );

  return (
    <Slider
      value={value}
      onChange={sliderOnChange}
      aria-labelledby={ariaLabelledby}
      valueLabelDisplay='auto'
      marks={true}
      step={step}
      min={min}
      max={max}
    />
  );
});
