import { Button, FormGroup } from '@blueprintjs/core';
import type {
  Answer,
  EventSchedule,
  UserName,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { IList, match } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useAnswerBeingEditedHooks } from '../../../hooks';
import { CustomIcon, Description } from '../../atoms';
import {
  BpInput,
  BpTextArea,
  ButtonNowrapStyled,
  HTMLTableBorderedStyled,
} from '../../bp';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
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

const dc = dict.answerPage.answerBeingEdited;

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
      iconHeader,
      answerBeingEditedList,
      onWeightChange,
      toggleRequiredSection,
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
                  dc.theNameIsAlreadyUsed
                ) : (
                  dc.nameIsRequired
                )
              ) : (
                <Spacer />
              )
            }
            intent={showUserNameError ? 'danger' : 'primary'}
            label={dc.yourName}
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
                  <Button
                    icon={<CustomIcon iconName={'good'} />}
                    minimal={true}
                    title={iconHeader.good.iconDescription}
                    onClick={iconHeader.good.onClick}
                  />
                </th>
                <th>
                  <Button
                    icon={<CustomIcon iconName={'fair'} />}
                    minimal={true}
                    title={iconHeader.fair.iconDescription}
                    onClick={iconHeader.fair.onClick}
                  />
                </th>
                <th>
                  <Button
                    icon={<CustomIcon iconName={'poor'} />}
                    minimal={true}
                    title={iconHeader.poor.iconDescription}
                    onClick={iconHeader.poor.onClick}
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
                      <Button
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
                      <Button
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
                      <Button
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
                        good: <AnswerIconGoodPoint />,
                        poor: <AnswerIconPoorPoint />,
                        fair: (
                          <AnswerIconFairPointInput
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
          <FormGroup label={dc.comments}>
            <BpTextArea
              fill={true}
              growVertically={true}
              value={answerBeingEdited.comment}
              onValueChange={onCommentChange}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <Paragraph>
          <ParagraphWithSwitch
            description={dc.required.description}
            disabledInsteadOfHidden={false}
            elementToToggle={undefined}
            show={answerBeingEdited.isRequiredParticipants}
            title={dc.required.title}
            onToggle={toggleRequiredSection}
          />
        </Paragraph>
        <Paragraph>
          <WeightSettingWrapper>
            <WeightSetting
              weight={answerBeingEdited.weight}
              onWeightChange={onWeightChange}
            />
          </WeightSettingWrapper>
          {IList.map(dc.weight.description, (d, i) => (
            <Description key={i} text={d} />
          ))}
        </Paragraph>

        <ButtonsWrapperAlignEnd>
          <ButtonNowrapStyled
            disabled={submitButtonIsLoading}
            intent='none'
            text={dict.common.buttonText.cancel}
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

const Table = styled(HTMLTableBorderedStyled)`
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

const Paragraph = styled.div`
  margin: 20px 0;
`;

const WeightSettingWrapper = styled.div`
  margin-bottom: 5px;
`;
