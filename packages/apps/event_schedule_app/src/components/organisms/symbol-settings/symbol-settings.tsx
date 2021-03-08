import { memoNamed } from '@noshiro/react-utils';
import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../../../types/enum/answer-symbol-point';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import { IList, IMap } from '../../../utils/immutable';
import { clog } from '../../../utils/log';
import {
  symbolListReducer,
  SymbolListReducerAction,
  SymbolListReducerState,
} from './symbol-list-reducer';
import { AnswerSymbolRow } from './symbol-setting-row';

interface Props {
  answerSymbolList: IList<IAnswerSymbol>;
  onAnswerSymbolListChange: (value: IList<IAnswerSymbol>) => void;
  disabled: boolean;
}

export const SymbolSettings = memoNamed<Props>(
  'SymbolSettings',
  ({ answerSymbolList, onAnswerSymbolListChange, disabled }) => {
    const answerSymbolListMap = useMemo<SymbolListReducerState>(
      () => IMap(answerSymbolList.map((e) => [e.iconId, e])),
      [answerSymbolList]
    );
    const dispatch = useCallback(
      (action: SymbolListReducerAction) => {
        onAnswerSymbolListChange(
          symbolListReducer(answerSymbolListMap, action).toList()
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

    const iconsInUse = useMemo<IList<AnswerSymbolIconId>>(
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
              iconsInUse={iconsInUse}
              onDescriptionChange={onDescriptionChangeHandler}
              onPointChange={onPointChangeHandler}
              onDeleteClick={onDeleteClickHandler}
              disabled={disabled}
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
