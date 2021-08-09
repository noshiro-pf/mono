// import { SelectSymbolPopover } from './select-symbol-popover/select-symbol-popover';
import type {
  AnswerSymbol,
  AnswerSymbolIconId,
  AnswerSymbolPointEnumType,
} from '@noshiro/event-schedule-app-shared';
import { BpInput, BpNumericInput } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';
import styled from 'styled-components';
import { answerSymbolPointConfig } from '../../../constants';
import { clampAndRoundAnswerSymbolPoint } from '../../../functions';
import { CustomIcon } from '../../atoms';

type Props = Readonly<{
  answerSymbol: AnswerSymbol;
  iconsInUse: readonly AnswerSymbolIconId[];
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
            disabled={disabled}
            value={answerSymbol.description}
            onValueChange={onDescriptionChange}
          />
        </DescriptionWrapper>
        <NumericInputWrapper>
          <BpNumericInput
            disabled={disabled}
            majorStepSize={answerSymbolPointConfig.majorStep}
            max={answerSymbolPointConfig.max}
            min={answerSymbolPointConfig.min}
            minorStepSize={answerSymbolPointConfig.minorStep}
            stepSize={answerSymbolPointConfig.step}
            value={answerSymbol.point}
            onValueChange={onPointChangeHandler}
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
  flex: 0 0 75px;
`;
