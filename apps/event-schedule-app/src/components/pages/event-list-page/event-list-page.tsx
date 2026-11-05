import {
  Button,
  Checkbox,
  ControlGroup,
  HtmlSelect,
  InputGroup,
  Spinner,
} from 'blueprint-synstate';
import { UserId, UserName } from 'event-schedule-app-shared';
import { map } from 'synstate';
import {
  For,
  If,
  constant,
  createAfterUpdate,
  deriveBindable,
  mapBindable,
  type JSX,
} from 'synstate-dom';
import { Arr, Result, match } from 'ts-data-forge';
import { dict } from '../../../constants/index.mjs';
import { showToast } from '../../../functions/index.mjs';
import {
  Auth,
  EventListPageFilterStore,
  EventListStore,
  api,
  eventList$,
  toaster,
} from '../../../store/index.mjs';
import { Header } from '../../organisms/index.mjs';
import { EventListItemComponent } from './event-list-item.js';
import * as styles from './event-list-page.module.css';

const dc = dict.eventListPage;

export const EventListPage = (): JSX.Element => {
  // After the update that opened the page.
  createAfterUpdate()(EventListStore.fetchEventList);

  const sortedEventList$ = eventList$.pipe(
    map((eventList) =>
      // TODO: backend でソートするようにする
      eventList?.toSorted(
        (a, b) =>
          (b.eventScheduleMetadata.createdAtMillis ??
            Date.parse(b.eventScheduleMetadata.createdAt)) -
          (a.eventScheduleMetadata.createdAtMillis ??
            Date.parse(a.eventScheduleMetadata.createdAt)),
      ),
    ),
  );

  const formElementsAreDisabled = deriveBindable(
    [
      EventListStore.refreshButtonIsDisabled$,
      EventListStore.refreshButtonIsLoading$,
    ],
    (disabled, loading) => disabled || loading,
  );

  const archiveOrUnArchive$ = EventListPageFilterStore.filterOptionState$.pipe(
    map((option) =>
      match(option, {
        archive: 'unarchive',
        inProgress: 'archive',
      } as const),
    ),
  );

  // Every card is drawn again when the list, the user or the filter changes.
  const listDrawing$ = deriveBindable(
    [sortedEventList$, Auth.fireAuthUser$, archiveOrUnArchive$],
    (eventList, fireAuthUser, archiveOrUnArchive) =>
      ({
        eventList: eventList ?? [],
        fireAuthUser,
        archiveOrUnArchive,
      }) as const,
  );

  return (
    <div data-e2e={constant('event-list-page')}>
      <Header title={dc.title} />
      <If
        cond={mapBindable(sortedEventList$, (list) => list === undefined)}
        else={
          <div class={constant(styles.content)}>
            <div class={constant(styles.filterByArea)}>
              <HtmlSelect
                disabled={formElementsAreDisabled}
                value={EventListPageFilterStore.filterOptionState$}
                onChange={({ currentTarget }) => {
                  const v = currentTarget.value;

                  if (v === 'archive' || v === 'inProgress') {
                    EventListPageFilterStore.setFilterOptionState(v);
                  }
                }}
              >
                <option value={constant('inProgress')}>
                  {constant(dc.filter.inProgress)}
                </option>
                <option value={constant('archive')}>
                  {constant(dc.filter.archive)}
                </option>
              </HtmlSelect>
              <Checkbox
                checked={
                  EventListPageFilterStore.showOnlyEventSchedulesICreated$
                }
                disabled={formElementsAreDisabled}
                label={constant(dc.filter.showOnlyEventSchedulesICreated)}
                onChange={({ currentTarget }) => {
                  EventListPageFilterStore.setShowOnlyEventSchedulesICreated(
                    currentTarget.checked,
                  );
                }}
              />
              <Checkbox
                checked={EventListPageFilterStore.showAllPastDaysEvent$}
                disabled={formElementsAreDisabled}
                label={constant(dc.filter.showAllPastDaysEvent)}
                onChange={({ currentTarget }) => {
                  EventListPageFilterStore.setShowAllPastDaysEvent(
                    currentTarget.checked,
                  );
                }}
              />
              <ControlGroup>
                <InputGroup
                  data-e2e={constant('search-input')}
                  leftIcon={'search'}
                  placeholder={constant(dc.filter.searchInput)}
                  type={'search'}
                  value={EventListPageFilterStore.filterText$}
                  onInput={({ currentTarget }) => {
                    EventListPageFilterStore.setFilterText(currentTarget.value);
                  }}
                />
                <Button
                  data-e2e={constant('search-button')}
                  disabled={formElementsAreDisabled}
                  text={constant(dc.search)}
                  onClick={EventListPageFilterStore.filterByText}
                />
              </ControlGroup>
            </div>

            <hr />

            <div
              class={constant(`${styles.filterByArea} ${styles.spaceBetween}`)}
            >
              <div data-e2e={constant('event-count')}>
                {mapBindable(sortedEventList$, (list) =>
                  dc.itemCount(Arr.length(list ?? [])),
                )}
              </div>
              <Button
                disabled={EventListStore.refreshButtonIsDisabled$}
                icon={'refresh'}
                intent={'none'}
                loading={EventListStore.refreshButtonIsLoading$}
                text={constant(dc.refresh)}
                onClick={EventListStore.refreshEventList}
              />
            </div>

            <div class={constant(styles.list)}>
              <For items={mapBindable(listDrawing$, (d) => [d])} key={(d) => d}>
                {(drawing$) => {
                  const { eventList, fireAuthUser, archiveOrUnArchive } =
                    drawing$.getSnapshot().value;

                  const user = (): User | undefined =>
                    fireAuthUser === undefined
                      ? undefined
                      : ({
                          id: UserId.cast(fireAuthUser.uid),
                          name: UserName.cast(fireAuthUser.displayName ?? ''),
                        } as const);

                  return (
                    <>
                      {eventList.map((eventListItem) => {
                        const eventId = eventListItem.eventScheduleMetadata.id;

                        const run =
                          (handler: (id: string, u: User) => Promise<void>) =>
                          (): void => {
                            const u = user();

                            if (u !== undefined) {
                              handler(eventId, u).catch(() => {});
                            }
                          };

                        return (
                          <EventListItemComponent
                            archiveOrUnArchive={archiveOrUnArchive}
                            eventListItem={eventListItem}
                            fireAuthUser={fireAuthUser}
                            onConfirmArchiving={run(
                              archiveEventScheduleHandler,
                            )}
                            onConfirmUnArchiving={run(
                              unarchiveEventScheduleHandler,
                            )}
                          />
                        );
                      })}
                    </>
                  );
                }}
              </For>
            </div>
          </div>
        }
        then={<Spinner />}
      />
    </div>
  );
};

const archiveOrUnarchiveHandler =
  (archiveOrUnarchive: 'archive' | 'unarchive') =>
  async (eventId: string, user: User): Promise<void> => {
    const result = await api.event[archiveOrUnarchive](eventId, user);

    if (Result.isErr(result)) {
      console.error(result.value);

      showToast({
        toast: toaster,
        message: dc.errorOccurred,
        intent: 'danger',
      });
    } else {
      showToast({
        toast: toaster,
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
