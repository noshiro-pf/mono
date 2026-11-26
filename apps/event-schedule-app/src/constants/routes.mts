import { defineRoutes, param, search } from 'synstate-router';
import { dict } from './dictionary/index.mjs';

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
 * page. Each page's `meta.title` is the document's title while it is shown; a
 * URL that names no page keeps the title of `index.html`.
 */
export const routes = defineRoutes({
  root: { segment: '' },
  create: { meta: { title: dict.pageTitle.create } },
  event: {
    page: false,
    children: {
      answer: {
        params: { eventId: param.string },
        search: answerTableSearch,
        meta: { title: dict.pageTitle.answer },
        children: { edit: { meta: { title: dict.pageTitle.edit } } },
      },
    },
  },
  eventList: {
    segment: 'event-list',
    meta: { title: dict.pageTitle.eventList },
  },
  register: { meta: { title: dict.pageTitle.register } },
  signIn: { meta: { title: dict.pageTitle.signIn } },
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
