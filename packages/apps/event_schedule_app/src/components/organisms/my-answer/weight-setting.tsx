import type { Weight } from '@noshiro/event-schedule-app-api';
import { BpNumericInput } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
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
          value={weight}
          onValueChangeFiltered={onWeightChange as (value: number) => void}
          valueWhenNotParsedAsNumber={1}
          convertValueOnBlurAndEmit={clampAndRoundAnswerWeight}
          min={weightNumericInputConfig.min}
          max={weightNumericInputConfig.max}
          minorStepSize={weightNumericInputConfig.minorStep}
          stepSize={weightNumericInputConfig.step}
          majorStepSize={weightNumericInputConfig.majorStep}
          disabled={disabled}
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
