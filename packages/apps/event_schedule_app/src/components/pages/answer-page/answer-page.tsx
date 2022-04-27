import type { TagProps } from '@blueprintjs/core';
import { Button, Spinner, TagInput } from '@blueprintjs/core';
import { useRef } from 'react';
import { eventIsAfterDeadline } from '../../../functions';
import {
  alertOnAnswerClickIsOpen$,
  answerBeingEdited$,
  answerBeingEditedSectionState$,
  answers$,
  AnswersFetchState,
  AnswerTableFilteringAndSortingManager,
  closeAlertOnAnswerClick,
  errorType$,
  eventSchedule$,
  EventScheduleFetchState,
  holidaysJpDefinition$,
  onAddAnswerButtonClick,
  onCancelEditingAnswer,
  onEditButtonClick,
  requiredParticipantsExist$,
  router,
  selectedAnswerUserName$,
  selectedDates$,
  setYearMonth$,
  submitButtonIsDisabled$,
  submitButtonIsLoading$,
  useFireAuthUser,
} from '../../../store';
import { CustomIcon, Description, RequiredParticipantIcon } from '../../atoms';
import { AlertWithMaxWidth } from '../../bp';
import { Section } from '../../molecules';
import { MultipleDatePicker } from '../../multiple-date-picker';
import {
  AnswerBeingEdited,
  AnswerLaterButtonWithConfirmation,
  AnswerPageEventInfo,
  AnswerTable,
  Header,
} from '../../organisms';
import { ButtonsWrapperAlignEnd, SingleButtonWrapper } from '../../styled';
import { NotFoundPage } from '../not-found-page';
import { AnswerPageError } from './error';

const dc = dict.answerPage;

export const AnswerPage = memoNamed('AnswerPage', () => {
  /* values */

  const alertOnAnswerClickIsOpen = useObservableValue(
    alertOnAnswerClickIsOpen$
  );
  const answerBeingEdited = useObservableValue(answerBeingEdited$);
  const answerBeingEditedSectionState = useObservableValue(
    answerBeingEditedSectionState$
  );
  const answers = useObservableValue(answers$);
  const errorType = useObservableValue(errorType$);
  const eventId = useObservableValue(router.eventId$);
  const eventSchedule = useObservableValue(eventSchedule$);
  const refreshButtonIsDisabled = useObservableValue(
    AnswersFetchState.refreshButtonIsDisabled$
  );
  const refreshButtonIsLoading = useObservableValue(
    AnswersFetchState.refreshButtonIsLoading$
  );
  const requiredParticipantsExist = useObservableValue(
    requiredParticipantsExist$
  );
  const selectedAnswerUserName = useObservableValue(selectedAnswerUserName$);
  const selectedDates = useObservableValue(selectedDates$);
  const submitButtonIsDisabled = useObservableValue(submitButtonIsDisabled$);
  const submitButtonIsLoading = useObservableValue(submitButtonIsLoading$);

  const afterDeadline = useMemo(
    () => eventIsAfterDeadline(eventSchedule),
    [eventSchedule]
  );

  /* effect */

  // fetch once on the first load
  useEffect(() => {
    EventScheduleFetchState.fetchEventSchedule();
    AnswersFetchState.fetchAnswers();
    AnswerTableFilteringAndSortingManager.restoreAnswerTableFilteringStateFromQueryParams();
    AnswerTableFilteringAndSortingManager.initializeAnswerTableFilteringStateUpperLimit();
  }, []);

  const answerSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    switch (answerBeingEditedSectionState) {
      case 'creating':
      case 'editing':
        answerSectionRef.current?.scrollIntoView();
        break;
      case 'hidden':
        break;
    }
  }, [answerBeingEditedSectionState]);

  const holidaysJpDefinition = useObservableValue(holidaysJpDefinition$);

  const tagValues = useObservableValue(
    AnswerTableFilteringAndSortingManager.tagValues$
  );

  const tagProps = useObservableValue(
    AnswerTableFilteringAndSortingManager.tagProps$
  );

  const fireAuthUser = useFireAuthUser();

  const showAnswerLaterButton = useMemo<boolean>(
    () =>
      (fireAuthUser?.uid !== undefined &&
        answers?.every((ans) => ans.user.id !== fireAuthUser.uid)) ??
      false,
    [fireAuthUser, answers]
  );

  return errorType !== undefined && errorType.type.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div data-cy={'answer-page'}>
      <Header title={dc.title} />

      {errorType !== undefined ? (
        <AnswerPageError errorType={errorType} />
      ) : eventId === undefined ||
        eventSchedule === undefined ||
        answers === undefined ? (
        <Spinner />
      ) : (
        <>
          <AnswerLaterWrapper>
            {showAnswerLaterButton ? (
              <AnswerLaterButtonWithConfirmation
                disabled={false}
                loading={false}
              />
            ) : undefined}
          </AnswerLaterWrapper>
          <Section sectionTitle={dc.eventInfo.title}>
            <AnswerPageEventInfo eventSchedule={eventSchedule} />
            <ButtonsWrapperAlignEnd>
              <Button
                data-cy={'edit-event-settings'}
                icon={'cog'}
                intent={'none'}
                onClick={onEditButtonClick}
              >
                {dc.eventInfo.editButton}
              </Button>
            </ButtonsWrapperAlignEnd>
          </Section>
          <Section sectionTitle={dc.answers.title}>
            <CalendarWrapper>
              <MultipleDatePicker
                holidaysJpDefinition={holidaysJpDefinition}
                selectedDates={selectedDates}
                setYearMonth$={setYearMonth$}
                useOutlinedSelectedStyle={true}
              />
            </CalendarWrapper>

            {afterDeadline ? undefined : (
              <SingleButtonWrapper>
                <Button
                  disabled={refreshButtonIsDisabled}
                  icon={'refresh'}
                  intent={'none'}
                  loading={refreshButtonIsLoading}
                  onClick={AnswersFetchState.refreshAnswers}
                >
                  {dc.answers.refresh}
                </Button>
              </SingleButtonWrapper>
            )}

            {IList.isEmpty(tagValues) ? undefined : (
              <TableTopWrapper>
                <TagInput
                  addOnBlur={false}
                  addOnPaste={false}
                  leftIcon={'filter-list'}
                  rightElement={
                    <Button
                      icon={'cross'}
                      minimal={true}
                      onClick={AnswerTableFilteringAndSortingManager.clearTags}
                    />
                  }
                  tagProps={
                    tagProps as (
                      value: DeepReadonly<ReactNode>,
                      index: number
                    ) => TagProps
                  }
                  values={tagValues}
                />
              </TableTopWrapper>
            )}

            <TableWrapper>
              <AnswerTable
                answers={answers}
                datetimeSpecification={eventSchedule.datetimeSpecification}
                editAnswerButtonIsDisabled={
                  answerBeingEditedSectionState !== 'hidden' || afterDeadline
                }
              />

              <AlertWithMaxWidth
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                icon={'disable'}
                intent={'danger'}
                isOpen={alertOnAnswerClickIsOpen}
                onClose={closeAlertOnAnswerClick}
                onConfirm={closeAlertOnAnswerClick}
              >
                <p>{dc.protectedAnswerIsNotEditable}</p>
              </AlertWithMaxWidth>
            </TableWrapper>

            <IconDescriptionWrapper>
              {requiredParticipantsExist ? (
                <RequiredParticipantIconWrapper>
                  <AlignCenter>
                    <RequiredParticipantIcon />
                    {dict.common.colon}
                  </AlignCenter>
                  {dc.answers.requiredParticipant}
                  {dc.requiredParticipantDescription}
                </RequiredParticipantIconWrapper>
              ) : undefined}
              <table>
                <tbody>
                  <tr>
                    <th>
                      <AlignCenter>
                        <CustomIcon iconName={'good'} />
                      </AlignCenter>
                    </th>
                    <td>{dc.point(eventSchedule.answerIcons.good.point)}</td>
                    <td>{dict.common.colon}</td>
                    <td>{eventSchedule.answerIcons.good.description}</td>
                  </tr>
                  <tr>
                    <th>
                      <AlignCenter>
                        <CustomIcon iconName={'fair'} />
                      </AlignCenter>
                    </th>
                    <td>{dc.point(eventSchedule.answerIcons.fair.point)}</td>
                    <td>{dict.common.colon}</td>
                    <td>{eventSchedule.answerIcons.fair.description}</td>
                  </tr>
                  <tr>
                    <th>
                      <AlignCenter>
                        <CustomIcon iconName={'poor'} />
                      </AlignCenter>
                    </th>
                    <td>{dc.point(eventSchedule.answerIcons.poor.point)}</td>
                    <td>{dict.common.colon}</td>
                    <td>{eventSchedule.answerIcons.poor.description}</td>
                  </tr>
                </tbody>
              </table>
              <NoteForPointOfFair>
                {IList.map(
                  dc.noteForPointOfFair(eventSchedule.answerIcons.fair.point),
                  (s, i) => (
                    <Description key={i} text={s} />
                  )
                )}
              </NoteForPointOfFair>
            </IconDescriptionWrapper>

            {answerBeingEditedSectionState === 'hidden' && !afterDeadline ? (
              <ButtonsWrapperAlignEnd>
                <Button
                  data-cy={'add-answer-button'}
                  icon='add'
                  intent='primary'
                  text={dc.answers.addAnswer}
                  onClick={onAddAnswerButtonClick}
                />
              </ButtonsWrapperAlignEnd>
            ) : undefined}
          </Section>

          <div ref={answerSectionRef} data-cy={'answer-being-edited-section'}>
            {answerBeingEditedSectionState === 'hidden' ||
            afterDeadline ? undefined : (
              <Section
                sectionTitle={match(answerBeingEditedSectionState, {
                  creating: dc.answerBeingEdited.title.create,
                  editing: dc.answerBeingEdited.title.update,
                })}
                onCloseClick={onCancelEditingAnswer}
              >
                <AnswerBeingEdited
                  answerBeingEdited={answerBeingEdited}
                  answerBeingEditedSectionState={answerBeingEditedSectionState}
                  answers={answers}
                  eventSchedule={eventSchedule}
                  selectedAnswerUserName={selectedAnswerUserName}
                  submitButtonIsDisabled={submitButtonIsDisabled}
                  submitButtonIsLoading={submitButtonIsLoading}
                />
              </Section>
            )}
          </div>
        </>
      )}
    </div>
  );
});

const CalendarWrapper = styled.div`
  margin: 10px;
  display: flex;
`;

const TableTopWrapper = styled.div`
  margin: 5px;
  display: flex;
  align-items: center;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const IconDescriptionWrapper = styled.div`
  margin: 10px;
`;

const AlignCenter = styled.div`
  display: flex;
  align-items: center;
`;

const RequiredParticipantIconWrapper = styled(AlignCenter)`
  margin: 10px 3px;
`;

const NoteForPointOfFair = styled.div`
  margin: 10px 3px;
`;

const AnswerLaterWrapper = styled.div`
  margin: 20px;
`;
