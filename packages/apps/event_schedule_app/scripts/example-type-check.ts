/* eslint-disable import/no-internal-modules */
import type {
  AnswerId,
  UserName,
  Weight,
} from '@noshiro/event-schedule-app-shared';
import type {
  Answer as AnswerV2,
  EventSchedule as EventScheduleV2,
} from '@noshiro/event-schedule-app-shared/cjs/v2';
import type {
  Answer as AnswerV3,
  EventSchedule as EventScheduleV3,
} from '@noshiro/event-schedule-app-shared/cjs/v3';

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
      ymd: { month: 3, date: 9, year: 2021 },
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
      ymd: { month: 3, date: 12, year: 2021 },
    },
    {
      ymd: { year: 2021, date: 17, month: 3 },
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
    year: 2021,
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
      ymd: { month: 3, date: 9, year: 2021 },
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
      ymd: { month: 3, date: 12, year: 2021 },
    },
    {
      ymd: { year: 2021, date: 17, month: 3 },
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
    year: 2021,
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
    createdAt: 1624732632134,
    userName: 'Carol' as UserName,
    comment: '',
    isRequiredParticipants: false,
    useWeight: true,
    weight: 0.6 as Weight,
    selection: [
      {
        iconId: 'handmade-triangle',
        datetimeRange: {
          ymd: { month: 3, date: 9, year: 2021 },
          timeRange: {
            end: { minutes: 0, hours: 0 },
            start: { hours: 0, minutes: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { date: 12, year: 2021, month: 3 },
          timeRange: {
            start: { hours: 0, minutes: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-cross',
        datetimeRange: {
          ymd: { month: 3, year: 2021, date: 17 },
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
    createdAt: 1615363320667,
    userName: 'Bob' as UserName,
    comment: '',
    isRequiredParticipants: true,
    useWeight: false,
    weight: 1 as Weight,
    selection: [
      {
        iconId: 'handmade-triangle',
        datetimeRange: {
          ymd: { date: 9, year: 2021, month: 3 },
          timeRange: {
            end: { hours: 0, minutes: 0 },
            start: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { month: 3, year: 2021, date: 12 },
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { year: 2021, date: 17, month: 3 },
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
    createdAt: 1615279702147,
    userName: 'Alice' as UserName,
    comment: '',
    isRequiredParticipants: false,
    useWeight: false,
    weight: 1 as Weight,
    selection: [
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { year: 2021, date: 9, month: 3 },
          timeRange: {
            start: { hours: 0, minutes: 0 },
            end: { hours: 0, minutes: 0 },
          },
        },
      },
      {
        iconId: 'handmade-circle',
        datetimeRange: {
          ymd: { month: 3, date: 12, year: 2021 },
          timeRange: {
            start: { minutes: 0, hours: 0 },
            end: { minutes: 0, hours: 0 },
          },
        },
      },
      {
        iconId: 'handmade-triangle',
        datetimeRange: {
          ymd: { date: 17, month: 3, year: 2021 },
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
    createdAt: 1624732632134,
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
          ymd: { month: 3, date: 9, year: 2021 },
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
          ymd: { date: 12, year: 2021, month: 3 },
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
          ymd: { month: 3, year: 2021, date: 17 },
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
    createdAt: 1615363320667,
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
          ymd: { date: 9, year: 2021, month: 3 },
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
          ymd: { month: 3, year: 2021, date: 12 },
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
          ymd: { year: 2021, date: 17, month: 3 },
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
    createdAt: 1615279702147,
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
          ymd: { year: 2021, date: 9, month: 3 },
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
          ymd: { month: 3, date: 12, year: 2021 },
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
          ymd: { date: 17, month: 3, year: 2021 },
        },
      },
    ],
  },
] as const;

console.log(
  eventScheduleExampleV2,
  eventScheduleExampleV3,
  answersExampleV2,
  answersExampleV3
);
