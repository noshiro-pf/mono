import { Button, ControlGroup, HTMLSelect, Spinner } from '@blueprintjs/core';
import type { ChangeEventHandler } from 'react';
import { api } from '../../../api';
import { createToaster, showToast } from '../../../functions';
import {
  eventList$,
  EventListFetchState,
  EventListPageFilteringState,
  useFireAuthUser,
} from '../../../store';
import { BpCheckbox, BpInput } from '../../bp';
import { Header } from '../../organisms';
import { EventListItemComponent } from './event-list-item';

const dc = dict.eventListPage;

const filterOptionStateChangeHandler: ChangeEventHandler<HTMLSelectElement> = (
  ev
) => {
  const v = ev.target.value;
  if (v === 'archive' || v === 'inProgress') {
    EventListPageFilteringState.setFilterOptionState(v);
  }
};

const toast = createToaster();

const archiveOrUnarchiveHandler =
  (archiveOrUnarchive: 'archive' | 'unarchive') =>
  async (eventId: string, user: User): Promise<void> => {
    const result = await api.event[archiveOrUnarchive](eventId, user);

    if (Result.isErr(result)) {
      console.error(result.value);
      showToast({
        toast,
        message: dc.errorOccurred,
        intent: 'danger',
      });
    } else {
      showToast({
        toast,
        message: match(archiveOrUnarchive, {
          archive: dc.archivingDone,
          unarchive: dc.unArchivingDone,
        }),
        intent: 'success',
      });

      EventListFetchState.fetchEventList();
    }
  };

const archiveEventScheduleHandler = archiveOrUnarchiveHandler('archive');

const unarchiveEventScheduleHandler = archiveOrUnarchiveHandler('unarchive');

export const EventListPage = memoNamed('EventListPage', () => {
  useEffect(() => {
    EventListFetchState.fetchEventList();
  }, []);

  const eventList = useObservableValue(eventList$);

  const fireAuthUser = useFireAuthUser();

  const eventListWithHandler = useMemo(
    () =>
      eventList?.map((e) =>
        tp(
          e,
          () => {
            if (fireAuthUser === undefined) return;
            archiveEventScheduleHandler(e.eventScheduleMetadata.id, {
              id: fireAuthUser.uid,
              name: fireAuthUser.displayName ?? '',
            }).catch(noop);
          },
          () => {
            if (fireAuthUser === undefined) return;
            unarchiveEventScheduleHandler(e.eventScheduleMetadata.id, {
              id: fireAuthUser.uid,
              name: fireAuthUser.displayName ?? '',
            }).catch(noop);
          }
        )
      ),

    [eventList, fireAuthUser]
  );

  const refreshButtonIsDisabled = useObservableValue(
    EventListFetchState.refreshButtonIsDisabled$
  );
  const refreshButtonIsLoading = useObservableValue(
    EventListFetchState.refreshButtonIsLoading$
  );
  const filterOptionState = useObservableValue(
    EventListPageFilteringState.filterOptionState$
  );
  const showOnlyEventSchedulesICreated = useObservableValue(
    EventListPageFilteringState.showOnlyEventSchedulesICreated$
  );
  const showAllPastDaysEvent = useObservableValue(
    EventListPageFilteringState.showAllPastDaysEvent$
  );
  const filterText = useObservableValue(
    EventListPageFilteringState.filterText$
  );

  const formElementsAreDisabled =
    refreshButtonIsDisabled || refreshButtonIsLoading;

  const archiveOrUnArchive = useMemo(
    () =>
      match(filterOptionState, {
        archive: 'unarchive',
        inProgress: 'archive',
      } as const),
    [filterOptionState]
  );

  return (
    <div>
      <Header title={dc.title} />
      {eventListWithHandler === undefined ? (
        <Spinner />
      ) : (
        <Body>
          <FilterByArea>
            <HTMLSelect
              disabled={formElementsAreDisabled}
              value={filterOptionState}
              onChange={filterOptionStateChangeHandler}
            >
              <option value={'inProgress'}>{dc.filter.inProgress}</option>
              <option value={'archive'}>{dc.filter.archive}</option>
            </HTMLSelect>
            <BpCheckbox
              checked={showOnlyEventSchedulesICreated}
              disabled={formElementsAreDisabled}
              label={dc.filter.showOnlyEventSchedulesICreated}
              onCheck={
                EventListPageFilteringState.setShowOnlyEventSchedulesICreated
              }
            />
            <BpCheckbox
              checked={showAllPastDaysEvent}
              disabled={formElementsAreDisabled}
              label={dc.filter.showAllPastDaysEvent}
              onCheck={EventListPageFilteringState.setShowAllPastDaysEvent}
            />
            <ControlGroup>
              <BpInput
                leftIcon={'search'}
                placeholder={dc.filter.searchInput}
                type={'search'}
                value={filterText}
                onValueChange={EventListPageFilteringState.setFilterText}
              />
              <Button
                disabled={formElementsAreDisabled}
                onClick={EventListPageFilteringState.filterByText}
              >
                {dc.search}
              </Button>
            </ControlGroup>
          </FilterByArea>

          <hr />

          <ItemCountAndRefresh>
            <div>{dc.itemCount(eventListWithHandler.length)}</div>
            <Button
              disabled={refreshButtonIsDisabled}
              icon={'refresh'}
              intent={'none'}
              loading={refreshButtonIsLoading}
              onClick={EventListFetchState.refreshEventList}
            >
              {dc.refresh}
            </Button>
          </ItemCountAndRefresh>

          <ListItemsWrapper>
            {eventListWithHandler.map(([eventListItem, archive, unarchive]) => (
              <EventListItemComponent
                key={eventListItem.eventScheduleMetadata.id}
                archiveOrUnArchive={archiveOrUnArchive}
                eventListItem={eventListItem}
                fireAuthUser={fireAuthUser}
                onConfirmArchiving={archive}
                onConfirmUnArchiving={unarchive}
              />
            ))}
          </ListItemsWrapper>
        </Body>
      )}
    </div>
  );
});

const Body = styled.div`
  margin: 0 20px;
`;

const FilterByArea = styled.div`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  > * {
    margin: 3px 10px;
  }
`;

const ItemCountAndRefresh = styled(FilterByArea)`
  justify-content: space-between;
`;

const ListItemsWrapper = styled.div`
  > * {
    margin: 10px 0;
  }
`;