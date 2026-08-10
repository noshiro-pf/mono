import { Button, ControlGroup, HTMLSelect, Spinner } from '@blueprintjs/core';
import { UserId, UserName } from '@noshiro/event-schedule-app-shared';
import { BpCheckbox, BpInput } from '@noshiro/react-blueprintjs-utils';
import { api } from '../../../api';
import { createToaster, showToast } from '../../../functions';
import {
  Auth,
  EventListPageFilterStore,
  EventListStore,
  eventList$,
} from '../../../store';
import { Header } from '../../organisms';
import { EventListItemComponent } from './event-list-item';

const dc = dict.eventListPage;

export const EventListPage = memoNamed('EventListPage', () => {
  useEffect(() => {
    EventListStore.fetchEventList();
  }, []);

  const eventList = useObservableValue(eventList$);

  const fireAuthUser = Auth.useFireAuthUser();

  const eventListWithHandler = useMemo(
    () =>
      eventList
        // TODO: backend でソートするようにする
        ?.toSorted(
          (a, b) =>
            (b.eventScheduleMetadata.createdAtMillis ??
              Date.parse(b.eventScheduleMetadata.createdAt)) -
            (a.eventScheduleMetadata.createdAtMillis ??
              Date.parse(a.eventScheduleMetadata.createdAt)),
        )
        .map((e) =>
          tp(
            e,
            () => {
              if (fireAuthUser === undefined) return;
              archiveEventScheduleHandler(e.eventScheduleMetadata.id, {
                id: UserId.cast(fireAuthUser.uid),
                name: UserName.cast(fireAuthUser.displayName ?? ''),
              }).catch(noop);
            },
            () => {
              if (fireAuthUser === undefined) return;
              unarchiveEventScheduleHandler(e.eventScheduleMetadata.id, {
                id: UserId.cast(fireAuthUser.uid),
                name: UserName.cast(fireAuthUser.displayName ?? ''),
              }).catch(noop);
            },
          ),
        ),

    [eventList, fireAuthUser],
  );

  const refreshButtonIsDisabled = EventListStore.useRefreshButtonIsDisabled();
  const refreshButtonIsLoading = EventListStore.useRefreshButtonIsLoading();
  const filterOptionState = EventListPageFilterStore.useFilterOptionState();
  const showOnlyEventSchedulesICreated =
    EventListPageFilterStore.useShowOnlyEventSchedulesICreated();
  const showAllPastDaysEvent =
    EventListPageFilterStore.useShowAllPastDaysEvent();
  const filterText = EventListPageFilterStore.useFilterText();

  const formElementsAreDisabled =
    refreshButtonIsDisabled || refreshButtonIsLoading;

  const archiveOrUnArchive = useMemo(
    () =>
      match(filterOptionState, {
        archive: 'unarchive',
        inProgress: 'archive',
      } as const),
    [filterOptionState],
  );

  return (
    <div>
      <Header title={dc.title} />
      {eventListWithHandler === undefined ? (
        <Spinner />
      ) : (
        <div
          css={css`
            margin: 0 20px;
          `}
        >
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
                EventListPageFilterStore.setShowOnlyEventSchedulesICreated
              }
            />
            <BpCheckbox
              checked={showAllPastDaysEvent}
              disabled={formElementsAreDisabled}
              label={dc.filter.showAllPastDaysEvent}
              onCheck={EventListPageFilterStore.setShowAllPastDaysEvent}
            />
            <ControlGroup>
              <BpInput
                leftIcon={'search'}
                placeholder={dc.filter.searchInput}
                type={'search'}
                value={filterText}
                onValueChange={EventListPageFilterStore.setFilterText}
              />
              <Button
                disabled={formElementsAreDisabled}
                onClick={EventListPageFilterStore.filterByText}
              >
                {dc.search}
              </Button>
            </ControlGroup>
          </FilterByArea>

          <hr />

          <FilterByArea
            css={css`
              justify-content: space-between;
            `}
          >
            <div>{dc.itemCount(Arr.length(eventListWithHandler))}</div>
            <Button
              disabled={refreshButtonIsDisabled}
              icon={'refresh'}
              intent={'none'}
              loading={refreshButtonIsLoading}
              onClick={EventListStore.refreshEventList}
            >
              {dc.refresh}
            </Button>
          </FilterByArea>

          <div
            css={css`
              > * {
                margin: 10px 0;
              }
            `}
          >
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
          </div>
        </div>
      )}
    </div>
  );
});

const filterOptionStateChangeHandler: React.ChangeEventHandler<
  HTMLSelectElement
> = (ev) => {
  const v = ev.target.value;
  if (v === 'archive' || v === 'inProgress') {
    EventListPageFilterStore.setFilterOptionState(v);
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

      EventListStore.fetchEventList();
    }
  };

const archiveEventScheduleHandler = archiveOrUnarchiveHandler('archive');

const unarchiveEventScheduleHandler = archiveOrUnarchiveHandler('unarchive');

const FilterByArea = styled.div`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  > * {
    margin: 3px 10px;
  }
`;
