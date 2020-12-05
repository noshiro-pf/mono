import { FormGroup, HTMLTable } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../constants/texts';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { IList } from '../../../utils/immutable';
import { BpInput } from '../../atoms/blueprint-js-wrapper/bp-input';
import { BpTextArea } from '../../atoms/blueprint-js-wrapper/bp-textarea';
import { BpButton } from '../../atoms/blueprint-js-wrapper/button';
import { CustomIcon } from '../../atoms/icon';
import { Td, Th } from '../../atoms/table-cell-centered';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';
import { WidthRestrictedInputWrapper } from '../../styled/width-restricted-input-wrapper';
import { DatetimeRangeCell } from '../answer-table/datetime-range-cell';
import { DeleteAnswerButton } from './delete-all/delete-answer-button';

interface Props {
  eventSchedule: IEventSchedule;
  userName: string;
  onUserNameChange: (v: string) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onSubmit: () => void;
  symbolHeader: IList<{
    iconId: AnswerSymbolIconId;
    symbolDescription: string;
    onClick: () => void;
  }>;
  myAnswerList: IList<{
    datetimeRange: IDatetimeRange;
    selectedSymbol: AnswerSymbolIconId | undefined;
    buttons: IList<{
      iconId: AnswerSymbolIconId;
      symbolDescription: string;
      onClick: () => void;
    }>;
  }>;
  myAnswerSectionState: 'hidden' | 'creating' | 'editing';
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
}

const vt = texts.answerPage.myAnswer;

export const MyAnswerView = memoNamed<Props>('MyAnswerView', (props: Props) => (
  <>
    <WidthRestrictedInputWrapper>
      <FormGroup label={vt.yourName}>
        <BpInput
          value={props.userName}
          onValueChange={props.onUserNameChange}
        />
      </FormGroup>
    </WidthRestrictedInputWrapper>
    <HTMLTable bordered={true}>
      <thead>
        <tr>
          <Th></Th>
          {props.symbolHeader.map((s) => (
            <Th key={s.iconId}>
              <BpButton
                title={s.symbolDescription}
                icon={<CustomIcon name={s.iconId} />}
                minimal={true}
                onClick={s.onClick}
              />
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.myAnswerList.map(
          ({ datetimeRange, selectedSymbol, buttons }, i) => (
            <tr key={i}>
              <Td>
                <DatetimeRangeCell
                  datetimeRange={datetimeRange}
                  datetimeSpecification={
                    props.eventSchedule.datetimeSpecification
                  }
                />
              </Td>
              {buttons.map((s) => (
                <Td style={style} key={s.iconId}>
                  <BpButton
                    icon={
                      <CustomIcon
                        name={s.iconId}
                        color={s.iconId === selectedSymbol ? 'blue' : 'gray'}
                      />
                    }
                    title={s.symbolDescription}
                    active={s.iconId === selectedSymbol}
                    minimal={true}
                    onClick={s.onClick}
                  />
                </Td>
              ))}
            </tr>
          )
        )}
      </tbody>
    </HTMLTable>
    <WidthRestrictedInputWrapper>
      <FormGroup label={vt.comments}>
        <BpTextArea
          value={props.comment}
          onValueChange={props.onCommentChange}
          fill={true}
        />
      </FormGroup>
    </WidthRestrictedInputWrapper>
    <ButtonsWrapperAlignEnd>
      <BpButton
        intent='none'
        text={texts.buttonText.cancel}
        onClick={props.onCancel}
        disabled={props.submitButtonIsLoading}
        nowrap={true}
      />
      {props.myAnswerSectionState === 'editing' ? (
        <DeleteAnswerButton
          onConfirmDeleteAnswer={props.onDelete}
          loading={props.submitButtonIsLoading}
          disabled={props.submitButtonIsDisabled}
        />
      ) : undefined}
      <BpButton
        intent='primary'
        icon='tick'
        text={
          props.myAnswerSectionState === 'creating'
            ? vt.submitButton.create
            : props.myAnswerSectionState === 'editing'
            ? vt.submitButton.update
            : ''
        }
        onClick={props.onSubmit}
        loading={props.submitButtonIsLoading}
        disabled={props.submitButtonIsDisabled}
        nowrap={true}
      />
    </ButtonsWrapperAlignEnd>
  </>
));

const style = {
  padding: '6px',
};
