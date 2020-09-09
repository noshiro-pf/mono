import { Icon, IconName } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import {
  answerSymbolPointConfig,
  AnswerSymbolPointEnumType,
  clampAndRoundAnswerSymbolPoint,
} from '../../../types/enum/answer-symbol-point';
import { IAnswerSymbolType } from '../../../types/record/answer-symbol';
// import { SelectSymbolPopover } from './select-symbol-popover/select-symbol-popover';
import { IList } from '../../../utils/immutable';
import { BpInput } from '../../atoms/blueprint-js-wrapper/bp-input';
import { BpNumericInput } from '../../atoms/blueprint-js-wrapper/bp-numeric-input';
import { CircleIcon, CloseIcon, TriangleIcon } from '../../atoms/icons';

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

// const ButtonsWrapper = styled.div`
//   display: flex;
//   flex-wrap: nowrap;
//   margin-left: 5px;
// `;

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
  flex: 0 0 65px;
`;

export const AnswerSymbolRow = memoNamed<{
  answerSymbol: IAnswerSymbolType;
  iconsInUse: IList<AnswerSymbolIconId>;
  onDescriptionChange: (value: string) => void;
  onPointChange: (value: AnswerSymbolPointEnumType) => void;
  onDeleteClick: () => void;
}>(
  'AnswerSymbolRow',
  (
    {
      answerSymbol,
      // iconsInUse,
      onDescriptionChange,
      onPointChange,
    } // onDeleteClick
  ) => {
    // const onIconSelect = useCallback((id: AnswerSymbolIconId) => {
    //   console.log('onIconSelect', id);
    // }, []);

    const onPointChangeHandler = useCallback(
      (value: number) => {
        onPointChange(clampAndRoundAnswerSymbolPoint(value));
      },
      [onPointChange]
    );

    const icon = useMemo<IconName | JSX.Element>(() => {
      switch (answerSymbol.iconId) {
        case 'handmade-circle':
          return <CircleIcon />;
        case 'handmade-triangle':
          return <TriangleIcon />;
        case 'handmade-cross':
          return <CloseIcon />;
        default:
          return answerSymbol.iconId;
      }
    }, [answerSymbol.iconId]);

    return (
      <Root>
        <IconWrapper>
          <Icon icon={icon} />
          {/* <SelectSymbolPopover
            openerIcon={icon}
            iconsInUse={iconsInUse}
            onIconSelectSubmit={onIconSelect}
          /> */}
        </IconWrapper>
        <DescriptionWrapper>
          <BpInput
            value={answerSymbol.description}
            onValueChange={onDescriptionChange}
          />
        </DescriptionWrapper>
        <NumericInputWrapper>
          <BpNumericInput
            value={answerSymbol.point}
            onValueChange={onPointChangeHandler}
            min={answerSymbolPointConfig.min}
            max={answerSymbolPointConfig.max}
            minorStepSize={answerSymbolPointConfig.minorStep}
            stepSize={answerSymbolPointConfig.step}
            majorStepSize={answerSymbolPointConfig.majorStep}
          />
        </NumericInputWrapper>
        {/* <ButtonsWrapper>
          <Button icon={'trash'} minimal={true} onClick={onDeleteClick} />
        </ButtonsWrapper> */}
      </Root>
    );
  }
);
