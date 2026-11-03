import { EventSchedule } from 'event-schedule-app-shared';
import { Json, Result, isPanicError, unknownToString } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord, StrictPick } from 'ts-type-forge';

type EventSchedulePicked = StrictPick<
  EventSchedule,
  | 'answerDeadline'
  | 'answerIcons'
  | 'datetimeSpecification'
  | 'notes'
  | 'notificationSettings'
  | 'title'
> &
  Readonly<{ datetimeRangeList: readonly DatetimeRange[] }>;

/** LocalStorage のキー重複回避のために suffix を付けている */
const attachSuffix = (key: string): string =>
  `${key}--event-schedule-app--2dc690b2-4b9b-49c3-921b-8c2a9451e415` as const;

type Store = DeepReadonly<{ createEventPage: EventSchedule }>;

type StoreKeys = ReadonlyRecord<keyof Store, string>;

const keys: StoreKeys = {
  createEventPage: attachSuffix('createEventPage'),
} as const;

/**
 * Reading `window.localStorage` throws a SecurityError when the browser blocks
 * site data, and `setItem` throws a QuotaExceededError when storage is full.
 * Both are DOMExceptions, which `Result.fromThrowable` does not recognize as
 * errors (it would report `{}`), so their name and message are kept here.
 * A panic is rethrown.
 */
const tryStorage = <T,>(access: () => T): Result<T, string> => {
  try {
    return Result.ok(access());
  } catch (error: unknown) {
    // A panic is a bug, not a storage failure, as for `Result.fromThrowable`.
    if (isPanicError(error)) {
      throw error;
    }

    return Result.err(
      error instanceof DOMException
        ? `${error.name}: ${error.message}`
        : unknownToString(error),
    );
  }
};

const restore = (at: string): Result<string | undefined, string> =>
  tryStorage(() => window.localStorage.getItem(at) ?? undefined);

const save = (at: string, value: string): Result<undefined, string> =>
  tryStorage(() => {
    window.localStorage.setItem(at, value);

    return undefined;
  });

const restoreCreateEventPageTemp = (): Result<
  EventSchedulePicked | undefined,
  string
> => {
  const fromDb = restore(keys.createEventPage);

  if (Result.isErr(fromDb)) {
    return fromDb;
  }

  if (fromDb.value === undefined) {
    return Result.ok(undefined);
  }

  const obj = Json.parse(fromDb.value);

  return Result.isErr(obj)
    ? Result.err(obj.value)
    : Result.ok(EventSchedule.fill(obj.value));
};

const saveCreateEventPageTemp = (
  eventSchedule: EventSchedulePicked,
): Result<undefined, string> => {
  const str = Json.stringify(eventSchedule);

  return Result.isErr(str)
    ? Result.err(str.value)
    : save(keys.createEventPage, str.value ?? '');
};

export const EventScheduleAppLocalStorage = {
  restoreCreateEventPageTemp,
  saveCreateEventPageTemp,
} as const;
