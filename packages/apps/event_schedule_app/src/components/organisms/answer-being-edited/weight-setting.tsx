import type { Weight } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { WeightNumericInput } from '../../molecules';

const vt = texts.answerPage.answerBeingEdited;

export type WeightSettingProps = Readonly<{
  weight: Weight;
  onWeightChange: (v: Weight) => void;
  disabled: boolean;
}>;

export const WeightSetting = memoNamed<WeightSettingProps>(
  'WeightSetting',
  ({ weight, onWeightChange, disabled }) => (
    <Wrapper>
      <NumericInputWrapper>
        <WeightNumericInput
          disabled={disabled}
          weight={weight}
          onWeightChange={onWeightChange}
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
