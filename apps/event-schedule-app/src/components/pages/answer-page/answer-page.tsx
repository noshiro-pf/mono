import {
  Alert,
  Button,
  Icon,
  Spinner,
  Switch,
  TagInput,
} from 'blueprint-synstate';
import html2canvas from 'html2canvas';
import { map, scan, type InitializedObservable } from 'synstate';
import {
  For,
  If,
  constant,
  createAfterUpdate,
  deriveBindable,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional, castMutable, match } from 'ts-data-forge';
import { dict } from '../../../constants/index.mjs';
import { eventIsAfterDeadline } from '../../../functions/index.mjs';
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
} from '../../../store/index.mjs';
import {
  CustomIcon,
  Description,
  RequiredParticipantIcon,
} from '../../atoms/index.mjs';
import { CustomScrollbarWrapper, Section } from '../../molecules/index.mjs';
import { MultipleDatePicker } from '../../multiple-date-picker/index.mjs';
import {
  AnswerBeingEdited,
  AnswerLaterButtonWithConfirmation,
  AnswerPageEventInfo,
  AnswerTable,
  DetailedFilterCollapse,
  Header,
} from '../../organisms/index.mjs';
import {
  ButtonsWrapperAlignEnd,
  ButtonsWrapperNowrap,
  maxWidthModalClass,
} from '../../styled/index.mjs';
import { NotFoundPage } from '../not-found-page.js';
import * as styles from './answer-page.module.css';
import { AnswerPageError } from './error.js';

const dc = dict.answerPage;

export const AnswerPage = (): JSX.Element => {
  // fetch once on the first load, after the update that opened the page
  createAfterUpdate()(() => {
    EventScheduleStore.fetchEventSchedule();

    AnswersStore.fetchAnswers();

    AnswerFilterAndSortStore.restoreFromQueryParams();
  });

  const status$ = deriveBindable(
    [errorType$, Router.eventId$, eventSchedule$, answersFiltered$],
    (errorType, eventId, eventSchedule, answers): Status =>
      errorType?.type.type === 'not-found'
        ? 'not-found'
        : errorType !== undefined
          ? 'error'
          : eventId === undefined ||
              eventSchedule === undefined ||
              answers === undefined
            ? 'loading'
            : 'ok',
  );

  return (
    <For items={mapBindable(status$, (s) => [s])} key={(s) => s}>
      {(status$_) => {
        const status = Optional.unwrap(status$_.getSnapshot());

        return status === 'not-found' ? (
          <NotFoundPage />
        ) : (
          <div data-e2e={constant('answer-page')}>
            <Header title={dc.title} />
            {match(status, {
              error: (
                <For
                  items={mapBindable(errorType$, (e) =>
                    e === undefined ? [] : [e],
                  )}
                  key={(e) => e}
                >
                  {(errorType$_) => (
                    <AnswerPageError
                      errorType={Optional.unwrap(errorType$_.getSnapshot())}
                    />
                  )}
                </For>
              ),
              loading: <Spinner />,
              ok: <AnswerPageOkOnceRead />,
            })}
          </div>
        );
      }}
    </For>
  );
};

type Status = 'error' | 'loading' | 'not-found' | 'ok';

/** The last value that was not `undefined`, so a section being torn down keeps one. */
const definedOr = <A,>(
  source$: InitializedObservable<A | undefined>,
  initial: A,
): InitializedObservable<A> =>
  source$.pipe(scan((last: A, a: A | undefined) => a ?? last, initial));

const IconDescriptionRow = ({
  iconName,
  answerIcons,
}: Readonly<{
  iconName: AnswerIconId;
  answerIcons: Bindable<AnswerIconSettings>;
}>): JSX.Element => (
  <tr>
    <th>
      <div class={constant(styles.alignCenter)}>
        <CustomIcon iconName={iconName} />
      </div>
    </th>
    <td data-e2e={constant(`icon-description-row--${iconName}`)}>
      {mapBindable(answerIcons, (icons) => dc.point(icons[iconName].point))}
    </td>
    <td>{constant(dict.common.colon)}</td>
    <td>{mapBindable(answerIcons, (icons) => icons[iconName].description)}</td>
  </tr>
);

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

const AnswerPageOk = ({
  eventSchedule$: eventScheduleDefined$,
  answers$,
}: Readonly<{
  eventSchedule$: InitializedObservable<EventSchedule>;
  answers$: InitializedObservable<readonly Answer[]>;
}>): JSX.Element => {
  const afterDeadline$ = eventScheduleDefined$.pipe(map(eventIsAfterDeadline));

  const sectionState$ = AnswerPageStore.answerBeingEditedSectionState$;

  const loggedIn$ = Auth.fireAuthUser$.pipe(map((u) => u?.uid !== undefined));

  // 「後で回答」ボタンを表示するかどうか。
  // ログイン済み & 回答済みの場合のみ非表示、それ以外の場合は表示。
  const showAnswerLaterButton$ = deriveBindable(
    [afterDeadline$, Auth.fireAuthUser$, answers$],
    (afterDeadline, fireAuthUser, answers) =>
      !afterDeadline &&
      (fireAuthUser?.uid === undefined ||
        answers.every((ans) => ans.user.id !== fireAuthUser.uid)),
  );

  const mut_elements: {
    answerSection: HTMLDivElement | undefined;
    screenShotArea: HTMLDivElement | undefined;
    tableWrapper: HTMLDivElement | undefined;
  } = {
    answerSection: undefined,
    screenShotArea: undefined,
    tableWrapper: undefined,
  };

  const afterUpdate = createAfterUpdate();

  sectionState$.subscribe((state) => {
    switch (state) {
      case 'creating':
      case 'editing':
        // Once the section has been drawn.
        afterUpdate(() => {
          mut_elements.answerSection?.scrollIntoView();
        });

        break;

      case 'hidden':
        break;
    }
  });

  const saveScreenShot = (): void => {
    const el = mut_elements.screenShotArea;

    if (el !== undefined) {
      html2canvas(el, {
        width: Math.max(
          el.scrollWidth,
          mut_elements.tableWrapper?.scrollWidth ?? 0,
        ),
        height: Math.max(
          el.scrollHeight,
          mut_elements.tableWrapper?.scrollHeight ?? 0,
        ),
      })
        .then(saveAsImage)
        .catch(console.error);
    }
  };

  const answerIcons$ = eventScheduleDefined$.pipe(map((e) => e.answerIcons));

  return (
    <div class={constant(styles.page)}>
      <div class={constant(styles.answerLaterWrapper)}>
        <If
          cond={showAnswerLaterButton$}
          then={
            <AnswerLaterButtonWithConfirmation
              loading={AnswerPageStore.submitButtonIsLoading$}
              loggedIn={loggedIn$}
            />
          }
        />
      </div>
      <Section sectionTitle={dc.eventInfo.title}>
        <AnswerPageEventInfo eventSchedule={eventScheduleDefined$} />
        <ButtonsWrapperAlignEnd>
          <Button
            data-e2e={constant('edit-event-settings')}
            icon={'cog'}
            intent={'none'}
            text={constant(dc.eventInfo.editButton)}
            onClick={AnswerPageStore.onEditButtonClick}
          />
        </ButtonsWrapperAlignEnd>
      </Section>
      <Section
        // Derived here, as the page's other bindings are: the scope the page is
        // mounted in disposes what its render derives when it is left.
        class={AnswerTableStore.tableIsFullWidth$.pipe(
          map((full) => (full ? styles.fullWidth : '')),
        )}
        sectionTitle={dc.answers.title}
      >
        <div class={constant(styles.calendarWrapper)}>
          <MultipleDatePicker
            holidaysJpDefinition={holidaysJpDefinition$}
            selectedDates={AnswerPageStore.selectedDates$}
            setYearMonth$={AnswerPageStore.setYearMonth$}
            useOutlinedSelectedStyle
          />
        </div>

        <div class={constant(styles.buttonsPadChanged)}>
          <ButtonsWrapperNowrap>
            <If
              cond={mapBindable(afterDeadline$, (after) => !after)}
              then={
                <Button
                  data-e2e={constant('refresh-answers')}
                  disabled={AnswersStore.refreshButtonIsDisabled$}
                  icon={'refresh'}
                  intent={'none'}
                  loading={AnswersStore.refreshButtonIsLoading$}
                  text={constant(dc.answers.refresh)}
                  onClick={AnswersStore.refreshAnswers}
                />
              }
            />
            <Button
              icon={'camera'}
              intent={'none'}
              text={constant(dc.answers.saveScreenShot)}
              onClick={saveScreenShot}
            />
            {/*
              Hidden through a wrapper rather than a class on the button:
              Blueprint's `.bp6-button` sets `display` with a selector as
              specific, so which one wins would rest on style sheet order.
            */}
            <div class={constant(styles.fullWidthToggle)}>
              <Button
                // No `aria-pressed`: the label says what a press does and
                // changes with the state, which a pressed state would
                // contradict.
                data-e2e={constant('toggle-table-full-width')}
                icon={AnswerTableStore.tableIsFullWidth$.pipe(
                  map((full) => (full ? 'minimize' : 'maximize')),
                )}
                intent={'none'}
                text={AnswerTableStore.tableIsFullWidth$.pipe(
                  map((full) =>
                    full
                      ? dc.answers.tableFullWidth.shrink
                      : dc.answers.tableFullWidth.expand,
                  ),
                )}
                onClick={AnswerTableStore.toggleTableIsFullWidth}
              />
            </div>
          </ButtonsWrapperNowrap>
        </div>

        <div class={constant(styles.flex)}>
          <div
            ref={(el) => {
              mut_elements.screenShotArea = el;
            }}
            class={constant(styles.screenShotArea)}
          >
            <CustomScrollbarWrapper class={styles.tableTopWrapper}>
              <div
                class={constant(styles.tagInputWrapper)}
                data-e2e={constant('filter-tags')}
              >
                <TagInput
                  addOnBlur={false}
                  addOnPaste={false}
                  leftIcon={'filter-list'}
                  rightElement={
                    <Button
                      icon={'cross'}
                      variant={constant('minimal')}
                      onClick={AnswerFilterAndSortStore.clearTags}
                    />
                  }
                  values={AnswerFilterAndSortStore.tagValues$}
                />

                <div class={constant(styles.filterButtonsWrapper)}>
                  <Button
                    intent={'primary'}
                    size={'small'}
                    text={constant(
                      dc.answers.displayOnlyCandidateDatesOfRank1to3,
                    )}
                    onClick={
                      AnswerFilterAndSortStore.displayOnlyCandidateDatesOfRank1to3
                    }
                  />
                  <Button
                    intent={'primary'}
                    size={'small'}
                    text={constant(
                      dc.answers.displayOnlyCandidateDatesWithZeroPoorIcon,
                    )}
                    onClick={
                      AnswerFilterAndSortStore.displayOnlyCandidateDatesWithZeroPoorIcon
                    }
                  />
                </div>
              </div>

              <button
                aria-expanded={AnswerTableStore.detailedFilterIsOpen$.pipe(
                  map((open) => (open ? 'true' : 'false')),
                )}
                class={constant(styles.toggleDetailedFilterSettingsLabel)}
                data-e2e={constant('toggle-detailed-filter')}
                type={constant('button')}
                onClick={AnswerTableStore.toggleDetailedFilter}
              >
                <div
                  class={constant(styles.toggleDetailedFilterSettingsButton)}
                >
                  <Icon
                    class={styles.toggleDetailedFilterSettingsIcon}
                    icon={'plus'}
                    style={AnswerTableStore.detailedFilterIsOpen$.pipe(
                      map((open) => (open ? 'transform: rotate(135deg);' : '')),
                    )}
                  />
                </div>
                <span>{constant(dc.answers.detailedFilterSettingsButton)}</span>
              </button>

              <DetailedFilterCollapse
                isOpen={AnswerTableStore.detailedFilterIsOpen$}
              />
            </CustomScrollbarWrapper>

            <div class={constant(styles.togglesWrapper)}>
              <div>
                <Switch
                  checked={AnswerTableStore.dateStringIsMinimized$}
                  class={styles.switchWithoutMargin}
                  label={constant(dc.answers.toggleDateStringIsMinimized)}
                  onChange={() => {
                    AnswerTableStore.toggleDateStringIsMinimized();
                  }}
                />
              </div>
              <div>
                <Switch
                  checked={AnswerTableStore.answerIconIsHidden$}
                  class={styles.switchWithoutMargin}
                  label={constant(dc.answers.toggleAnswerIconIsHidden)}
                  onChange={() => {
                    AnswerTableStore.toggleAnswerIconIsHidden();
                  }}
                />
              </div>
              <div>
                <Switch
                  checked={AnswerTableStore.tableIsMinimized$}
                  class={styles.switchWithoutMargin}
                  label={constant(dc.answers.toggleMinimizedTable)}
                  onChange={() => {
                    AnswerTableStore.toggleTableIsMinimized();
                  }}
                />
              </div>
            </div>

            <CustomScrollbarWrapper
              ref={(el) => {
                mut_elements.tableWrapper = el;
              }}
              class={styles.tableWrapper}
            >
              <AnswerTable
                answers={answers$}
                datetimeSpecification={eventScheduleDefined$.pipe(
                  map((e) => e.datetimeSpecification),
                )}
                editAnswerButtonIsDisabled={deriveBindable(
                  [sectionState$, afterDeadline$],
                  (state, afterDeadline) => state !== 'hidden' || afterDeadline,
                )}
                holidaysJpDefinition={holidaysJpDefinition$}
              />

              <Alert
                canEscapeKeyCancel
                canOutsideClickCancel
                class={maxWidthModalClass}
                icon={'disable'}
                intent={'danger'}
                isOpen={AnswerPageStore.alertOnAnswerClickIsOpen$}
                onClose={AnswerPageStore.closeAlertOnAnswerClick}
                onConfirm={AnswerPageStore.closeAlertOnAnswerClick}
              >
                <p>{constant(dc.protectedAnswerIsNotEditable)}</p>
              </Alert>
            </CustomScrollbarWrapper>
          </div>
        </div>

        <div class={constant(styles.iconDescriptionWrapper)}>
          <If
            cond={AnswerPageStore.requiredParticipantsExist$}
            then={
              <div class={constant(styles.requiredParticipantIconWrapper)}>
                <div class={constant(styles.alignCenter)}>
                  <RequiredParticipantIcon />
                  {constant(dict.common.colon)}
                </div>
                {constant(dc.answers.requiredParticipant)}
                {constant(dc.requiredParticipantDescription)}
              </div>
            }
          />
          <table>
            <tbody>
              <IconDescriptionRow
                answerIcons={answerIcons$}
                iconName={'good'}
              />
              <IconDescriptionRow
                answerIcons={answerIcons$}
                iconName={'fair'}
              />
              <IconDescriptionRow
                answerIcons={answerIcons$}
                iconName={'poor'}
              />
            </tbody>
          </table>
          <div class={constant(styles.noteForPointOfFair)}>
            <For
              items={mapBindable(answerIcons$, (icons) =>
                dc.noteForPointOfFair(icons.fair.point),
              )}
              key={(_, i) => i}
            >
              {(line$) => <Description text={line$} />}
            </For>
          </div>
        </div>
        <If
          cond={deriveBindable(
            [sectionState$, afterDeadline$],
            (state, afterDeadline) => state === 'hidden' && !afterDeadline,
          )}
          then={
            <ButtonsWrapperAlignEnd>
              <Button
                data-e2e={constant('add-answer-button')}
                icon={'add'}
                intent={'primary'}
                text={constant(dc.answers.addAnswer)}
                onClick={AnswerPageStore.onAddAnswerButtonClick}
              />
            </ButtonsWrapperAlignEnd>
          }
        />
      </Section>

      <div
        ref={(el) => {
          mut_elements.answerSection = el;
        }}
        data-e2e={constant('answer-being-edited-section')}
      >
        <For
          items={deriveBindable(
            [sectionState$, afterDeadline$],
            (state, afterDeadline) =>
              state === 'hidden' || afterDeadline ? [] : [state],
          )}
          key={(state) => state}
        >
          {(state$) => {
            const state = Optional.unwrap(state$.getSnapshot());

            return (
              <Section
                sectionTitle={match(state, {
                  creating: dc.answerBeingEdited.title.create,
                  editing: dc.answerBeingEdited.title.update,
                })}
                onCloseClick={AnswerPageStore.onCancelEditingAnswer}
              >
                <AnswerBeingEdited
                  answerBeingEdited={AnswerPageStore.answerBeingEdited$}
                  answerBeingEditedSectionState={state}
                  eventSchedule={eventScheduleDefined$}
                  holidaysJpDefinition={holidaysJpDefinition$}
                  submitButtonIsDisabled={
                    AnswerPageStore.submitButtonIsDisabled$
                  }
                  submitButtonIsLoading={AnswerPageStore.submitButtonIsLoading$}
                />
              </Section>
            );
          }}
        </For>
      </div>
    </div>
  );
};

/** `ok` is drawn once the event and its answers have been read. */
const AnswerPageOkOnceRead = (): JSX.Element => {
  const eventSchedule = Optional.unwrap(eventSchedule$.getSnapshot());

  const answers = Optional.unwrap(answersFiltered$.getSnapshot());

  return eventSchedule === undefined || answers === undefined ? (
    <Spinner />
  ) : (
    <AnswerPageOk
      answers$={definedOr(answersFiltered$, answers)}
      eventSchedule$={definedOr(eventSchedule$, eventSchedule)}
    />
  );
};
