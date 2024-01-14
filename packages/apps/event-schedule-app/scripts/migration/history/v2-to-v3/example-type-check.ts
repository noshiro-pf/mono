import {
  type Answer as AnswerV2,
  type EventSchedule as EventScheduleV2,
} from '@noshiro/event-schedule-app-shared/v2';
import {
  type AnswerId,
  type Answer as AnswerV3,
  type EventSchedule as EventScheduleV3,
  type UserName,
  type Weight,
} from '@noshiro/event-schedule-app-shared/v3';

const eventScheduleExampleV2: EventScheduleV2 = {
  answerSymbolList: [
    { point: 10, iconId: 'handmade-circle', description: '参加します' },
    {
      point: 6,
      description: '参加できるかも',
      iconId: 'handmade-triangle',
    },
    {
      point: 0,
      iconId: 'handmade-cross',
      description: '参加できません',
    },
  ],
  useAnswerDeadline: true,
  useNotification: false,
  datetimeRangeList: [
    {
      ymd: { month: 3, date: 9, year: toSafeUint(2021) },
      timeRange: {
        start: { hours: 0, minutes: 0 },
        end: { hours: 0, minutes: 0 },
      },
    },
    {
      timeRange: {
        end: { hours: 0, minutes: 0 },
        start: { hours: 0, minutes: 0 },
      },
      ymd: { month: 3, date: 12, year: toSafeUint(2021) },
    },
    {
      ymd: { year: toSafeUint(2021), date: 17, month: 3 },
      timeRange: {
        start: { minutes: 0, hours: 0 },
        end: { minutes: 0, hours: 0 },
      },
    },
  ],
  customizeSymbolSettings: true,
  notes: 'bbb https://www.google.com/　あああ\n',
  title: 'aaaaa1',
  answerDeadline: {
    hours: 23,
    date: 28,
    year: toSafeUint(2021),
    minutes: 59,
    month: 11,
  },
  notificationSettings: {
    notify07daysBeforeAnswerDeadline: false,
    notify14daysBeforeAnswerDeadline: false,
    email: '',
    notify03daysBeforeAnswerDeadline: false,
    notifyOnAnswerChange: true,
    notify01daysBeforeAnswerDeadline: false,
    notify28daysBeforeAnswerDeadline: false,
  },
  timezoneOffsetMinutes: -540,
  datetimeSpecification: 'startSpecified',
} as const;

const eventScheduleExampleV3: EventScheduleV3 = {
  answerSymbols: {
    good: { point: 10, description: '参加します' },
    fair: { point: 6, description: '参加できるかも' },
    poor: { point: 0, description: '参加できません' },
  },
  useAnswerDeadline: true,
  useNotification: false,
  datetimeRangeList: [
    {
      ymd: { month: 3, date: 9, year: toSafeUint(2021) },
      timeRange: {
        start: { hours: 0, minutes: 0 },
        end: { hours: 0, minutes: 0 },
      },
    },
    {
      timeRange: {
        end: { hours: 0, minutes: 0 },
        start: { hours: 0, minutes: 0 },
      },
      ymd: { month: 3, date: 12, year: toSafeUint(2021) },
    },
    {
      ymd: { year: toSafeUint(2021), date: 17, month: 3 },
      timeRange: {
        start: { minutes: 0, hours: 0 },
        end: { minutes: 0, hours: 0 },
      },
    },
  ],
  notes: 'bbb https://www.google.com/　あああ\n',
  title: 'aaaaa1',
  answerDeadline: {
    hours: 23,
    date: 28,
    year: toSafeUint(2021),
    minutes: 59,
    month: 11,
  },
  notificationSettings: {
    notify07daysBeforeAnswerDeadline: false,
    notify14daysBeforeAnswerDeadline: false,
    email: '',
    notify03daysBeforeAnswerDeadline: false,
    notifyOnAnswerChange: true,
    notify01daysBeforeAnswerDeadline: false,
    notify28daysBeforeAnswerDeadline: false,
  },
  timezoneOffsetMinutes: -540,
  datetimeSpecification: 'startSpecified',
} as const;

const answersExampleV2: readonly AnswerV2[] = [
  {
    id: 'SLuMolYBthCjcHCnvW24' as AnswerId,
    createdAt: 1_624_732_632_134,
    userName: 'Carol' as UserName,
    comment: '',
    isRequiredParticipants: false,
    useWeight: true,
    weight: 0.6 as Weight,
    selection: [
      {
        iconId: 'handmade-triangle',
        datetimeRange: {
          ymd: { month: 3, date: 9, year: toSafeUint(2021) },
          timeRange: {
            end: { minutes: 0, hours: 0 },
            start: { hours: 0, minutes: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { date: 12, year: toSafeUint(2021), month: 3 },
          timeRange: {
            start: { hours: 0, minutes: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-cross',
        datetimeRange: {
          ymd: { month: 3, year: toSafeUint(2021), date: 17 },
          timeRange: {
            end: { minutes: 0, hours: 0 },
            start: { minutes: 0, hours: 0 },
          },
        },
      },
    ],
  },
  {
    id: 'YWTREKVx4Wf4owicQBoc' as AnswerId,
    createdAt: 1_615_363_320_667,
    userName: 'Bob' as UserName,
    comment: '',
    isRequiredParticipants: true,
    useWeight: false,
    weight: 1 as Weight,
    selection: [
      {
        iconId: 'handmade-triangle',
        datetimeRange: {
          ymd: { date: 9, year: toSafeUint(2021), month: 3 },
          timeRange: {
            end: { hours: 0, minutes: 0 },
            start: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { month: 3, year: toSafeUint(2021), date: 12 },
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { year: toSafeUint(2021), date: 17, month: 3 },
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
    ],
  },
  {
    id: 'brTRiK8cUgFtmGcBJW5q' as AnswerId,
    createdAt: 1_615_279_702_147,
    userName: 'Alice' as UserName,
    comment: '',
    isRequiredParticipants: false,
    useWeight: false,
    weight: 1 as Weight,
    selection: [
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { year: toSafeUint(2021), date: 9, month: 3 },
          timeRange: {
            start: { hours: 0, minutes: 0 },
            end: { hours: 0, minutes: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { month: 3, date: 12, year: toSafeUint(2021) },
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-triangle',
        datetimeRange: {
          ymd: { date: 17, month: 3, year: toSafeUint(2021) },
          timeRange: {
            end: { hours: 0, minutes: 0 },
            start: { hours: 0, minutes: 0 },
          },
        },
      },
    ],
  },
] as const;

const answersExampleV3: readonly AnswerV3[] = [
  {
    id: 'SLuMolYBthCjcHCnvW24' as AnswerId,
    createdAt: 1_624_732_632_134,
    userName: 'Carol' as UserName,
    comment: '',
    isRequiredParticipants: false,
    useWeight: true,
    weight: 0.6 as Weight,
    selection: [
      {
        iconId: 'fair',
        point: 6,
        datetimeRange: {
          ymd: { month: 3, date: 9, year: toSafeUint(2021) },
          timeRange: {
            end: { minutes: 0, hours: 0 },
            start: { hours: 0, minutes: 0 },
          },
        },
      },
      {
        iconId: 'good',
        point: 10,
        datetimeRange: {
          ymd: { date: 12, year: toSafeUint(2021), month: 3 },
          timeRange: {
            start: { hours: 0, minutes: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'poor',
        point: 0,
        datetimeRange: {
          ymd: { month: 3, year: toSafeUint(2021), date: 17 },
          timeRange: {
            end: { minutes: 0, hours: 0 },
            start: { minutes: 0, hours: 0 },
          },
        },
      },
    ],
  },
  {
    id: 'YWTREKVx4Wf4owicQBoc' as AnswerId,
    createdAt: 1_615_363_320_667,
    userName: 'Bob' as UserName,
    comment: '',
    isRequiredParticipants: true,
    useWeight: false,
    weight: 1 as Weight,
    selection: [
      {
        iconId: 'fair',
        point: 6,
        datetimeRange: {
          ymd: { date: 9, year: toSafeUint(2021), month: 3 },
          timeRange: {
            end: { hours: 0, minutes: 0 },
            start: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'good',
        point: 10,
        datetimeRange: {
          ymd: { month: 3, year: toSafeUint(2021), date: 12 },
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'good',
        point: 10,
        datetimeRange: {
          ymd: { year: toSafeUint(2021), date: 17, month: 3 },
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
    ],
  },
  {
    id: 'brTRiK8cUgFtmGcBJW5q' as AnswerId,
    createdAt: 1_615_279_702_147,
    userName: 'Alice' as UserName,
    comment: '',
    isRequiredParticipants: false,
    useWeight: false,
    weight: 1 as Weight,
    selection: [
      {
        iconId: 'good',
        point: 10,
        datetimeRange: {
          ymd: { year: toSafeUint(2021), date: 9, month: 3 },
          timeRange: {
            start: { hours: 0, minutes: 0 },
            end: { hours: 0, minutes: 0 },
          },
        },
      },
      {
        iconId: 'good',
        point: 10,
        datetimeRange: {
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
          ymd: { month: 3, date: 12, year: toSafeUint(2021) },
        },
      },
      {
        iconId: 'fair',
        point: 6,
        datetimeRange: {
          timeRange: {
            end: { hours: 0, minutes: 0 },
            start: { hours: 0, minutes: 0 },
          },
          ymd: { date: 17, month: 3, year: toSafeUint(2021) },
        },
      },
    ],
  },
] as const;

console.log(
  eventScheduleExampleV2,
  eventScheduleExampleV3,
  answersExampleV2,
  answersExampleV3,
);
