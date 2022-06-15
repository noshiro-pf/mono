import { deepEqual } from '@noshiro/fast-deep-equal';
import { datetimeRangeFromMapKey, datetimeRangeToMapKey } from './map-key';
import { hm2str, ymd2str, ymdhm2str } from './ymdhm2str';

export type EventSettingsPageDiffResult = DeepReadonly<{
  title: string | undefined;
  notes: string | undefined;
  datetimeSpecification: string | undefined;

  datetimeRangeList:
    | {
        added: string[];
        deleted: string[];
      }
    | undefined;

  answerDeadline: string | undefined;

  notificationSettings: string[] | undefined;

  answerIcons: {
    good: {
      description: string | undefined;
    };
    fair: {
      description: string | undefined;
      point: string | undefined;
    };
    poor: {
      description: string | undefined;
    };
  };

  author: string | undefined;
  timezoneOffsetMinutes: string | undefined;
}>;

// dict

const datetimeSpecificationOptions =
  dict.eventSettingsPage.section2.datetimeSpecificationOptions;
const dc = dict.eventSettingsPage.diff;

const map = (a: string, b: string): string =>
  `"${a}" ${dict.common.mapTo} "${b}"`;

type EventSchedulePaths = StrictExclude<Paths<EventSchedule>, readonly []>;

// eslint-disable-next-line no-lone-blocks
{
  assertType<
    TypeEq<
      Readonly<
        | ['answerDeadline', 'date']
        | ['answerDeadline', 'hours']
        | ['answerDeadline', 'minutes']
        | ['answerDeadline', 'month']
        | ['answerDeadline', 'year']
        | ['answerDeadline']
        | ['answerIcons', 'fair', 'description']
        | ['answerIcons', 'fair', 'point']
        | ['answerIcons', 'fair']
        | ['answerIcons', 'good', 'description']
        | ['answerIcons', 'good', 'point']
        | ['answerIcons', 'good']
        | ['answerIcons', 'poor', 'description']
        | ['answerIcons', 'poor', 'point']
        | ['answerIcons', 'poor']
        | ['answerIcons']
        | ['archivedBy']
        | ['author', 'id']
        | ['author', 'name']
        | ['author']
        | ['datetimeRangeList']
        | ['datetimeSpecification']
        | ['notes']
        | ['notificationSettings', 'notify01daysBeforeAnswerDeadline']
        | ['notificationSettings', 'notify03daysBeforeAnswerDeadline']
        | ['notificationSettings', 'notify07daysBeforeAnswerDeadline']
        | ['notificationSettings', 'notify14daysBeforeAnswerDeadline']
        | ['notificationSettings', 'notify28daysBeforeAnswerDeadline']
        | ['notificationSettings', 'notifyOnAnswerChange']
        | ['notificationSettings']
        | ['timezoneOffsetMinutes']
        | ['title']
      >,
      EventSchedulePaths
    >
  >();
}

const createDiffResult = <P extends EventSchedulePaths, R>(
  prev: EventSchedule,
  curr: EventSchedule,
  path: P,
  makeResult: (
    p: RecordValueAtPath<EventSchedule, P>,
    c: RecordValueAtPath<EventSchedule, P>
  ) => RelaxedExclude<R, undefined>
): R | undefined => {
  const a = IRecord.getIn(prev, path);
  const b = IRecord.getIn(curr, path);
  return deepEqual(a, b) ? undefined : makeResult(a, b);
};

const ndc = dc.items.notificationSettings;
const notificationSettings = dict.eventSettingsPage.section3.notification;

const notificationSettingsDiff = (
  a: EventSchedule['notificationSettings'],
  b: EventSchedule['notificationSettings'],
  emailPrev: string | undefined,
  emailCurr: string | undefined
): readonly string[] | undefined => {
  if (deepEqual(a, b)) return undefined;

  if (a === 'none' || b === 'none') {
    return [
      map(a === 'none' ? ndc.off : ndc.on, b === 'none' ? ndc.off : ndc.on),
    ];
  }

  const collectedDiff = IList.concat(
    emailPrev === emailCurr ? [] : [map(emailPrev ?? '', emailCurr ?? '')],
    IRecord.keys(a).reduce<readonly string[]>(
      (acc, key) =>
        a[key] === b[key]
          ? acc
          : IList.push(
              acc,
              `${notificationSettings[key]}${dict.common.colon} ${map(
                a[key] ? ndc.on : ndc.off,
                b[key] ? ndc.on : ndc.off
              )}`
            ),
      []
    )
  );

  return collectedDiff;
};

const tilde = dict.common.tilde;

const datetimeRange2str = (
  datetimeSpecification: EventSchedule['datetimeSpecification'],
  datetimeRange: DatetimeRange
): string =>
  match(datetimeSpecification, {
    noStartEndSpecified: ymd2str(datetimeRange.ymd),

    startSpecified: `${ymd2str(datetimeRange.ymd)} ${hm2str(
      datetimeRange.timeRange.start
    )}${tilde}`,

    endSpecified: `${ymd2str(datetimeRange.ymd)} ${tilde}${hm2str(
      datetimeRange.timeRange.end
    )}`,

    startAndEndSpecified: `${ymd2str(datetimeRange.ymd)} ${hm2str(
      datetimeRange.timeRange.start
    )}${tilde}${hm2str(datetimeRange.timeRange.end)} `,
  });

const datetimeRangeListDiff = (
  a: Pick<EventSchedule, 'datetimeRangeList' | 'datetimeSpecification'>,
  b: Pick<EventSchedule, 'datetimeRangeList' | 'datetimeSpecification'>
): ReadonlyRecord<'added' | 'deleted', readonly string[]> | undefined => {
  const setA = ISetMapped.new(
    a.datetimeRangeList,
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey
  );

  const setB = ISetMapped.new(
    b.datetimeRangeList,
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey
  );

  const diff = ISetMapped.diff(setA, setB);

  if (diff.added.isEmpty && diff.deleted.isEmpty) return undefined;

  return {
    added: diff.added
      .toArray()
      .map((e) => datetimeRange2str(a.datetimeSpecification, e)),
    deleted: diff.deleted
      .toArray()
      .map((e) => datetimeRange2str(b.datetimeSpecification, e)),
  };
};

export const collectEventSettingsPageDiff = (
  prev: EventSchedule,
  curr: EventSchedule,
  emailPrev: string | undefined,
  emailCurr: string | undefined
): EventSettingsPageDiffResult => ({
  title: createDiffResult(prev, curr, ['title'], map),
  notes: createDiffResult(prev, curr, ['notes'], map),

  datetimeSpecification: createDiffResult(
    prev,
    curr,
    ['datetimeSpecification'],
    (a, b) =>
      map(datetimeSpecificationOptions[a], datetimeSpecificationOptions[b])
  ),

  datetimeRangeList: datetimeRangeListDiff(prev, curr),

  answerDeadline: createDiffResult(prev, curr, ['answerDeadline'], (a, b) =>
    map(
      a === 'none' ? dc.values.none : ymdhm2str(a),
      b === 'none' ? dc.values.none : ymdhm2str(b)
    )
  ),

  notificationSettings: notificationSettingsDiff(
    prev.notificationSettings,
    curr.notificationSettings,
    emailPrev,
    emailCurr
  ),

  answerIcons: {
    good: {
      description: createDiffResult(
        prev,
        curr,
        ['answerIcons', 'good', 'description'],
        map
      ),
    },

    fair: {
      description: createDiffResult(
        prev,
        curr,
        ['answerIcons', 'fair', 'description'],
        map
      ),
      point: createDiffResult(
        prev,
        curr,
        ['answerIcons', 'fair', 'point'],
        (a, b) => map(a.toString(), b.toString())
      ),
    },

    poor: {
      description: createDiffResult(
        prev,
        curr,
        ['answerIcons', 'poor', 'description'],
        map
      ),
    },
  },

  author: createDiffResult(prev, curr, ['author'], (a, b) =>
    map(a.name, b.name)
  ),

  timezoneOffsetMinutes: createDiffResult(
    prev,
    curr,
    ['timezoneOffsetMinutes'],
    (a, b) => map(a.toString(), b.toString())
  ),
});
