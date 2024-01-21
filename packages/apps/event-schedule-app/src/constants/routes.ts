const pathSegment = {
  createPage: 'create',
  answerPage: 'event',
  editPageSuffix: 'edit',
  eventListPage: 'event-list',
  registerUser: 'register',
  signIn: 'signIn',
} as const;

const queryParamKey = {
  answerTableState: {
    sortBy: 'sort-by',
    sortOrder: 'sort-order',
    score: 'score',
    date: 'date',
    dayOfWeek: 'day',
    filledDateOnly: 'filled-date-only',
    good: 'good',
    fair: 'fair',
    poor: 'poor',
    goodPlusFair: 'good-fair',
    fairPlusPoor: 'fair-poor',
  },
} as const;

const queryParamValue = {
  sortBy: {
    score: 'score',
    date: 'date',
  },
  sortOrder: {
    desc: 'desc',
    asc: 'asc',
  },
  dayAbbrDef: {
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
  filledDateOnlyEnabled: 'true',
} as const;

const routes = {
  createPage: `/${pathSegment.createPage}/`,

  answerPage: (eventId: string) => `/${pathSegment.answerPage}/${eventId}/`,

  editPage: (eventId: string) =>
    `/${pathSegment.answerPage}/${eventId}/${pathSegment.editPageSuffix}/`,

  eventListPage: `/${pathSegment.eventListPage}/`,

  registerPage: `/${pathSegment.registerUser}/`,
  signInPage: `/${pathSegment.signIn}/`,
} as const;

const isRoute = {
  createPage: (pathSegments: readonly string[]): boolean =>
    Arr.isArrayOfLength1(pathSegments) &&
    pathSegments[0] === pathSegment.createPage,

  /** PathSegments[1] is `event-id` */
  answerPage: (pathSegments: readonly string[]): boolean =>
    Arr.isArrayOfLength2(pathSegments) &&
    pathSegments[0] === pathSegment.answerPage,

  /** PathSegments[1] is `event-id` */
  editPage: (pathSegments: readonly string[]): boolean =>
    Arr.isArrayOfLength3(pathSegments) &&
    pathSegments[0] === pathSegment.answerPage &&
    pathSegments[2] === pathSegment.editPageSuffix,

  eventListPage: (pathSegments: readonly string[]): boolean =>
    Arr.isArrayOfLength1(pathSegments) &&
    pathSegments[0] === pathSegment.eventListPage,

  registerPage: (pathSegments: readonly string[]): boolean =>
    Arr.isArrayOfLength1(pathSegments) &&
    pathSegments[0] === pathSegment.registerUser,

  signInPage: (pathSegments: readonly string[]): boolean =>
    Arr.isArrayOfLength1(pathSegments) &&
    pathSegments[0] === pathSegment.signIn,
} as const;

const redirectRules = IMap.new<string, string>([['/', routes.createPage]]);

const getEventIdFromPathname = (
  pathSegments: readonly string[],
): string | undefined => pathSegments[1];

export const Routes = {
  queryParamKey,
  queryParamValue,
  routes,
  isRoute,
  redirectRules,
  getEventIdFromPathname,
} as const;
