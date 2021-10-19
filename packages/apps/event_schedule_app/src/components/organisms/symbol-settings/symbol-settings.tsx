import type {
  AnswerSymbolPoint,
  SymbolSettings,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { noop } from '@noshiro/ts-utils';
import { useCallback } from 'react';
import styled from 'styled-components';
import type { SymbolListReducerAction } from '../../../functions';
import { symbolListReducer } from '../../../functions';
import { AnswerSymbolRow } from './symbol-setting-row';

type Props = Readonly<{
  answerSymbols: SymbolSettings;
  onAnswerSymbolsChange: (value: SymbolSettings) => void;
}>;

export const SymbolSettingsComponent = memoNamed<Props>(
  'SymbolSettings',
  ({ answerSymbols, onAnswerSymbolsChange }) => {
    const dispatch = useCallback(
      (action: SymbolListReducerAction) => {
        onAnswerSymbolsChange(symbolListReducer(answerSymbols, action));
      },
      [answerSymbols, onAnswerSymbolsChange]
    );

    const onOkDescriptionChange = useCallback(
      (description: string) => {
        dispatch({ type: 'update-description', iconId: 'good', description });
      },
      [dispatch]
    );

    const onNeitherDescriptionChange = useCallback(
      (description: string) => {
        dispatch({
          type: 'update-description',
          iconId: 'fair',
          description,
        });
      },
      [dispatch]
    );

    const onNeitherPointChange = useCallback(
      (point: AnswerSymbolPoint) => {
        dispatch({ type: 'update-point', iconId: 'fair', point });
      },
      [dispatch]
    );

    const onNgDescriptionChange = useCallback(
      (description: string) => {
        dispatch({ type: 'update-description', iconId: 'poor', description });
      },
      [dispatch]
    );

    return (
      <Root>
        <AnswerSymbolRow
          answerSymbol={answerSymbols.good}
          symbolId={'good'}
          onDescriptionChange={onOkDescriptionChange}
          onPointChange={noop}
        />
        <AnswerSymbolRow
          answerSymbol={answerSymbols.fair}
          symbolId={'fair'}
          onDescriptionChange={onNeitherDescriptionChange}
          onPointChange={onNeitherPointChange}
        />
        <AnswerSymbolRow
          answerSymbol={answerSymbols.poor}
          symbolId={'poor'}
          onDescriptionChange={onNgDescriptionChange}
          onPointChange={noop}
        />
      </Root>
    );
  }
);

const Root = styled.div`
  & > * {
    margin-bottom: 5px;
  }
`;
