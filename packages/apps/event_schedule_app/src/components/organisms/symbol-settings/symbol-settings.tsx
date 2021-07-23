import type {
  AnswerSymbol,
  AnswerSymbolIconId,
  AnswerSymbolPointEnumType,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { IMap } from '@noshiro/ts-utils';
import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { clog } from '../../../utils';
import type {
  SymbolListReducerAction,
  SymbolListReducerState,
} from './symbol-list-reducer';
import { symbolListReducer } from './symbol-list-reducer';
import { AnswerSymbolRow } from './symbol-setting-row';

type Props = Readonly<{
  answerSymbolList: readonly AnswerSymbol[];
  onAnswerSymbolListChange: (value: readonly AnswerSymbol[]) => void;
  disabled: boolean;
}>;

export const SymbolSettings = memoNamed<Props>(
  'SymbolSettings',
  ({ answerSymbolList, onAnswerSymbolListChange, disabled }) => {
    const answerSymbolListMap = useMemo<SymbolListReducerState>(
      () => IMap.new(answerSymbolList.map((e) => [e.iconId, e])),
      [answerSymbolList]
    );
    const dispatch = useCallback(
      (action: SymbolListReducerAction) => {
        onAnswerSymbolListChange(
          symbolListReducer(answerSymbolListMap, action).toValuesArray()
        );
      },
      [answerSymbolListMap, onAnswerSymbolListChange]
    );

    useEffect(() => {
      onAnswerSymbolListChange(answerSymbolList);
    }, [onAnswerSymbolListChange, answerSymbolList]);

    const onPointChange = useCallback(
      (iconId: AnswerSymbolIconId, point: AnswerSymbolPointEnumType) => {
        dispatch({ type: 'update-point', iconId, point });
      },
      [dispatch]
    );

    const onDescriptionChange = useCallback(
      (iconId: AnswerSymbolIconId, description: string) => {
        dispatch({ type: 'update-description', iconId, description });
      },
      [dispatch]
    );

    const onDeleteClick = useCallback((iconId: AnswerSymbolIconId) => {
      clog('onDeleteClick', iconId); // TODO
    }, []);

    const iconsInUse = useMemo<readonly AnswerSymbolIconId[]>(
      () => answerSymbolList.map((e) => e.iconId),
      [answerSymbolList]
    );

    const listWithHandler = useMemo(
      () =>
        answerSymbolList.map((s) => ({
          key: s.iconId,
          value: s,
          onDescriptionChangeHandler: (value: string) => {
            onDescriptionChange(s.iconId, value);
          },
          onPointChangeHandler: (value: AnswerSymbolPointEnumType) => {
            onPointChange(s.iconId, value);
          },
          onDeleteClickHandler: () => {
            onDeleteClick(s.iconId);
          },
        })),
      [answerSymbolList, onDescriptionChange, onPointChange, onDeleteClick]
    );

    return (
      <Root>
        {listWithHandler.map(
          ({
            key,
            value,
            onDescriptionChangeHandler,
            onPointChangeHandler,
            onDeleteClickHandler,
          }) => (
            <AnswerSymbolRow
              key={key}
              answerSymbol={value}
              disabled={disabled}
              iconsInUse={iconsInUse}
              onDeleteClick={onDeleteClickHandler}
              onDescriptionChange={onDescriptionChangeHandler}
              onPointChange={onPointChangeHandler}
            />
          )
        )}
        {/* <Description text={vt.customizeSymbolDescription} /> */}
      </Root>
    );
  }
);

const Root = styled.div`
  & > * {
    margin-bottom: 5px;
  }
`;
