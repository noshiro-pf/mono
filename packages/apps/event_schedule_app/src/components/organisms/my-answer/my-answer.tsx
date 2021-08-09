import { FormGroup, HTMLTable } from '@blueprintjs/core';
import type {
  Answer,
  EventSchedule,
  UserName,
} from '@noshiro/event-schedule-app-shared';
import {
  BpButton,
  BpInput,
  BpTextArea,
} from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { CustomIcon, Td, Th } from '../../atoms';
import { ButtonsWrapperAlignEnd } from '../../molecules';
import { WidthRestrictedInputWrapper } from '../../styled';
import { DatetimeRangeCell } from '../answer-table';
import { ParagraphWithSwitch } from '../paragraph-with-switch';
import { DeleteAnswerButton } from './delete-answer-button';
import { useMyAnswerHooks } from './my-answer-hooks';
import { WeightSetting } from './weight-setting';

type Props = Readonly<{
  eventSchedule: EventSchedule;
  answers: readonly Answer[];
  answerForEditing: Answer;
  updateAnswerForEditing: (updater: (answer: Answer) => Answer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
  myAnswerSectionState: 'creating' | 'editing' | 'hidden';
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  selectedAnswerUserName: UserName | undefined;
}>;

const vt = texts.answerPage.myAnswer;

export const MyAnswer = memoNamed<Props>(
  'MyAnswer',
  ({
    eventSchedule,
    answers,
    answerForEditing,
    updateAnswerForEditing,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    myAnswerSectionState,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    selectedAnswerUserName,
  }) => {
    const {
      showUserNameError,
      theNameIsAlreadyUsed,
      onUserNameBlur,
      onUserNameChange,
      onCommentChange,
      symbolHeader,
      myAnswerList,
      onWeightChange,
      toggleWeightSection,
    } = useMyAnswerHooks({
      eventSchedule,
      answers,
      selectedAnswerUserName,
      answerForEditing,
      updateAnswerForEditing,
    });

    return (
      <>
        <WidthRestrictedInputWrapper>
          <FormGroup
            helperText={
              showUserNameError ? (
                theNameIsAlreadyUsed ? (
                  vt.theNameIsAlreadyUsed
                ) : (
                  vt.nameIsRequired
                )
              ) : (
                <Spacer />
              )
            }
            intent={showUserNameError ? 'danger' : 'primary'}
            label={vt.yourName}
          >
            <BpInput
              autoFocus={true}
              value={answerForEditing.userName}
              onBlur={onUserNameBlur}
              onValueChange={onUserNameChange as (v: string) => void}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <HTMLTable bordered={true}>
          <thead>
            <tr>
              <Th />
              {symbolHeader.map((s) => (
                <Th key={s.iconId}>
                  <BpButton
                    icon={<CustomIcon iconName={s.iconId} />}
                    minimal={true}
                    title={s.symbolDescription}
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
                    <Td key={s.iconId} style={style}>
                      <BpButton
                        active={s.iconId === selectedSymbol}
                        icon={
                          <CustomIcon
                            color={
                              s.iconId === selectedSymbol ? 'blue' : 'gray'
                            }
                            iconName={s.iconId}
                          />
                        }
                        minimal={true}
                        title={s.symbolDescription}
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
              fill={true}
              value={answerForEditing.comment}
              onValueChange={onCommentChange}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <ParagraphWithSwitch
          description={
            answerForEditing.useWeight
              ? vt.weight.description
              : vt.weight.description.slice(0, 1)
          }
          elementToToggle={
            <WeightSetting
              disabled={!answerForEditing.useWeight}
              weight={answerForEditing.weight}
              onWeightChange={onWeightChange}
            />
          }
          show={answerForEditing.useWeight}
          title={vt.weight.title}
          onToggle={toggleWeightSection}
        />
        <ButtonsWrapperAlignEnd>
          <BpButton
            disabled={submitButtonIsLoading}
            intent='none'
            nowrap={true}
            text={texts.buttonText.cancel}
            onClick={onCancel}
          />
          {myAnswerSectionState === 'editing' ? (
            <DeleteAnswerButton
              loading={submitButtonIsLoading}
              onConfirmDeleteAnswer={onDeleteAnswer}
            />
          ) : undefined}
          <BpButton
            disabled={submitButtonIsDisabled}
            icon='tick'
            intent='primary'
            loading={submitButtonIsLoading}
            nowrap={true}
            text={
              myAnswerSectionState === 'creating'
                ? vt.submitButton.create
                : myAnswerSectionState === 'editing'
                ? vt.submitButton.update
                : ''
            }
            onClick={onSubmitAnswer}
          />
        </ButtonsWrapperAlignEnd>
      </>
    );
  }
);

const style = {
  padding: '6px',
};

const Spacer = styled.div`
  height: 1rem;
`;
