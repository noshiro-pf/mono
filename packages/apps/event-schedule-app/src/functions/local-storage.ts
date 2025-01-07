import { EventSchedule } from '@noshiro/event-schedule-app-shared';

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

/** LocalStorage のキー重複回避のために suffix を付けている */
const attachSuffix = (key: string): string =>
  `${key}--event-schedule-app--2dc690b2-4b9b-49c3-921b-8c2a9451e415`;

type Store = DeepReadonly<{
  createEventPage: EventSchedule;
}>;

type StoreKeys = Record<keyof Store, string>;

const keys: StoreKeys = {
  createEventPage: attachSuffix('createEventPage'),
};

const restore = (at: string): string | undefined =>
  // eslint-disable-next-line unicorn/prefer-global-this
  window.localStorage.getItem(at) ?? undefined;

const save = (at: string, value: string): void => {
  // eslint-disable-next-line unicorn/prefer-global-this
  window.localStorage.setItem(at, value);
};

const restoreCreateEventPageTemp = (): Result<
  EventSchedulePicked | undefined,
  string
> => {
  const fromDb = restore(keys.createEventPage);
  if (fromDb === undefined) return Result.ok(undefined);
  const obj = Json.parse(fromDb);
  return Result.isErr(obj)
    ? Result.err(obj.value)
    : Result.ok(EventSchedule.fill(obj.value));
};

const saveCreateEventPageTemp = (
  eventSchedule: EventSchedulePicked,
): Result<undefined, string> => {
  const str = Json.stringify(eventSchedule);
  if (Result.isErr(str)) {
    return Result.err(str.value);
  } else {
    save(keys.createEventPage, str.value);
    return Result.ok(undefined);
  }
};

export const EventScheduleAppLocalStorage = {
  restoreCreateEventPageTemp,
  saveCreateEventPageTemp,
} as const;
