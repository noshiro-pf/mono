import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../../../types/enum/answer-symbol-point';
import { IAnswerSymbolType } from '../../../types/record/answer-symbol';
import { IList } from '../../../utils/immutable';
import { ForciblyUpdatedValue } from '../../../utils/forcibly-updated-value';
import { Description } from '../../atoms/description';
import {
  symbolListReducer,
  symbolListReducerInitialState,
} from './symbol-list-reducer';
import { AnswerSymbolRow } from './symbol-setting-row';

const vt = texts.createEventPage.section3;

const Root = styled.div`
  & > * {
    margin-bottom: 5px;
  }
`;

export const SymbolSettings = memoNamed<{
  answerSymbolList: ForciblyUpdatedValue<IList<IAnswerSymbolType>>;
  onAnswerSymbolListChange: (value: IList<IAnswerSymbolType>) => void;
}>(
  'SymbolSettings',
  ({ answerSymbolList: answerSymbolListInput, onAnswerSymbolListChange }) => {
    const [answerSymbolSet, dispach] = useReducer(
      symbolListReducer,
      symbolListReducerInitialState
    );

    const answerSymbolList = useMemo<IList<IAnswerSymbolType>>(
      () => answerSymbolSet.value.toList(),
      [answerSymbolSet]
    );

    useEffect(() => {
      dispach({ type: 'fromProps', list: answerSymbolListInput.value });
    }, [answerSymbolListInput]);

    useEffect(() => {
      if (answerSymbolSet.lastAction !== 'fromProps') {
        onAnswerSymbolListChange(answerSymbolList);
      }
    }, [
      answerSymbolSet.lastAction,
      onAnswerSymbolListChange,
      answerSymbolList,
    ]);

    const onPointChange = useCallback(
      (iconId: AnswerSymbolIconId, point: AnswerSymbolPointEnumType) => {
        dispach({ type: 'update-point', iconId, point });
      },
      []
    );

    const onDescriptionChange = useCallback(
      (iconId: AnswerSymbolIconId, description: string) => {
        dispach({ type: 'update-description', iconId, description });
      },
      []
    );

    const onDeleteClick = useCallback((iconId: AnswerSymbolIconId) => {
      console.log('onDeleteClick', iconId); // TODO
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
            />
          )
        )}
        <Description text={vt.customizeSymbolDescription} />
      </Root>
    );
  }
);
