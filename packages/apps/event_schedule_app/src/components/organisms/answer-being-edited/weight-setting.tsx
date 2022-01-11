import type { Weight } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { WeightNumericInput } from '../../molecules';

const dc = dict.answerPage.answerBeingEdited;

export type WeightSettingProps = Readonly<{
  weight: Weight;
  onWeightChange: (v: Weight) => void;
}>;

export const WeightSetting = memoNamed<WeightSettingProps>(
  'WeightSetting',
  ({ weight, onWeightChange }) => (
    <Wrapper>
      <NumericInputWrapper>
        <WeightNumericInput weight={weight} onWeightChange={onWeightChange} />
      </NumericInputWrapper>
      <Suffix>{dc.weight.suffix}</Suffix>
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
