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
            label={vt.yourName}
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
          >
            <BpInput
              value={answerForEditing.userName}
              onValueChange={onUserNameChange as (v: string) => void}
              autoFocus={true}
              onBlur={onUserNameBlur}
            />
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
                    icon={<CustomIcon iconName={s.iconId} />}
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
                            iconName={s.iconId}
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
              value={answerForEditing.comment}
              onValueChange={onCommentChange}
              fill={true}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <ParagraphWithSwitch
          title={vt.weight.title}
          description={
            answerForEditing.useWeight
              ? vt.weight.description
              : vt.weight.description.slice(0, 1)
          }
          show={answerForEditing.useWeight}
          onToggle={toggleWeightSection}
          elementToToggle={
            <WeightSetting
              weight={answerForEditing.weight}
              onWeightChange={onWeightChange}
              disabled={!answerForEditing.useWeight}
            />
          }
        />
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
              onConfirmDeleteAnswer={onDeleteAnswer}
              loading={submitButtonIsLoading}
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
            onClick={onSubmitAnswer}
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

const Spacer = styled.div`
  height: 1rem;
`;
