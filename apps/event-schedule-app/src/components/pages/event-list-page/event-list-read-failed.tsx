import { Button, NonIdealState } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { EventListStore } from '../../../store/index.mjs';

const dc = dict.eventListPage.readFailed;

/**
 * In place of the cards when the last read of the list failed: says so, and
 * reads it again with the filters above, which stay as they are.
 */
export const EventListReadFailed = (): JSX.Element => (
  <NonIdealState
    action={
      <Button
        data-e2e={constant('event-list-retry')}
        disabled={EventListStore.refreshButtonIsDisabled$}
        icon={'refresh'}
        loading={EventListStore.refreshButtonIsLoading$}
        text={constant(dc.retry)}
        onClick={EventListStore.refreshEventList}
      />
    }
    data-e2e={'event-list-read-failed'}
    description={<p>{constant(dc.description)}</p>}
    icon={'error'}
    title={constant(dc.title)}
  />
);
