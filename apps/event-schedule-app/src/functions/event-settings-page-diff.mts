import { isKeyofNotificationSettings } from 'event-schedule-app-shared';
import { Arr, ISetMapped, expectType, fastDeepEqual } from 'ts-data-forge';
import {
  type DeepReadonly,
  type ReadonlyRecord,
  type RelaxedExclude,
  type StrictExclude,
  type StrictPick,
} from 'ts-type-forge';
import { hm2str, ymd2str, ymdhm2str } from '../constants/index.mjs';
import {
  Obj,
  match,
  type Paths,
  type RecordValueAtPath,
} from '../utils-ported/index.mjs';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from './map-key/index.mjs';

export type EventSettingsPageDiffResult = DeepReadonly<{
  title: string | undefined;
  notes: string | undefined;
  datetimeSpecification: string | undefined;

  datetimeRangeList: { added: string[]; deleted: string[] } | undefined;

  answerDeadline: string | undefined;

  notificationSettings: string[] | undefined;

  answerIcons: {
    good: { description: string | undefined };
    fair: { description: string | undefined; point: string | undefined };
    poor: { description: string | undefined };
  };

  author: string | undefined;
  timezoneOffsetMinutes: string | undefined;
}>;

// dict

const datetimeSpecificationOptions =
  dict.eventSettingsPage.section2.datetimeSpecificationOptions;

const dc = dict.eventSettingsPage.diff;

const map = (a: string, b: string): string =>
  `"${a}" ${dict.common.mapTo} "${b}"` as const;

type EventSchedulePaths = StrictExclude<Paths<EventSchedule>, readonly []>;

{
  expectType<
    | readonly ['answerDeadline', 'date']
    | readonly ['answerDeadline', 'hours']
    | readonly ['answerDeadline', 'minutes']
    | readonly ['answerDeadline', 'month']
    | readonly ['answerDeadline', 'year']
    | readonly ['answerDeadline']
    | readonly ['answerIcons', 'fair', 'description']
    | readonly ['answerIcons', 'fair', 'point']
    | readonly ['answerIcons', 'fair']
    | readonly ['answerIcons', 'good', 'description']
    | readonly ['answerIcons', 'good', 'point']
    | readonly ['answerIcons', 'good']
    | readonly ['answerIcons', 'poor', 'description']
    | readonly ['answerIcons', 'poor', 'point']
    | readonly ['answerIcons', 'poor']
    | readonly ['answerIcons']
    | readonly ['archivedBy']
    | readonly ['author', 'id']
    | readonly ['author', 'name']
    | readonly ['author']
    | readonly ['datetimeRangeList']
    | readonly ['datetimeSpecification']
    | readonly ['notes']
    | readonly ['notificationSettings', 'notify00daysBeforeAnswerDeadline']
    | readonly ['notificationSettings', 'notify01daysBeforeAnswerDeadline']
    | readonly ['notificationSettings', 'notify03daysBeforeAnswerDeadline']
    | readonly ['notificationSettings', 'notify07daysBeforeAnswerDeadline']
    | readonly ['notificationSettings', 'notify14daysBeforeAnswerDeadline']
    | readonly ['notificationSettings', 'notify28daysBeforeAnswerDeadline']
    | readonly ['notificationSettings', 'notifyAfterAnswerDeadline']
    | readonly ['notificationSettings', 'notifyOnAnswerChange']
    | readonly ['notificationSettings']
    | readonly ['timezoneOffsetMinutes']
    | readonly ['title'],
    EventSchedulePaths
  >('=');
}

const createDiffResult = <P extends EventSchedulePaths, R>(
  prev: EventSchedule,
  curr: EventSchedule,
  path: P,
  makeResult: (
    p: RecordValueAtPath<EventSchedule, P>,
    c: RecordValueAtPath<EventSchedule, P>,
  ) => RelaxedExclude<R, undefined>,
): R | undefined => {
  const a = Obj.getIn(prev, path);

  const b = Obj.getIn(curr, path);

  return fastDeepEqual(a, b) ? undefined : makeResult(a, b);
};

const ndc = dc.items.notificationSettings;

const notificationSettings = dict.eventSettingsPage.section3.notification;

const notificationSettingsDiff = (
  a: EventSchedule['notificationSettings'],
  b: EventSchedule['notificationSettings'],
  emailPrev: string | undefined,
  emailCurr: string | undefined,
): readonly string[] | undefined => {
  if (emailPrev === emailCurr && fastDeepEqual(a, b)) return undefined;

  if (a === 'none' || b === 'none') {
    return [
      map(a === 'none' ? ndc.off : ndc.on, b === 'none' ? ndc.off : ndc.on),
    ];
  }

  const collectedDiff = Arr.concat(
    emailPrev === emailCurr ? [] : [map(emailPrev ?? '', emailCurr ?? '')],
    Object.keys(a)
      .filter(isKeyofNotificationSettings)
      .reduce<readonly string[]>(
        (acc, key) =>
          a[key] === b[key]
            ? acc
            : Arr.toPushed(
                acc,
                `${notificationSettings[key]}${dict.common.colon} ${map(
                  a[key] ? ndc.on : ndc.off,
                  b[key] ? ndc.on : ndc.off,
                )}`,
              ),
        [],
      ),
  );

  return collectedDiff;
};

const tilde = dict.common.tilde;

const datetimeRange2str = (
  datetimeSpecification: EventSchedule['datetimeSpecification'],
  datetimeRange: DatetimeRange,
): string =>
  match(datetimeSpecification, {
    noStartEndSpecified: ymd2str(datetimeRange.ymd),

    startSpecified: `${ymd2str(datetimeRange.ymd)} ${hm2str(
      datetimeRange.timeRange.start,
    )}${tilde}`,

    endSpecified: `${ymd2str(datetimeRange.ymd)} ${tilde}${hm2str(
      datetimeRange.timeRange.end,
    )}`,

    startAndEndSpecified: `${ymd2str(datetimeRange.ymd)} ${hm2str(
      datetimeRange.timeRange.start,
    )}${tilde}${hm2str(datetimeRange.timeRange.end)} `,
  });

const datetimeRangeListDiff = (
  a: StrictPick<EventSchedule, 'datetimeRangeList' | 'datetimeSpecification'>,
  b: StrictPick<EventSchedule, 'datetimeRangeList' | 'datetimeSpecification'>,
): ReadonlyRecord<'added' | 'deleted', readonly string[]> | undefined => {
  const setA = ISetMapped.create(
    a.datetimeRangeList,
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );

  const setB = ISetMapped.create(
    b.datetimeRangeList,
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  );

  const diff = ISetMapped.diff(setA, setB);

  if (diff.added.isEmpty && diff.deleted.isEmpty) return undefined;

  const added = diff.added.toArray();

  const deleted = diff.deleted.toArray();

  return {
    added: added.map((e) => datetimeRange2str(a.datetimeSpecification, e)),
    deleted: deleted.map((e) => datetimeRange2str(b.datetimeSpecification, e)),
  };
};

export const collectEventSettingsPageDiff = (
  prev: EventSchedule,
  curr: EventSchedule,
  emailPrev: string | undefined,
  emailCurr: string | undefined,
): EventSettingsPageDiffResult =>
  ({
    title: createDiffResult(prev, curr, ['title'], map),
    notes: createDiffResult(prev, curr, ['notes'], map),

    datetimeSpecification: createDiffResult(
      prev,
      curr,
      ['datetimeSpecification'],
      (a, b) =>
        map(datetimeSpecificationOptions[a], datetimeSpecificationOptions[b]),
    ),

    datetimeRangeList: datetimeRangeListDiff(prev, curr),

    answerDeadline: createDiffResult(prev, curr, ['answerDeadline'], (a, b) =>
      map(
        a === 'none' ? dc.values.none : ymdhm2str(a),
        b === 'none' ? dc.values.none : ymdhm2str(b),
      ),
    ),

    notificationSettings: notificationSettingsDiff(
      prev.notificationSettings,
      curr.notificationSettings,
      emailPrev,
      emailCurr,
    ),

    answerIcons: {
      good: {
        description: createDiffResult(
          prev,
          curr,
          ['answerIcons', 'good', 'description'],
          map,
        ),
      },

      fair: {
        description: createDiffResult(
          prev,
          curr,
          ['answerIcons', 'fair', 'description'],
          map,
        ),
        point: createDiffResult(
          prev,
          curr,
          ['answerIcons', 'fair', 'point'],
          (a, b) => map(a.toString(), b.toString()),
        ),
      },

      poor: {
        description: createDiffResult(
          prev,
          curr,
          ['answerIcons', 'poor', 'description'],
          map,
        ),
      },
    },

    author: createDiffResult(prev, curr, ['author'], (a, b) =>
      map(a.name, b.name),
    ),

    timezoneOffsetMinutes: createDiffResult(
      prev,
      curr,
      ['timezoneOffsetMinutes'],
      (a, b) => map(a.toString(), b.toString()),
    ),
  }) as const;
