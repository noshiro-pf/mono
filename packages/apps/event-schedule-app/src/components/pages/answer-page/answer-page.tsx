import {
  Button,
  Icon,
  Spinner,
  TagInput,
  type TagProps,
} from '@blueprintjs/core';
import { AlertWithMaxWidth, BpSwitch } from '@noshiro/react-blueprintjs-utils';
import html2canvas from 'html2canvas';
import { eventIsAfterDeadline } from '../../../functions';
import {
  AnswerFilterAndSortStore,
  AnswerPageStore,
  AnswerTableStore,
  AnswersStore,
  Auth,
  EventScheduleStore,
  Router,
  answersFiltered$,
  errorType$,
  eventSchedule$,
  holidaysJpDefinition$,
} from '../../../store';
import { toClassName } from '../../../utils';
import { CustomIcon, Description, RequiredParticipantIcon } from '../../atoms';
import { CustomScrollbarWrapper, Section } from '../../molecules';
import { MultipleDatePicker } from '../../multiple-date-picker';
import {
  AnswerBeingEdited,
  AnswerLaterButtonWithConfirmation,
  AnswerPageEventInfo,
  AnswerTable,
  DetailedFilterCollapse,
  Header,
} from '../../organisms';
import { ButtonsWrapperAlignEnd, ButtonsWrapperNowrap } from '../../styled';
import { NotFoundPage } from '../not-found-page';
import { AnswerPageError } from './error';

const dc = dict.answerPage;

const saveAsImage = (canvas: HTMLCanvasElement): void => {
  const targetImgUri: string = canvas.toDataURL('img/png');

  const downloadLink = document.createElement('a');

  if (typeof downloadLink.download === 'string') {
    const mut_downloadLink = castMutable(downloadLink);

    mut_downloadLink.href = targetImgUri;

    mut_downloadLink.download = 'answers.png';

    document.body.append(downloadLink);

    downloadLink.click();
  } else {
    window.open(targetImgUri);
  }

  downloadLink.remove();
};

export const AnswerPage = memoNamed('AnswerPage', () => {
  /* values */

  const alertOnAnswerClickIsOpen =
    AnswerPageStore.useAlertOnAnswerClickIsOpen();
  const answerBeingEdited = AnswerPageStore.useAnswerBeingEdited();
  const answerBeingEditedSectionState =
    AnswerPageStore.useAnswerBeingEditedSectionState();
  const answers = useObservableValue(answersFiltered$);
  const errorType = useObservableValue(errorType$);
  const eventId = useObservableValue(Router.eventId$);
  const eventSchedule = useObservableValue(eventSchedule$);
  const refreshButtonIsDisabled = AnswersStore.useRefreshButtonIsDisabled();
  const refreshButtonIsLoading = AnswersStore.useRefreshButtonIsLoading();
  const requiredParticipantsExist = useObservableValue(
    AnswerPageStore.requiredParticipantsExist$,
  );
  const selectedAnswerUserName = useObservableValue(
    AnswerPageStore.selectedAnswerUserName$,
  );
  const selectedDates = useObservableValue(AnswerPageStore.selectedDates$);
  const submitButtonIsDisabled = useObservableValue(
    AnswerPageStore.submitButtonIsDisabled$,
  );
  const submitButtonIsLoading = AnswerPageStore.useSubmitButtonIsLoading();

  const detailedFilterDialogIsDisplayed =
    AnswerTableStore.useDetailedFilterIsOpen();

  const afterDeadline = useMemo(
    () => eventIsAfterDeadline(eventSchedule),
    [eventSchedule],
  );

  /* effect */

  // fetch once on the first load
  useEffect(() => {
    EventScheduleStore.fetchEventSchedule();
    AnswersStore.fetchAnswers();
    AnswerFilterAndSortStore.restoreFromQueryParams();
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

  const tagValues = useObservableValue(AnswerFilterAndSortStore.tagValues$);

  const tagProps = useObservableValue(AnswerFilterAndSortStore.tagProps$);

  const fireAuthUser = Auth.useFireAuthUser();

  // 「後で回答」ボタンを表示するかどうか。
  // ログイン済み & 回答済みの場合のみ非表示、それ以外の場合は表示。
  const showAnswerLaterButton = useMemo<boolean>(
    () =>
      !afterDeadline &&
      !(
        fireAuthUser?.uid !== undefined &&
        answers?.some((ans) => ans.user.id === fireAuthUser.uid) === true
      ),
    [afterDeadline, fireAuthUser, answers],
  );

  const screenShotAreaRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const saveScreenShot = useCallback(() => {
    const el = screenShotAreaRef.current;

    if (el !== null) {
      html2canvas(el, {
        width: Math.max(
          el.scrollWidth,
          tableWrapperRef.current?.scrollWidth ?? 0,
        ),
        height: Math.max(
          el.scrollHeight,
          tableWrapperRef.current?.scrollHeight ?? 0,
        ),
      })
        .then(saveAsImage)
        .catch(console.error);
    }
  }, []);

  const dateStringIsMinimized = AnswerTableStore.useDateStringIsMinimized();

  const answerIconIsHidden = AnswerTableStore.useAnswerIconIsHidden();

  const tableIsMinimized = AnswerTableStore.useTableIsMinimized();

  return errorType !== undefined && errorType.type.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div data-e2e={'answer-page'}>
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
                loading={submitButtonIsLoading}
                loggedIn={fireAuthUser?.uid !== undefined}
              />
            ) : undefined}
          </AnswerLaterWrapper>
          <Section sectionTitle={dc.eventInfo.title}>
            <AnswerPageEventInfo eventSchedule={eventSchedule} />
            <ButtonsWrapperAlignEnd>
              <Button
                data-e2e={'edit-event-settings'}
                icon={'cog'}
                intent={'none'}
                onClick={AnswerPageStore.onEditButtonClick}
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
                setYearMonth$={AnswerPageStore.setYearMonth$}
                useOutlinedSelectedStyle={true}
              />
            </CalendarWrapper>

            <ButtonsWrapperNowrapPadChanged>
              {afterDeadline ? undefined : (
                <Button
                  data-e2e={'refresh-answers'}
                  disabled={refreshButtonIsDisabled}
                  icon={'refresh'}
                  intent={'none'}
                  loading={refreshButtonIsLoading}
                  onClick={AnswersStore.refreshAnswers}
                >
                  {dc.answers.refresh}
                </Button>
              )}
              <Button icon={'camera'} intent={'none'} onClick={saveScreenShot}>
                {dc.answers.saveScreenShot}
              </Button>
            </ButtonsWrapperNowrapPadChanged>

            <div
              css={css`
                display: flex;
              `}
            >
              <ScreenShotArea ref={screenShotAreaRef}>
                <TableTopWrapper>
                  <TagInputWrapper>
                    <TagInput
                      addOnBlur={false}
                      addOnPaste={false}
                      leftIcon={'filter-list'}
                      rightElement={clearTagsButton}
                      tagProps={
                        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                        tagProps as (
                          value: DeepReadonly<React.ReactNode>,
                          index: number,
                        ) => TagProps
                      }
                      values={tagValues}
                    />

                    <FilterButtonsWrapper>
                      <Button
                        intent={'primary'}
                        small={true}
                        onClick={
                          AnswerFilterAndSortStore.displayOnlyCandidateDatesOfRank1to3
                        }
                      >
                        {dc.answers.displayOnlyCandidateDatesOfRank1to3}
                      </Button>
                      <Button
                        intent={'primary'}
                        small={true}
                        onClick={
                          AnswerFilterAndSortStore.displayOnlyCandidateDatesWithZeroPoorIcon
                        }
                      >
                        {dc.answers.displayOnlyCandidateDatesWithZeroPoorIcon}
                      </Button>
                    </FilterButtonsWrapper>
                  </TagInputWrapper>

                  <ToggleDetailedFilterSettingsLabel
                    onClick={AnswerTableStore.toggleDetailedFilter}
                  >
                    <ToggleDetailedFilterSettingsButton>
                      <ToggleDetailedFilterSettingsIcon
                        // eslint-disable-next-line react/forbid-component-props
                        className={toClassName({
                          open: detailedFilterDialogIsDisplayed,
                        })}
                        icon={'plus'}
                      />
                    </ToggleDetailedFilterSettingsButton>
                    <span>{dc.answers.detailedFilterSettingsButton}</span>
                  </ToggleDetailedFilterSettingsLabel>

                  <DetailedFilterCollapse
                    isOpen={detailedFilterDialogIsDisplayed}
                  />
                </TableTopWrapper>

                <TogglesWrapper>
                  <div>
                    <BpSwitch
                      checked={dateStringIsMinimized}
                      label={
                        dict.answerPage.answers.toggleDateStringIsMinimized
                      }
                      noMargin={true}
                      onToggle={AnswerTableStore.toggleDateStringIsMinimized}
                    />
                  </div>
                  <div>
                    <BpSwitch
                      checked={answerIconIsHidden}
                      label={dict.answerPage.answers.toggleAnswerIconIsHidden}
                      noMargin={true}
                      onToggle={AnswerTableStore.toggleAnswerIconIsHidden}
                    />
                  </div>
                  <div>
                    <BpSwitch
                      checked={tableIsMinimized}
                      label={dict.answerPage.answers.toggleMinimizedTable}
                      noMargin={true}
                      onToggle={AnswerTableStore.toggleTableIsMinimized}
                    />
                  </div>
                </TogglesWrapper>

                <TableWrapper ref={tableWrapperRef}>
                  <AnswerTable
                    answers={answers}
                    datetimeSpecification={eventSchedule.datetimeSpecification}
                    editAnswerButtonIsDisabled={
                      answerBeingEditedSectionState !== 'hidden' ||
                      afterDeadline
                    }
                    holidaysJpDefinition={holidaysJpDefinition}
                  />

                  <AlertWithMaxWidth
                    canEscapeKeyCancel={true}
                    canOutsideClickCancel={true}
                    icon={'disable'}
                    intent={'danger'}
                    isOpen={alertOnAnswerClickIsOpen}
                    onClose={AnswerPageStore.closeAlertOnAnswerClick}
                    onConfirm={AnswerPageStore.closeAlertOnAnswerClick}
                  >
                    <p>{dc.protectedAnswerIsNotEditable}</p>
                  </AlertWithMaxWidth>
                </TableWrapper>
              </ScreenShotArea>
            </div>

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
                  <IconDescriptionRow
                    answerIcons={eventSchedule.answerIcons}
                    iconName={'good'}
                  />
                  <IconDescriptionRow
                    answerIcons={eventSchedule.answerIcons}
                    iconName={'fair'}
                  />
                  <IconDescriptionRow
                    answerIcons={eventSchedule.answerIcons}
                    iconName={'poor'}
                  />
                </tbody>
              </table>
              <NoteForPointOfFair>
                {dc
                  .noteForPointOfFair(eventSchedule.answerIcons.fair.point)
                  .map((s, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Description key={i} text={s} />
                  ))}
              </NoteForPointOfFair>
            </IconDescriptionWrapper>
            {answerBeingEditedSectionState === 'hidden' && !afterDeadline ? (
              <ButtonsWrapperAlignEnd>
                <Button
                  data-e2e={'add-answer-button'}
                  icon={'add'}
                  intent={'primary'}
                  text={dc.answers.addAnswer}
                  onClick={AnswerPageStore.onAddAnswerButtonClick}
                />
              </ButtonsWrapperAlignEnd>
            ) : undefined}
          </Section>

          <div ref={answerSectionRef} data-e2e={'answer-being-edited-section'}>
            {answerBeingEditedSectionState === 'hidden' ||
            afterDeadline ? undefined : (
              <Section
                sectionTitle={match(answerBeingEditedSectionState, {
                  creating: dc.answerBeingEdited.title.create,
                  editing: dc.answerBeingEdited.title.update,
                })}
                onCloseClick={AnswerPageStore.onCancelEditingAnswer}
              >
                <AnswerBeingEdited
                  answerBeingEdited={answerBeingEdited}
                  answerBeingEditedSectionState={answerBeingEditedSectionState}
                  answers={answers}
                  eventSchedule={eventSchedule}
                  holidaysJpDefinition={holidaysJpDefinition}
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

const IconDescriptionRow = memoNamed<
  Readonly<{
    iconName: AnswerIconId;
    answerIcons: AnswerIconSettings;
  }>
>('IconDescriptionRow', ({ iconName, answerIcons }) => (
  <tr>
    <th>
      <AlignCenter>
        <CustomIcon iconName={iconName} />
      </AlignCenter>
    </th>
    <td data-e2e={`icon-description-row--${iconName}`}>
      {dc.point(answerIcons[iconName].point)}
    </td>
    <td>{dict.common.colon}</td>
    <td>{answerIcons[iconName].description}</td>
  </tr>
));

const clearTagsButton = (
  <Button
    icon={'cross'}
    minimal={true}
    onClick={AnswerFilterAndSortStore.clearTags}
  />
);

const CalendarWrapper = styled.div`
  margin: 10px;
  display: flex;
`;

const ButtonsWrapperNowrapPadChanged = styled(ButtonsWrapperNowrap)`
  margin-left: 10px;
`;

const TableTopWrapper = styled(CustomScrollbarWrapper)`
  margin: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const TagInputWrapper = styled.div`
  margin-bottom: 5px;
  max-width: 500px;
`;

const FilterButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 5px;

  & > * {
    margin: 2px;
  }
`;

const TableWrapper = styled(CustomScrollbarWrapper)`
  margin: 5px;
`;

const TogglesWrapper = styled.div`
  margin: 5px;
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;

  & > * {
    margin-right: 20px;
    white-space: nowrap;
  }
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

const ScreenShotArea = styled.div`
  padding: 5px;
  max-width: 100%;
`;

const ToggleDetailedFilterSettingsLabel = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ToggleDetailedFilterSettingsButton = styled.div`
  margin: 5px;
`;

const ToggleDetailedFilterSettingsIcon = styled(Icon)`
  transition: all 0.3s ease;
  top: 0;
  left: 0;
  transform-origin: center;

  &.open {
    transform: rotate(135deg);
  }
`;
