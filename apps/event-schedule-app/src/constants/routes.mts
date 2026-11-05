import { defineRoutes, param, search } from 'synstate-router';

/**
 * The answer table's sort and filters in the answer page's query string, so
 * that a link opens the table as it was. A default is left out of the URL. The
 * edit page, below the answer page, can carry them too; nothing writes them
 * there.
 */
const answerTableSearch = {
  'sort-by': search.literal(['date', 'score'], { default: 'date' }),
  'sort-order': search.literal(['asc', 'desc'], { default: 'asc' }),
  'filled-date-only': search.boolean({ default: false }),
  rank: search.string(),
  score: search.string(),
  /** `YYYY-M-D--YYYY-M-D` */
  date: search.string(),
  /** The days of {@link answerTableQuery.dayAbbr}, joined by `-`. */
  day: search.string(),
  good: search.string(),
  fair: search.string(),
  poor: search.string(),
  'good-fair': search.string(),
  'fair-poor': search.string(),
} as const;

/**
 * The app's pages. `/` names none of its own: the router sends it to the create
 * page.
 */
export const routes = defineRoutes({
  root: { segment: '' },
  create: {},
  event: {
    page: false,
    children: {
      answer: {
        params: { eventId: param.string },
        search: answerTableSearch,
        children: { edit: {} },
      },
    },
  },
  eventList: { segment: 'event-list' },
  register: {},
  signIn: {},
});

/** How the answer table's query values are written. */
export const answerTableQuery = {
  dayAbbr: {
    Sun: 'su',
    Mon: 'mo',
    Tue: 'tu',
    Wed: 'we',
    Thr: 'th',
    Fri: 'fr',
    Sat: 'sa',
  },
  dayElementDelim: '-',
  rangeDelim: '--',
} as const;
