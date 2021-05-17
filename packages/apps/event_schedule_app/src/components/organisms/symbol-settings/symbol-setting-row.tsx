// import { SelectSymbolPopover } from './select-symbol-popover/select-symbol-popover';
import { BpInput, BpNumericInput } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';
import styled from 'styled-components';
import {
  answerSymbolPointConfig,
  clampAndRoundAnswerSymbolPoint,
} from '../../../constants/answer-symbol-point';
import type { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import type { AnswerSymbolPointEnumType } from '../../../types/enum/answer-symbol-point';
import type { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import type { IList } from '../../../utils/immutable';
import { CustomIcon } from '../../atoms/icon';

type Props = Readonly<{
  answerSymbol: IAnswerSymbol;
  iconsInUse: IList<AnswerSymbolIconId>;
  onDescriptionChange: (value: string) => void;
  onPointChange: (value: AnswerSymbolPointEnumType) => void;
  onDeleteClick: () => void;
  disabled: boolean;
}>;

export const AnswerSymbolRow = memoNamed<Props>(
  'AnswerSymbolRow',
  ({ answerSymbol, onDescriptionChange, onPointChange, disabled }) => {
    // const onIconSelect = useCallback((id: AnswerSymbolIconId) => {
    //   clog('onIconSelect', id);
    // }, []);

    const onPointChangeHandler = useCallback(
      (value: number) => {
        onPointChange(clampAndRoundAnswerSymbolPoint(value));
      },
      [onPointChange]
    );

    return (
      <Root>
        <IconWrapper>
          <CustomIcon iconName={answerSymbol.iconId} />
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
            disabled={disabled}
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
            disabled={disabled}
          />
        </NumericInputWrapper>
        {/* <ButtonsWrapper>
          <BpButton icon={'trash'} minimal={true} onClick={onDeleteClick} />
        </ButtonsWrapper> */}
      </Root>
    );
  }
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
  flex: 0 0 65px;
`;
