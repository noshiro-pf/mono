import { Spinner } from 'blueprint-synstate';
import {
  For,
  constant,
  deriveBindable,
  mapBindable,
  type JSX,
} from 'synstate-dom';
import { Result } from 'ts-data-forge';
import { dict } from '../../../constants/index.mjs';
import { EventScheduleStore, Router } from '../../../store/index.mjs';
import { Header } from '../../organisms/index.mjs';
import { NotFoundPage } from '../not-found-page.js';
import { EditEventScheduleOk } from './edit-event-schedule-ok.js';
import { FetchEventScheduleError } from './error.js';

const dc = dict.eventSettingsPage;

export const EditEventSchedule = (): JSX.Element => {
  const status$ = deriveBindable(
    [Router.eventId$, EventScheduleStore.result$],
    (eventId, result): Status =>
      result !== undefined && Result.isErr(result)
        ? result.value.type
        : eventId === undefined || result === undefined
          ? 'loading'
          : 'ok',
  );

  return (
    <For items={mapBindable(status$, (s) => [s])} key={(s) => s}>
      {(status$_) => {
        const status = status$_.getSnapshot().value;

        return status === 'not-found' ? (
          <NotFoundPage />
        ) : (
          <div data-e2e={constant('edit-event-schedule-page')}>
            <Header title={dc.title} />
            {status === 'others' ? (
              <FetchEventScheduleError errorType={'others'} />
            ) : status === 'loading' ? (
              <Spinner />
            ) : (
              <EditEventScheduleOk />
            )}
          </div>
        );
      }}
    </For>
  );
};

type Status = 'loading' | 'not-found' | 'ok' | 'others';
