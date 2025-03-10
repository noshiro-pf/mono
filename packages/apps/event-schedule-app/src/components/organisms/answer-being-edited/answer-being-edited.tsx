import { FormGroup } from '@blueprintjs/core';
import {
  BpInput,
  BpTextArea,
  ButtonNowrapStyled,
  CheckboxView,
  HTMLTableBorderedStyled2,
} from '@noshiro/react-blueprintjs-utils';
import { theNameIsAlreadyUsedFn } from '../../../functions';
import { useFormError } from '../../../hooks';
import { AnswerPageStore, Auth } from '../../../store';
import { Description } from '../../atoms';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
  CustomIconButton,
  CustomScrollbarWrapper,
} from '../../molecules';
import {
  ButtonsWrapperAlignEnd,
  WidthRestrictedInputWrapper,
} from '../../styled';
import { DatetimeRangeCell } from '../answer-table';
import { BatchInputAnswerForm } from '../batch-input-field';
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
        AnswerPageStore.onUserNameChange,
      );

    const theNameIsAlreadyUsed = useObservableValue(
      AnswerPageStore.theNameIsAlreadyUsed$,
    );

    const iconHeader = useObservableValue(AnswerPageStore.iconHeader$);

    const answerBeingEditedList = useObservableValue(
      AnswerPageStore.answerBeingEditedList$,
    );

    const hasUnanswered = useObservableValue(AnswerPageStore.hasUnanswered$);

    const fireAuthUser = Auth.useFireAuthUser();

    const forNonLoggedInUserDialogState = useBoolState(false);

    const batchInputFieldIsOpen = AnswerPageStore.useBatchInputFieldIsOpen();

    const checkboxesState = AnswerPageStore.useCheckboxesState();

    const helperText = useMemo(
      () =>
        showUserNameError ? (
          theNameIsAlreadyUsed ? (
            dc.theNameIsAlreadyUsed
          ) : (
            dc.nameIsRequired
          )
        ) : (
          <div
            css={css`
              height: 1rem;
            `}
          />
        ),
      [showUserNameError, theNameIsAlreadyUsed],
    );

    return (
      <>
        <WidthRestrictedInputWrapper>
          <FormGroup
            helperText={helperText}
            intent={showUserNameError ? 'danger' : 'primary'}
            label={dc.yourName}
          >
            <BpInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              data-e2e={'username'}
              intent={showUserNameError ? 'danger' : 'primary'}
              value={answerBeingEdited.user.name}
              onBlur={onUserNameBlur}
              onValueChange={
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                onUserNameChangeLocal as (v: string) => void
              }
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <TableWrapper>
          <HTMLTableBorderedStyled2
            css={css`
              th,
              td {
                padding: 6px;
              }
            `}
          >
            <thead>
              {mapOptional(iconHeader, (a) => (
                <tr>
                  {batchInputFieldIsOpen ? (
                    <th>
                      <CheckboxView
                        state={
                          checkboxesState.size === answerBeingEditedList.length
                            ? 'checked'
                            : checkboxesState.size === 0
                              ? 'none'
                              : 'indeterminate'
                        }
                        onCheck={AnswerPageStore.onCheckAll}
                      />
                    </th>
                  ) : undefined}
                  <th />
                  <th>
                    <CustomIconButton
                      data-e2e={'col-good-button'}
                      iconName={'good'}
                      title={a.good.iconDescription}
                      onClick={a.good.onClick}
                    />
                  </th>
                  <th>
                    <CustomIconButton
                      data-e2e={'col-fair-button'}
                      iconName={'fair'}
                      title={a.fair.iconDescription}
                      onClick={a.fair.onClick}
                    />
                  </th>
                  <th>
                    <CustomIconButton
                      data-e2e={'col-poor-button'}
                      iconName={'poor'}
                      title={a.poor.iconDescription}
                      onClick={a.poor.onClick}
                    />
                  </th>
                  <th>{dc.table.header.score}</th>
                  <th>{dc.table.header.comment}</th>
                </tr>
              ))}
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
                  onCheck,
                }) => (
                  <tr key={key}>
                    {batchInputFieldIsOpen ? (
                      <td>
                        <CheckboxView
                          state={
                            checkboxesState.has(datetimeRange)
                              ? 'checked'
                              : 'none'
                          }
                          onCheck={onCheck}
                        />
                      </td>
                    ) : undefined}
                    <td>
                      <DatetimeRangeCell
                        datetimeRange={datetimeRange}
                        datetimeSpecification={
                          eventSchedule.datetimeSpecification
                        }
                        holidaysJpDefinition={holidaysJpDefinition}
                        minimized={false}
                      />
                    </td>
                    <td>
                      <CustomIconButton
                        active={iconId === 'good'}
                        iconColor={iconId === 'good' ? 'blue' : 'gray'}
                        iconName={'good'}
                        title={buttons.good.description}
                        onClick={buttons.good.onClick}
                      />
                    </td>
                    <td>
                      <CustomIconButton
                        active={iconId === 'fair'}
                        iconColor={iconId === 'fair' ? 'blue' : 'gray'}
                        iconName={'fair'}
                        title={buttons.fair.description}
                        onClick={buttons.fair.onClick}
                      />
                    </td>
                    <td>
                      <CustomIconButton
                        active={iconId === 'poor'}
                        iconColor={iconId === 'poor' ? 'blue' : 'gray'}
                        iconName={'poor'}
                        title={buttons.poor.description}
                        onClick={buttons.poor.onClick}
                      />
                    </td>
                    <td
                      css={css`
                        min-width: 87px;
                        max-width: 87px;
                      `}
                    >
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
                    </td>
                    <td>
                      <BpTextArea
                        css={css`
                          resize: vertical;
                          min-height: 38px;
                        `}
                        rows={1}
                        value={comment}
                        onValueChange={onCellCommentChange}
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </HTMLTableBorderedStyled2>
          <BatchInputAnswerForm
            answerIcons={eventSchedule.answerIcons}
            applyBatchInput={AnswerPageStore.applyBatchInput}
            isOpen={batchInputFieldIsOpen}
            toggleOpen={AnswerPageStore.toggleBatchInputField}
          />
        </TableWrapper>
        <WidthRestrictedInputWrapper>
          <FormGroup label={dc.comments}>
            <BpTextArea
              autoResize={true}
              fill={true}
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
          <div
            css={css`
              margin-bottom: 5px;
            `}
          >
            <WeightSetting
              weight={answerBeingEdited.weight}
              onWeightChange={AnswerPageStore.onWeightChange}
            />
          </div>
          {dc.weight.description.map((d, i) => (
            // eslint-disable-next-line react/no-array-index-key
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
                onToggle={forNonLoggedInUserDialogState[1].setTrue}
              />
              <ForNonLoggedInUserDialog
                cancel={forNonLoggedInUserDialogState[1].setFalse}
                isOpen={forNonLoggedInUserDialogState[0]}
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

        <ButtonsWrapperAlignEnd data-e2e={'buttons'}>
          <ButtonNowrapStyled
            disabled={submitButtonIsLoading}
            intent={'none'}
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
  },
);

const Paragraph = styled.div`
  margin: 20px 0;
`;

const TableWrapper = styled(CustomScrollbarWrapper)`
  margin-bottom: 15px;
`;
