import { Button, FormGroup, InputGroup, TextArea } from 'blueprint-synstate';
import { createBooleanState, map, type InitializedObservable } from 'synstate';
import {
  constant,
  derive,
  For,
  If,
  mapBindable,
  view,
  type Bindable,
  type BindableValue,
  type JSX,
} from 'synstate-dom';
import type { IMapMapped } from 'ts-data-forge';
import { dict } from '../../../constants/index.mjs';
import { createFormError } from '../../../hooks/index.mjs';
import { AnswerPageStore, Auth } from '../../../store/index.mjs';
import { Description } from '../../atoms/index.mjs';
import {
  AnswerIconPointCell,
  CheckboxView,
  CustomIconButton,
  CustomScrollbarWrapper,
} from '../../molecules/index.mjs';
import {
  answerCommentCellClass,
  answerInputTableClass,
  answerPointCellClass,
  borderedTableClass,
  ButtonsWrapperAlignEnd,
  nowrapClass,
  WidthRestrictedInputWrapper,
} from '../../styled/index.mjs';
import { DatetimeRangeCell } from '../answer-table/index.mjs';
import { BatchInputAnswerForm } from '../batch-input-field.js';
import {
  DeleteAnswerButton,
  ForNonLoggedInUserDialog,
  SubmitAnswerButtonWithConfirmation,
} from '../button-with-confirm/index.mjs';
import { ParagraphWithSwitch } from '../paragraph-with-switch.js';
import * as styles from './answer-being-edited.module.css';
import { WeightSetting } from './weight-setting.js';

const dc = dict.answerPage.answerBeingEdited;

type Props = Readonly<{
  eventSchedule: InitializedObservable<EventSchedule>;
  answerBeingEdited: InitializedObservable<Answer>;
  /** Fixed while the section is drawn: the page draws it again for another. */
  answerBeingEditedSectionState: 'creating' | 'editing';
  submitButtonIsLoading: Bindable<boolean>;
  submitButtonIsDisabled: Bindable<boolean>;
  holidaysJpDefinition: InitializedObservable<
    IMapMapped<YearMonthDate, string, YmdKey>
  >;
}>;

export const AnswerBeingEdited = ({
  eventSchedule,
  answerBeingEdited,
  answerBeingEditedSectionState,
  submitButtonIsLoading,
  submitButtonIsDisabled,
  holidaysJpDefinition,
}: Props): JSX.Element => {
  // The store's rule, as the submit button's: every answer, filtered out or
  // not, and again as the answers are read again.
  const [showUserNameError$, touchUserName] = createFormError(
    AnswerPageStore.userNameIsInvalid$,
  );

  const [
    forNonLoggedInUserDialogIsOpen$,
    {
      setTrue: openForNonLoggedInUserDialog,
      setFalse: closeForNonLoggedInUserDialog,
    },
  ] = createBooleanState(false);

  const intent = view(showUserNameError$, (e) =>
    e ? ('danger' as const) : ('primary' as const),
  );

  const datetimeSpecification = view(
    eventSchedule,
    (e) => e.datetimeSpecification,
  );

  const {
    batchInputFieldIsOpen$,
    checkboxesState$,
    answerBeingEditedList$,
    iconHeader$,
  } = AnswerPageStore;

  return (
    <>
      <WidthRestrictedInputWrapper>
        <FormGroup
          helperText={derive(
            [showUserNameError$, AnswerPageStore.theNameIsAlreadyUsed$],
            (shown, used) =>
              shown
                ? used
                  ? dc.theNameIsAlreadyUsed
                  : dc.nameIsRequired
                : undefined,
          )}
          intent={intent}
          label={constant(dc.yourName)}
        >
          <InputGroup
            autoFocus
            data-e2e={constant('username')}
            intent={intent}
            value={view(answerBeingEdited, (a) => a.user.name)}
            onBlur={touchUserName}
            onInput={({ currentTarget }) => {
              AnswerPageStore.onUserNameChange(
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                currentTarget.value as UserName,
              );

              touchUserName();
            }}
          />
          {/* Room for the message, so that the form does not move with it. */}
          <If
            cond={mapBindable(showUserNameError$, (c) => !c)}
            then={
              <div class={constant('bp6-form-helper-text')}>
                <div class={constant(styles.helperSpacer)} />
              </div>
            }
          />
        </FormGroup>
      </WidthRestrictedInputWrapper>
      <CustomScrollbarWrapper class={styles.tableWrapper}>
        <table
          class={constant(`${borderedTableClass} ${answerInputTableClass}`)}
        >
          <thead>
            <For
              items={view(iconHeader$, (h) => (h === undefined ? [] : [h]))}
              key={() => 0}
            >
              {(header$) => (
                <tr>
                  <If
                    cond={batchInputFieldIsOpen$}
                    then={
                      <th>
                        <CheckboxView
                          state={derive(
                            [checkboxesState$, answerBeingEditedList$],
                            (checked, list) =>
                              checked.size === list.length
                                ? 'checked'
                                : checked.size === 0
                                  ? 'none'
                                  : 'indeterminate',
                          )}
                          onCheck={AnswerPageStore.onCheckAll}
                        />
                      </th>
                    }
                  />
                  <th />
                  {(['good', 'fair', 'poor'] as const).map((iconId) => (
                    <th>
                      <CustomIconButton
                        data-e2e={`col-${iconId}-button`}
                        iconName={iconId}
                        title={view(header$, (h) => h[iconId].iconDescription)}
                        onClick={() => {
                          header$.getSnapshot().value[iconId].onClick();
                        }}
                      />
                    </th>
                  ))}
                  <th>{constant(dc.table.header.score)}</th>
                  <th>{constant(dc.table.header.comment)}</th>
                </tr>
              )}
            </For>
          </thead>
          <tbody>
            <For items={answerBeingEditedList$} key={(row) => row.key}>
              {(row$) => {
                const row = (): BindableValue<typeof row$> =>
                  row$.getSnapshot().value;

                const iconId = view(row$, (r) => r.answerSelectionValue.iconId);

                return (
                  <tr data-e2e={constant('answer-being-edited-row')}>
                    <If
                      cond={batchInputFieldIsOpen$}
                      then={
                        <td>
                          <CheckboxView
                            state={derive(
                              [checkboxesState$, row$],
                              (checked, r) =>
                                checked.has(r.datetimeRange)
                                  ? 'checked'
                                  : 'none',
                            )}
                            onCheck={(checked) => {
                              row().onCheck(checked);
                            }}
                          />
                        </td>
                      }
                    />
                    <td>
                      <DatetimeRangeCell
                        datetimeRange={row().datetimeRange}
                        datetimeSpecification={datetimeSpecification}
                        holidaysJpDefinition={holidaysJpDefinition}
                        minimized={constant(false)}
                      />
                    </td>
                    {(['good', 'fair', 'poor'] as const).map((id) => (
                      <td>
                        <CustomIconButton
                          active={mapBindable(iconId, (i) => i === id)}
                          data-e2e={id === 'good' ? 'good-button' : undefined}
                          iconColor={mapBindable(iconId, (i) =>
                            i === id ? 'blue' : 'gray',
                          )}
                          iconName={id}
                          title={view(row$, (r) => r.buttons[id].description)}
                          onClick={() => {
                            row().buttons[id].onClick();
                          }}
                        />
                      </td>
                    ))}
                    <td class={constant(answerPointCellClass)}>
                      <AnswerIconPointCell
                        iconId={iconId}
                        point={view(row$, (r) => r.answerSelectionValue.point)}
                        onPointChange={(point) => {
                          row().onPointChange(point);
                        }}
                      />
                    </td>
                    <td>
                      <TextArea
                        class={answerCommentCellClass}
                        rows={1}
                        value={view(
                          row$,
                          (r) => r.answerSelectionValue.comment,
                        )}
                        onInput={({ currentTarget }) => {
                          row().onCommentChange(currentTarget.value);
                        }}
                      />
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
        <BatchInputAnswerForm
          answerIcons={eventSchedule.pipe(mapAnswerIcons)}
          applyBatchInput={AnswerPageStore.applyBatchInput}
          isOpen={batchInputFieldIsOpen$}
          toggleOpen={AnswerPageStore.toggleBatchInputField}
        />
      </CustomScrollbarWrapper>
      <WidthRestrictedInputWrapper>
        <FormGroup label={constant(dc.comments)}>
          <TextArea
            autoResize
            fill
            value={view(answerBeingEdited, (a) => a.comment)}
            onInput={({ currentTarget }) => {
              AnswerPageStore.onCommentChange(currentTarget.value);
            }}
          />
        </FormGroup>
      </WidthRestrictedInputWrapper>
      <div class={constant(styles.paragraph)}>
        <ParagraphWithSwitch
          description={dc.required.description}
          elementToToggle={[]}
          title={dc.required.title}
          toggleState={view(answerBeingEdited, (a) => a.isRequiredParticipants)}
          onToggle={AnswerPageStore.toggleRequiredSection}
        />
      </div>
      <div class={constant(styles.paragraph)}>
        <div class={constant(styles.weightRow)}>
          <WeightSetting
            weight={view(answerBeingEdited, (a) => a.weight)}
            onWeightChange={AnswerPageStore.onWeightChange}
          />
        </div>
        {dc.weight.description.map((d) => (
          <Description text={constant(d)} />
        ))}
      </div>

      <div class={constant(styles.paragraph)}>
        <If
          cond={view(Auth.fireAuthUser$, (user) => user === undefined)}
          else={
            <ParagraphWithSwitch
              description={view(answerBeingEdited, (a) =>
                a.user.id === null
                  ? dc.protected.description.disabled
                  : dc.protected.description.enabled,
              )}
              elementToToggle={[]}
              title={dc.protected.title}
              toggleState={view(answerBeingEdited, (a) => a.user.id !== null)}
              onToggle={AnswerPageStore.toggleProtectedSection}
            />
          }
          then={
            <>
              <ParagraphWithSwitch
                description={dc.protected.description.disabled}
                elementToToggle={[]}
                title={dc.protected.title}
                toggleState={constant(false)}
                onToggle={openForNonLoggedInUserDialog}
              />
              <ForNonLoggedInUserDialog
                cancel={closeForNonLoggedInUserDialog}
                isOpen={forNonLoggedInUserDialogIsOpen$}
              />
            </>
          }
        />
      </div>

      <ButtonsWrapperAlignEnd data-e2e={'buttons'}>
        <Button
          class={nowrapClass}
          disabled={submitButtonIsLoading}
          intent={'none'}
          text={constant(dict.common.buttonText.cancel)}
          onClick={AnswerPageStore.onCancelEditingAnswer}
        />
        {answerBeingEditedSectionState === 'editing' ? (
          <DeleteAnswerButton
            loading={submitButtonIsLoading}
            onConfirmDeleteAnswer={AnswerPageStore.onDeleteAnswerClick}
          />
        ) : (
          []
        )}
        <SubmitAnswerButtonWithConfirmation
          disabled={submitButtonIsDisabled}
          hasUnanswered={AnswerPageStore.hasUnanswered$}
          loading={submitButtonIsLoading}
          mode={answerBeingEditedSectionState}
        />
      </ButtonsWrapperAlignEnd>
    </>
  );
};

const mapAnswerIcons = map((e: EventSchedule) => e.answerIcons);
