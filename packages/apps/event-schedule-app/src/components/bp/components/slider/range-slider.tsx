import { useNormalizedRangeSliderProps } from './normalize-range-slider-props-hook';
import { useOnRangeChangeHandlerHook } from './on-range-change-handler-hook';
import { RangeSliderView } from './range-slider-view';
import { useSliderHandleStateManager } from './slider-handle-hook';

type Props = DeepReadonly<{
  disabled?: boolean;
  min: number;
  max: number;
  range: { min: number; max: number };
  stepSize: number;
  labelStepSize?: number;
  labelFractionDigits?: UintRange<0, 21>;
  customLabelValues?: readonly number[];
  onChange?: (value: Readonly<{ min: number; max: number }>) => void;
  onRelease?: (value: Readonly<{ min: number; max: number }>) => void;
  onRangeMinChange?: (value: number) => void;
  onRangeMaxChange?: (value: number) => void;
  onRangeMinRelease?: (value: number) => void;
  onRangeMaxRelease?: (value: number) => void;
}>;

export const BpRangeSlider = memoNamed<Props>(
  'BpRangeSlider',
  ({
    disabled = false,
    min: _min,
    max: _max,
    range: _range,
    stepSize: _stepSize,
    labelStepSize: _labelStepSize,
    labelFractionDigits: _labelFractionDigits,
    customLabelValues,
    onChange,
    onRelease,
    onRangeMinChange,
    onRangeMaxChange,
    onRangeMinRelease,
    onRangeMaxRelease,
  }) => {
    const { max, min, range, stepSize, labelFractionDigits } =
      useNormalizedRangeSliderProps({
        max: _max,
        min: _min,
        range: _range,
        stepSize: _stepSize,
        labelStepSize: _labelStepSize,
        labelFractionDigits: _labelFractionDigits,
      });

    const handlers = useOnRangeChangeHandlerHook(range, onChange, onRelease);

    const trackElementRef = useRef<HTMLDivElement>(null);

    const leftHandle = useSliderHandleStateManager({
      trackElementRef,
      disabled,
      min,
      max,
      stepSize,
      value: range.min,
      labelFractionDigits,
      onChange: onRangeMinChange ?? handlers.onRangeMinChange,
      onRelease: onRangeMinRelease ?? handlers.onRangeMinRelease,
    });

    const rightHandle = useSliderHandleStateManager({
      trackElementRef,
      disabled,
      min,
      max,
      stepSize,
      value: range.max,
      labelFractionDigits,
      onChange: onRangeMaxChange ?? handlers.onRangeMaxChange,
      onRelease: onRangeMaxRelease ?? handlers.onRangeMaxRelease,
    });

    return (
      <RangeSliderView
        customLabelValues={customLabelValues}
        disabled={disabled}
        labelFractionDigits={labelFractionDigits}
        leftHandle={leftHandle}
        max={max}
        min={min}
        range={range}
        rightHandle={rightHandle}
        trackElementRef={trackElementRef}
      />
    );
  },
);
