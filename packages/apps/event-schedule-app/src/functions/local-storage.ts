import { fillEventSchedule } from '@noshiro/event-schedule-app-shared';

type EventSchedulePicked = Pick<
  EventSchedule,
  | 'answerDeadline'
  | 'answerIcons'
  | 'datetimeSpecification'
  | 'notes'
  | 'notificationSettings'
  | 'title'
> &
  Readonly<{
    datetimeRangeList: readonly DatetimeRange[];
  }>;

export namespace EventScheduleAppLocalStorage {
  const attachSuffix = (key: string): string =>
    `${key}--event-schedule-app--2dc690b2-4b9b-49c3-921b-8c2a9451e415`;

  type Store = DeepReadonly<{
    createEventPage: EventSchedule;
  }>;

  type StoreKeys = ReadonlyRecord<keyof Store, string>;

  const keys: StoreKeys = {
    createEventPage: attachSuffix('createEventPage'),
  };

  const restore = (at: string): string | undefined =>
    window.localStorage.getItem(at) ?? undefined;

  const save = (at: string, value: string): void => {
    window.localStorage.setItem(at, value);
  };

  export const restoreCreateEventPageTemp = (): Result<
    EventSchedulePicked | undefined,
    string
  > => {
    const fromDb = restore(keys.createEventPage);
    if (fromDb === undefined) return Result.ok(undefined);
    const obj = Json.parse(fromDb);
    return Result.isErr(obj)
      ? Result.err(obj.value)
      : Result.ok(fillEventSchedule(obj.value as Partial<EventSchedulePicked>));
  };

  export const saveCreateEventPageTemp = (
    eventSchedule: EventSchedulePicked
  ): Result<undefined, string> => {
    const str = Json.stringify(eventSchedule);
    if (Result.isErr(str)) {
      return Result.err(str.value);
    } else {
      save(keys.createEventPage, str.value);
      return Result.ok(undefined);
    }
  };
}