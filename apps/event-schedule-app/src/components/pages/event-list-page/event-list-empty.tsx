import { Button, NonIdealState } from 'blueprint-synstate';
import {
  If,
  constant,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import {
  EventListPageFilterStore,
  EventListStore,
} from '../../../store/index.mjs';

const dc = dict.eventListPage.empty;

type Props = Readonly<{
  /** As the filters above are, while a read is out. */
  disabled: Bindable<boolean>;
}>;

/**
 * In place of the cards when none is listed: says so, what the list holds, and
 * each filter that narrowed it, as the list on hand was read with; and, while
 * the events whose dates are all past are hidden, offers to show them.
 */
export const EventListEmpty = ({ disabled }: Props): JSX.Element => {
  const { listedWith$ } = EventListStore;

  const archive$ = mapBindable(
    listedWith$,
    (r) => r?.filterOptionState === 'archive',
  );

  const createdOnly$ = mapBindable(
    listedWith$,
    (r) => r?.showOnlyEventSchedulesICreated === true,
  );

  const filterText$ = mapBindable(listedWith$, (r) => r?.filterText ?? '');

  const pastHidden$ = mapBindable(
    listedWith$,
    (r) => r?.showAllPastDaysEvent === false,
  );

  return (
    <NonIdealState
      action={
        <If
          cond={pastHidden$}
          then={
            <Button
              disabled={disabled}
              text={constant(dc.showPast)}
              onClick={() => {
                EventListPageFilterStore.setShowAllPastDaysEvent(true);
              }}
            />
          }
        />
      }
      data-e2e={'event-list-empty'}
      description={
        <div>
          <p>{constant(dc.whatIsListed)}</p>
          <If cond={archive$} then={<p>{constant(dc.archive)}</p>} />
          <If cond={createdOnly$} then={<p>{constant(dc.createdOnly)}</p>} />
          <If
            cond={mapBindable(filterText$, (text) => text !== '')}
            then={<p>{mapBindable(filterText$, dc.filterText)}</p>}
          />
          <If cond={pastHidden$} then={<p>{constant(dc.pastHidden)}</p>} />
        </div>
      }
      icon={'timeline-events'}
      title={constant(dc.title)}
    />
  );
};
