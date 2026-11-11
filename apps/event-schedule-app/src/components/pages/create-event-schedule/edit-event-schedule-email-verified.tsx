import { derive, map } from 'synstate';
import {
  constant,
  createAfterUpdate,
  deriveBindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { dict } from '../../../constants/index.mjs';
import {
  EditEventScheduleStore,
  eventSchedule$,
} from '../../../store/index.mjs';
import {
  BackToAnswerPageButton,
  EventScheduleDiff,
  ResetEditButton,
  SubmitEditingEventButton,
} from '../../organisms/index.mjs';
import { ButtonsWrapperForEventSettingsPage } from '../../styled/index.mjs';
import * as styles from './edit-event-schedule.module.css';
import { EventScheduleSettingCommon } from './event-schedule-setting-common.js';

const dc = dict.eventSettingsPage;

/** The edit form, once the event is read and the author's email confirmed. */
export const EditEventScheduleEmailVerified = (): JSX.Element => {
  const { commonState$, hasNoChanges$, isLoading$, emailVerified$ } =
    EditEventScheduleStore;

  const resetState = (): void => {
    const eventSchedule = Optional.unwrap(eventSchedule$.getSnapshot());

    if (eventSchedule !== undefined) {
      EditEventScheduleStore.setEventSchedule(
        eventSchedule,
        Optional.unwrap(emailVerified$.getSnapshot()),
      );
    }
  };

  // The form starts from the event as it is stored, and again whenever that is
  // read anew or the confirmed email changes.
  const afterUpdate = createAfterUpdate();

  derive([eventSchedule$, emailVerified$], (...values) => values).subscribe(
    () => {
      afterUpdate(resetState);
    },
  );

  return (
    <>
      <div class={constant(styles.subTitle)}>
        {eventSchedule$.pipe(map((e) => dc.editSubTitle(e?.title ?? '')))}
      </div>

      <EventScheduleSettingCommon
        handlers={EditEventScheduleStore.commonStateHandlers}
        state$={commonState$}
      />

      <ButtonsWrapperForEventSettingsPage>
        <BackToAnswerPageButton
          disabled={isLoading$}
          hasNoChanges={hasNoChanges$}
          onConfirmClick={EditEventScheduleStore.onBackToAnswerPage}
        />
        <ResetEditButton
          disabled={deriveBindable(
            [isLoading$, hasNoChanges$],
            (loading, noChanges) => loading || noChanges,
          )}
          onConfirmClick={resetState}
        />
        <div data-e2e={constant('submit-button')}>
          <SubmitEditingEventButton
            disabled={deriveBindable(
              [commonState$, isLoading$, hasNoChanges$],
              (s, loading, noChanges) =>
                !s.eventScheduleValidationOk || loading || noChanges,
            )}
            loading={isLoading$}
            showConfirmationDialog={
              EditEventScheduleStore.hasDeletedDatetimeChanges$
            }
          />
        </div>
      </ButtonsWrapperForEventSettingsPage>
      <EventScheduleDiff diff={EditEventScheduleStore.diff$} />
    </>
  );
};
