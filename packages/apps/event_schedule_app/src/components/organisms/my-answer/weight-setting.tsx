import type { Weight } from '@noshiro/event-schedule-app-shared';
import { BpNumericInput } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts, weightNumericInputConfig } from '../../../constants';
import { clampAndRoundAnswerWeight } from '../../../functions';

const vt = texts.answerPage.myAnswer;

export type WeightSettingProps = DeepReadonly<{
  weight: Weight;
  onWeightChange: (v: Weight) => void;
  disabled: boolean;
}>;

export const WeightSetting = memoNamed<WeightSettingProps>(
  'WeightSetting',
  ({ weight, onWeightChange, disabled }) => (
    <Wrapper>
      <NumericInputWrapper>
        <BpNumericInput
          convertValueOnBlurAndEmit={clampAndRoundAnswerWeight}
          disabled={disabled}
          majorStepSize={weightNumericInputConfig.majorStep}
          max={weightNumericInputConfig.max}
          min={weightNumericInputConfig.min}
          minorStepSize={weightNumericInputConfig.minorStep}
          stepSize={weightNumericInputConfig.step}
          value={weight}
          valueWhenNotParsedAsNumber={1}
          onValueChangeFiltered={onWeightChange as (value: number) => void}
        />
      </NumericInputWrapper>
      <Suffix>{vt.weight.suffix}</Suffix>
    </Wrapper>
  )
);

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const NumericInputWrapper = styled.div`
  flex: 0 0 120px;
`;

const Suffix = styled.div`
  margin-left: 5px;
`;
