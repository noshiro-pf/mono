import { Spinner } from '@blueprintjs/core';
import { EventScheduleStore, router } from '../../../store';
import { Header } from '../../organisms';
import { NotFoundPage } from '../not-found-page';
import { EditEventScheduleOk } from './edit-event-schedule-ok';
import { FetchEventScheduleError } from './error';

const dc = dict.eventSettingsPage;

export const EditEventSchedule = memoNamed('EditEventSchedule', () => {
  const eventId = useObservableValue(router.eventId$);
  const eventScheduleResult = useObservableValue(EventScheduleStore.result$);

  return eventScheduleResult !== undefined &&
    Result.isErr(eventScheduleResult) &&
    eventScheduleResult.value.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div data-cy={'edit-event-schedule-page'}>
      <Header title={dc.title} />
      {eventScheduleResult !== undefined &&
      Result.isErr(eventScheduleResult) ? (
        <FetchEventScheduleError errorType={eventScheduleResult.value.type} />
      ) : eventId === undefined || eventScheduleResult === undefined ? (
        <Spinner />
      ) : (
        <EditEventScheduleOk eventScheduleFromDb={eventScheduleResult.value} />
      )}
    </div>
  );
});
