import { FormGroup, HTMLTable } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../constants/texts';
import { IAnswer } from '../../../types/record/answer';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { BpButton } from '../../atoms/blueprint-js-wrapper/bp-button';
import { BpInput } from '../../atoms/blueprint-js-wrapper/bp-input';
import { BpTextArea } from '../../atoms/blueprint-js-wrapper/bp-textarea';
import { CustomIcon } from '../../atoms/icon';
import { Td, Th } from '../../atoms/table-cell-centered';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';
import { WidthRestrictedInputWrapper } from '../../styled/width-restricted-input-wrapper';
import { DatetimeRangeCell } from '../answer-table/datetime-range-cell';
import { DeleteAnswerButton } from './delete-all/delete-answer-button';
import { useMyAnswerHooks } from './my-answer-hooks';

interface Props {
  eventSchedule: IEventSchedule;
  myAnswer: IAnswer;
  onMyAnswerChange: (answer: IAnswer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => void;
  onSubmitAnswer: () => void;
  myAnswerSectionState: 'hidden' | 'creating' | 'editing';
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
}

const vt = texts.answerPage.myAnswer;

export const MyAnswer = memoNamed<Props>(
  'MyAnswer',
  ({
    eventSchedule,
    myAnswer,
    onMyAnswerChange,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    myAnswerSectionState,
    submitButtonIsLoading,
    submitButtonIsDisabled,
  }) => {
    const {
      userName,
      onUserNameChange,
      comment,
      onCommentChange,
      symbolHeader,
      myAnswerList,
      onDelete,
      onSubmit,
    } = useMyAnswerHooks(
      eventSchedule,
      myAnswer,
      onMyAnswerChange,
      onDeleteAnswer,
      onSubmitAnswer
    );

    return (
      <>
        <WidthRestrictedInputWrapper>
          <FormGroup label={vt.yourName}>
            <BpInput value={userName} onValueChange={onUserNameChange} />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <HTMLTable bordered={true}>
          <thead>
            <tr>
              <Th></Th>
              {symbolHeader.map((s) => (
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
            {myAnswerList.map(
              ({ datetimeRange, selectedSymbol, buttons }, i) => (
                <tr key={i}>
                  <Td>
                    <DatetimeRangeCell
                      datetimeRange={datetimeRange}
                      datetimeSpecification={
                        eventSchedule.datetimeSpecification
                      }
                    />
                  </Td>
                  {buttons.map((s) => (
                    <Td style={style} key={s.iconId}>
                      <BpButton
                        icon={
                          <CustomIcon
                            name={s.iconId}
                            color={
                              s.iconId === selectedSymbol ? 'blue' : 'gray'
                            }
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
              value={comment}
              onValueChange={onCommentChange}
              fill={true}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <ButtonsWrapperAlignEnd>
          <BpButton
            intent='none'
            text={texts.buttonText.cancel}
            onClick={onCancel}
            disabled={submitButtonIsLoading}
            nowrap={true}
          />
          {myAnswerSectionState === 'editing' ? (
            <DeleteAnswerButton
              onConfirmDeleteAnswer={onDelete}
              loading={submitButtonIsLoading}
              disabled={submitButtonIsDisabled}
            />
          ) : undefined}
          <BpButton
            intent='primary'
            icon='tick'
            text={
              myAnswerSectionState === 'creating'
                ? vt.submitButton.create
                : myAnswerSectionState === 'editing'
                ? vt.submitButton.update
                : ''
            }
            onClick={onSubmit}
            loading={submitButtonIsLoading}
            disabled={submitButtonIsDisabled}
            nowrap={true}
          />
        </ButtonsWrapperAlignEnd>
      </>
    );
  }
);

const style = {
  padding: '6px',
};
