import type {
  AnswerSymbolId,
  AnswerSymbolPoint,
  SymbolSetting,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { match } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { CustomIcon } from '../../atoms';
import { BpInput } from '../../bp';
import {
  AnswerSymbolFairPointInput,
  AnswerSymbolGoodPoint,
  AnswerSymbolPoorPoint,
} from '../../molecules';

type Props = Readonly<{
  symbolId: AnswerSymbolId;
  answerSymbol: SymbolSetting;
  onDescriptionChange: (value: string) => void;
  onPointChange: (value: AnswerSymbolPoint) => void;
}>;

export const AnswerSymbolRow = memoNamed<Props>(
  'AnswerSymbolRow',
  ({ symbolId, answerSymbol, onDescriptionChange, onPointChange }) => (
    <Root>
      <IconWrapper>
        <CustomIcon iconName={symbolId} />
      </IconWrapper>
      <DescriptionWrapper>
        <BpInput
          value={answerSymbol.description}
          onValueChange={onDescriptionChange}
        />
      </DescriptionWrapper>
      <NumericInputWrapper>
        {match(symbolId, {
          good: <AnswerSymbolGoodPoint />,
          poor: <AnswerSymbolPoorPoint />,
          fair: (
            <AnswerSymbolFairPointInput
              disabled={false}
              value={answerSymbol.point}
              onValueChange={onPointChange}
            />
          ),
        })}
      </NumericInputWrapper>
    </Root>
  )
);

const Root = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 5px;
  justify-content: flex-start;

  & > * {
    margin-right: 3px;
  }
`;

const IconWrapper = styled.div`
  flex: 0;
  padding: 0 5px;
`;
const DescriptionWrapper = styled.div`
  flex: 2 2;
  min-width: 92px;
  max-width: 300px;
`;

const NumericInputWrapper = styled.div`
  flex: 0 0 75px;
`;
