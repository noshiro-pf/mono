import { Button, FormGroup } from '@blueprintjs/core';
import { theNameIsAlreadyUsedFn } from '../../../functions';
import { useFormError } from '../../../hooks';
import { AnswerPageStore, Auth } from '../../../store';
import { CustomIcon, Description } from '../../atoms';
import {
  BpInput,
  BpTextArea,
  ButtonNowrapStyled,
  HTMLTableBorderedStyled2,
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
  ForNonLoggedInUserDialog,
  SubmitAnswerButtonWithConfirmation,
} from '../button-with-confirm';
import { ParagraphWithSwitch } from '../paragraph-with-switch';
import { WeightSetting } from './weight-setting';

const dc = dict.answerPage.answerBeingEdited;

type Props = Readonly<{
  eventSchedule: EventSchedule;
  answers: readonly Answer[];
  answerBeingEdited: Answer;
  answerBeingEditedSectionState: 'creating' | 'editing';
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  selectedAnswerUserName: UserName | undefined;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const AnswerBeingEdited = memoNamed<Props>(
  'AnswerBeingEdited',
  ({
    eventSchedule,
    answers,
    answerBeingEdited,
    answerBeingEditedSectionState,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    selectedAnswerUserName,
    holidaysJpDefinition,
  }) => {
    const [showUserNameError, onUserNameChangeLocal, onUserNameBlur] =
      useFormError(
        answerBeingEdited.user.name,
        (v) =>
          v === '' ||
          theNameIsAlreadyUsedFn(v, answers, selectedAnswerUserName),
        AnswerPageStore.onUserNameChange
      );

    const theNameIsAlreadyUsed = useObservableValue(
      AnswerPageStore.theNameIsAlreadyUsed$
    );
    const iconHeader = useObservableValue(AnswerPageStore.iconHeader$);
    const answerBeingEditedList = useObservableValue(
      AnswerPageStore.answerBeingEditedList$
    );
    const hasUnanswered = useObservableValue(AnswerPageStore.hasUnanswered$);

    const fireAuthUser = Auth.useFireAuthUser();

    const forNonLoggedInUserDialogState = useBoolState(false);

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
              data-cy={'username'}
              intent={showUserNameError ? 'danger' : 'primary'}
              value={answerBeingEdited.user.name}
              onBlur={onUserNameBlur}
              onValueChange={onUserNameChangeLocal as (v: string) => void}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <TableWrapper>
          <Table>
            <thead>
              {iconHeader === undefined ? undefined : (
                <tr>
                  <th />
                  <th>
                    <Button
                      data-cy={'col-good-button'}
                      icon={<CustomIcon iconName={'good'} />}
                      minimal={true}
                      title={iconHeader.good.iconDescription}
                      onClick={iconHeader.good.onClick}
                    />
                  </th>
                  <th>
                    <Button
                      data-cy={'col-fair-button'}
                      icon={<CustomIcon iconName={'fair'} />}
                      minimal={true}
                      title={iconHeader.fair.iconDescription}
                      onClick={iconHeader.fair.onClick}
                    />
                  </th>
                  <th>
                    <Button
                      data-cy={'col-poor-button'}
                      icon={<CustomIcon iconName={'poor'} />}
                      minimal={true}
                      title={iconHeader.poor.iconDescription}
                      onClick={iconHeader.poor.onClick}
                    />
                  </th>
                  <th>{dc.table.header.score}</th>
                  <th>{dc.table.header.comment}</th>
                </tr>
              )}
            </thead>
            <tbody>
              {answerBeingEditedList.map(
                ({
                  key,
                  datetimeRange,
                  answerSelectionValue: { point, iconId, comment },
                  buttons,
                  onPointChange,
                  onCommentChange: onCellCommentChange,
                }) => (
                  <tr key={key}>
                    <td>
                      <DatetimeRangeCell
                        datetimeRange={datetimeRange}
                        datetimeSpecification={
                          eventSchedule.datetimeSpecification
                        }
                        holidaysJpDefinition={holidaysJpDefinition}
                        tableMinimized={false}
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
                    <td>
                      <TextArea
                        rows={1}
                        value={comment}
                        onValueChange={onCellCommentChange}
                      />
                    </td>
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
              onValueChange={AnswerPageStore.onCommentChange}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <Paragraph>
          <ParagraphWithSwitch
            description={dc.required.description}
            elementToToggle={undefined}
            hideContentIfToggleIsFalse={false}
            title={dc.required.title}
            toggleState={answerBeingEdited.isRequiredParticipants}
            onToggle={AnswerPageStore.toggleRequiredSection}
          />
        </Paragraph>
        <Paragraph>
          <WeightSettingWrapper>
            <WeightSetting
              weight={answerBeingEdited.weight}
              onWeightChange={AnswerPageStore.onWeightChange}
            />
          </WeightSettingWrapper>
          {Arr.map(dc.weight.description, (d, i) => (
            <Description key={i} text={d} />
          ))}
        </Paragraph>

        <Paragraph>
          {fireAuthUser === undefined ? (
            <>
              <ParagraphWithSwitch
                description={dc.protected.description.disabled}
                elementToToggle={undefined}
                hideContentIfToggleIsFalse={false}
                title={dc.protected.title}
                toggleState={false}
                onToggle={forNonLoggedInUserDialogState.setTrue}
              />
              <ForNonLoggedInUserDialog
                cancel={forNonLoggedInUserDialogState.setFalse}
                isOpen={forNonLoggedInUserDialogState.state}
              />
            </>
          ) : (
            <ParagraphWithSwitch
              description={
                dc.protected.description[
                  answerBeingEdited.user.id === null ? 'disabled' : 'enabled'
                ]
              }
              elementToToggle={undefined}
              hideContentIfToggleIsFalse={false}
              title={dc.protected.title}
              toggleState={answerBeingEdited.user.id !== null}
              onToggle={AnswerPageStore.toggleProtectedSection}
            />
          )}
        </Paragraph>

        <ButtonsWrapperAlignEnd data-cy={'buttons'}>
          <ButtonNowrapStyled
            disabled={submitButtonIsLoading}
            intent='none'
            text={dict.common.buttonText.cancel}
            onClick={AnswerPageStore.onCancelEditingAnswer}
          />
          {answerBeingEditedSectionState === 'editing' ? (
            <DeleteAnswerButton
              loading={submitButtonIsLoading}
              onConfirmDeleteAnswer={AnswerPageStore.onDeleteAnswerClick}
            />
          ) : undefined}
          <SubmitAnswerButtonWithConfirmation
            disabled={submitButtonIsDisabled}
            hasUnanswered={hasUnanswered}
            loading={submitButtonIsLoading}
            mode={answerBeingEditedSectionState}
          />
        </ButtonsWrapperAlignEnd>
      </>
    );
  }
);

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 15px;
`;

const Table = styled(HTMLTableBorderedStyled2)`
  th,
  td {
    padding: 6px;
  }
`;

const TdWithMaxWidth = styled.td`
  min-width: 87px;
  max-width: 87px;
`;

const TextArea = styled(BpTextArea)`
  resize: vertical;
  min-height: 38px;
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
