import { Spinner } from '@blueprintjs/core';
import { eventScheduleResult$, router, useUser } from '../../../store';
import { Header } from '../../organisms';
import { NotFoundPage } from '../not-found-page';
import { EditEventScheduleOk } from './edit-event-schedule-main';
import { FetchEventScheduleError } from './error';

const dc = dict.eventSettingsPage;

export const EditEventSchedule = memoNamed('EditEventSchedule', () => {
  const eventId = useObservableValue(router.eventId$);
  const eventScheduleResult = useObservableValue(eventScheduleResult$);

  const {
    state: emailConfirmationHasPassed,
    setTrue: makeItPassTheEmailConfirmation,
  } = useBoolState(false);

  const user = useUser();

  const editPageIsHidden: boolean =
    Result.isOk(eventScheduleResult) &&
    eventScheduleResult.value.notificationSettings !== 'none' &&
    !emailConfirmationHasPassed &&
    eventScheduleResult.value.notificationSettings.email !== user?.email;

  return Result.isErr(eventScheduleResult) &&
    eventScheduleResult.value.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div>
      <Header title={dc.title} />
      {Result.isErr(eventScheduleResult) ? (
        <FetchEventScheduleError errorType={eventScheduleResult.value.type} />
      ) : eventId === undefined || eventScheduleResult === undefined ? (
        <Spinner />
      ) : (
        <EditEventScheduleOk
          editPageIsHidden={editPageIsHidden}
          eventSchedule={eventScheduleResult.value}
          makeItPassTheEmailConfirmation={makeItPassTheEmailConfirmation}
        />
      )}
    </div>
  );
});
