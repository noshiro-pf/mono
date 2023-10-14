import { toClassName } from '../../../../utils';
import { SliderHandle } from './handle';
import { SliderProgressStyled, SliderTrackStyled } from './progress-styled';
import { useRangeSliderInlineStyles } from './range-slider-inline-styles-hook';
import { useRangeSliderLabels } from './range-slider-labels-hook';
import { type SliderHandleElementAdaptor } from './slider-handle-hook';
import {
  SliderLabelMaxStyled,
  SliderLabelMinStyled,
  SliderLabelStyled,
} from './slider-label-styled';
import { useRangeSliderRatios } from './to-ratio-hook';

type Props = Readonly<{
  trackElementRef: React.RefObject<HTMLDivElement>;
  disabled: boolean;
  min: number;
  max: number;
  range: Readonly<{ min: number; max: number }>;
  labelFractionDigits: UintRange<0, 21>;
  customLabelValues?: readonly number[];
  leftHandle: SliderHandleElementAdaptor;
  rightHandle: SliderHandleElementAdaptor;
}>;

/**
 * TODO: バーをクリック or touch したときに最も近いつまみをその位置に移動する
 */
export const RangeSliderView = memoNamed<Props>(
  'RangeSliderView',
  ({
    trackElementRef,
    disabled,
    min,
    max,
    range,
    labelFractionDigits,
    customLabelValues,
    leftHandle,
    rightHandle,
  }) => {
    const { leftRatio, rightRatio, toRatio } = useRangeSliderRatios({
      min,
      max,
      range,
    });

    const { customLabelValuesWithRatio, minLabel, maxLabel } =
      useRangeSliderLabels({
        min,
        max,
        toRatio,
        labelFractionDigits,
        customLabelValues,
      });

    const {
      progressStartStyle,
      progressMidStyle,
      progressEndStyle,
      leftHandleStyle,
      rightHandleStyle,
    } = useRangeSliderInlineStyles(leftRatio, rightRatio);

    return (
      // eslint-disable-next-line react/forbid-component-props
      <Root className={toClassName({ disabled })}>
        <SliderTrackStyled ref={trackElementRef}>
          <SliderProgressStyled style={progressStartStyle} />
          <SliderProgressStyled
            // eslint-disable-next-line react/forbid-component-props
            className={'intent-primary'}
            style={progressMidStyle}
          />
          <SliderProgressStyled style={progressEndStyle} />
        </SliderTrackStyled>

        <div>
          <SliderLabelMinStyled>{minLabel}</SliderLabelMinStyled>
          <SliderLabelMaxStyled>{maxLabel}</SliderLabelMaxStyled>
          {customLabelValuesWithRatio.map(({ value, cssStyle }) => (
            <SliderLabelStyled key={value} style={cssStyle}>
              {value}
            </SliderLabelStyled>
          ))}
        </div>

        <SliderHandle
          beginHandleMovement={leftHandle.beginHandleMovement}
          beginHandleTouchMovement={leftHandle.beginHandleTouchMovement}
          direction={'left'}
          disabled={disabled}
          handleElementRef={leftHandle.handleElementRef}
          handleKeyDown={leftHandle.handleKeyDown}
          handleKeyUp={leftHandle.handleKeyUp}
          label={leftHandle.tooltipValue}
          style={leftHandleStyle}
          tabIndex={0}
        />

        <SliderHandle
          beginHandleMovement={rightHandle.beginHandleMovement}
          beginHandleTouchMovement={rightHandle.beginHandleTouchMovement}
          direction={'right'}
          disabled={disabled}
          handleElementRef={rightHandle.handleElementRef}
          handleKeyDown={rightHandle.handleKeyDown}
          handleKeyUp={rightHandle.handleKeyUp}
          label={rightHandle.tooltipValue}
          style={rightHandleStyle}
        />
      </Root>
    );
  },
);

/**
 * bp4-dark と vertical は除外（必要になったら別コンポーネントとして作成）
 */
const Root = styled.div`
  height: 40px;
  min-width: 150px;
  width: 100%;
  cursor: default;
  outline: none;
  position: relative;
  user-select: none;

  &:hover {
    cursor: pointer;
  }
  &:active {
    cursor: grabbing;
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &.unlabeled {
    height: 16px;
  }
`;
