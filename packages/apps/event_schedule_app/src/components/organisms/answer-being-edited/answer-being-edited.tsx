import { FormGroup } from '@blueprintjs/core';
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
import { match } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { useAnswerBeingEditedHooks } from '../../../hooks';
import { CustomIcon } from '../../atoms';
import { BpTableBordered } from '../../bp';
import {
  AnswerSymbolFairPointInput,
  AnswerSymbolGoodPointInputDisabled,
  AnswerSymbolPoorPointInputDisabled,
} from '../../molecules';
import {
  ButtonsWrapperAlignEnd,
  WidthRestrictedInputWrapper,
} from '../../styled';
import { DatetimeRangeCell } from '../answer-table';
import {
  DeleteAnswerButton,
  SubmitAnswerButtonWithConfirmation,
} from '../button-with-confirm';
import { ParagraphWithSwitch } from '../paragraph-with-switch';
import { WeightSetting } from './weight-setting';

type Props = Readonly<{
  eventSchedule: EventSchedule;
  answers: readonly Answer[];
  answerBeingEdited: Answer;
  updateAnswerBeingEdited: (updater: (answer: Answer) => Answer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
  answerBeingEditedSectionState: 'creating' | 'editing';
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  selectedAnswerUserName: UserName | undefined;
}>;

const vt = texts.answerPage.answerBeingEdited;

export const AnswerBeingEdited = memoNamed<Props>(
  'AnswerBeingEdited',
  ({
    eventSchedule,
    answers,
    answerBeingEdited,
    updateAnswerBeingEdited,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    answerBeingEditedSectionState,
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
      answerBeingEditedList,
      onWeightChange,
      toggleRequiredSection,
      toggleWeightSection,
      hasUnanswered,
    } = useAnswerBeingEditedHooks({
      eventSchedule,
      answers,
      selectedAnswerUserName,
      answerBeingEdited,
      updateAnswerBeingEdited,
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
              value={answerBeingEdited.userName}
              onBlur={onUserNameBlur}
              onValueChange={onUserNameChange as (v: string) => void}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th />
                <th>
                  <BpButton
                    icon={<CustomIcon iconName={'good'} />}
                    minimal={true}
                    title={symbolHeader.good.symbolDescription}
                    onClick={symbolHeader.good.onClick}
                  />
                </th>
                <th>
                  <BpButton
                    icon={<CustomIcon iconName={'fair'} />}
                    minimal={true}
                    title={symbolHeader.fair.symbolDescription}
                    onClick={symbolHeader.fair.onClick}
                  />
                </th>
                <th>
                  <BpButton
                    icon={<CustomIcon iconName={'poor'} />}
                    minimal={true}
                    title={symbolHeader.poor.symbolDescription}
                    onClick={symbolHeader.poor.onClick}
                  />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {answerBeingEditedList.map(
                ({
                  key,
                  datetimeRange,
                  answerSelectionValue: { point, iconId },
                  buttons,
                  onPointChange,
                }) => (
                  <tr key={key}>
                    <td>
                      <DatetimeRangeCell
                        datetimeRange={datetimeRange}
                        datetimeSpecification={
                          eventSchedule.datetimeSpecification
                        }
                      />
                    </td>
                    <td>
                      <BpButton
                        active={iconId === 'good'}
                        icon={
                          <CustomIcon
                            color={iconId === 'good' ? 'blue' : 'gray'}
                            iconName={'good'}
                          />
                        }
                        minimal={true}
                        title={buttons.good.description}
                        onClick={buttons.good.onClick}
                      />
                    </td>
                    <td>
                      <BpButton
                        active={iconId === 'fair'}
                        icon={
                          <CustomIcon
                            color={iconId === 'fair' ? 'blue' : 'gray'}
                            iconName={'fair'}
                          />
                        }
                        minimal={true}
                        title={buttons.fair.description}
                        onClick={buttons.fair.onClick}
                      />
                    </td>
                    <td>
                      <BpButton
                        active={iconId === 'poor'}
                        icon={
                          <CustomIcon
                            color={iconId === 'poor' ? 'blue' : 'gray'}
                            iconName={'poor'}
                          />
                        }
                        minimal={true}
                        title={buttons.poor.description}
                        onClick={buttons.poor.onClick}
                      />
                    </td>
                    <TdWithMaxWidth>
                      {match(iconId, {
                        none: undefined,
                        good: <AnswerSymbolGoodPointInputDisabled />,
                        poor: <AnswerSymbolPoorPointInputDisabled />,
                        fair: (
                          <AnswerSymbolFairPointInput
                            disabled={false}
                            value={point}
                            onValueChange={onPointChange}
                          />
                        ),
                      })}
                    </TdWithMaxWidth>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </TableWrapper>
        <WidthRestrictedInputWrapper>
          <FormGroup label={vt.comments}>
            <BpTextArea
              fill={true}
              value={answerBeingEdited.comment}
              onValueChange={onCommentChange}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <ParagraphWithSwitchWrapper>
          <ParagraphWithSwitch
            description={vt.required.description}
            disabledInsteadOfHidden={false}
            elementToToggle={undefined}
            show={answerBeingEdited.isRequiredParticipants}
            title={vt.required.title}
            onToggle={toggleRequiredSection}
          />
        </ParagraphWithSwitchWrapper>
        <ParagraphWithSwitchWrapper>
          <ParagraphWithSwitch
            description={
              answerBeingEdited.useWeight
                ? vt.weight.description
                : vt.weight.description.slice(0, 1)
            }
            disabledInsteadOfHidden={false}
            elementToToggle={
              <WeightSetting
                disabled={!answerBeingEdited.useWeight}
                weight={answerBeingEdited.weight}
                onWeightChange={onWeightChange}
              />
            }
            show={answerBeingEdited.useWeight}
            title={vt.weight.title}
            onToggle={toggleWeightSection}
          />
        </ParagraphWithSwitchWrapper>

        <ButtonsWrapperAlignEnd>
          <BpButton
            disabled={submitButtonIsLoading}
            intent='none'
            nowrap={true}
            text={texts.buttonText.cancel}
            onClick={onCancel}
          />
          {answerBeingEditedSectionState === 'editing' ? (
            <DeleteAnswerButton
              loading={submitButtonIsLoading}
              onConfirmDeleteAnswer={onDeleteAnswer}
            />
          ) : undefined}
          <SubmitAnswerButtonWithConfirmation
            disabled={submitButtonIsDisabled}
            hasUnanswered={hasUnanswered}
            loading={submitButtonIsLoading}
            mode={answerBeingEditedSectionState}
            onConfirmSubmissionOfAnswer={onSubmitAnswer}
          />
        </ButtonsWrapperAlignEnd>
      </>
    );
  }
);

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled(BpTableBordered)`
  th,
  td {
    padding: 6px;
  }
`;

const TdWithMaxWidth = styled.td`
  min-width: 87px;
  max-width: 87px;
`;

const Spacer = styled.div`
  height: 1rem;
`;

const ParagraphWithSwitchWrapper = styled.div`
  margin: 20px 0;
`;
