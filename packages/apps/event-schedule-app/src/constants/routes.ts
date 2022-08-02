const pathToken = {
  createPage: 'create',
  answerPage: 'event',
  editPageSuffix: 'edit',
  eventListPage: 'event-list',
  registerUser: 'register',
  signIn: 'signIn',
} as const;

export const queryParamKey = {
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

export const queryParamValue = {
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

export const routes = {
  createPage: `/${pathToken.createPage}/`,

  answerPage: (eventId: string) => `/${pathToken.answerPage}/${eventId}/`,

  editPage: (eventId: string) =>
    `/${pathToken.answerPage}/${eventId}/${pathToken.editPageSuffix}/`,

  eventListPage: `/${pathToken.eventListPage}/`,

  registerPage: `/${pathToken.registerUser}/`,
  signInPage: `/${pathToken.signIn}/`,
} as const;

export const isRoute = {
  createPage: (pathnameTokens: readonly string[]): boolean =>
    IList.isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.createPage,

  answerPage: (pathnameTokens: readonly string[]): boolean =>
    IList.isArrayOfLength2(pathnameTokens) &&
    pathnameTokens[0] === pathToken.answerPage,

  editPage: (pathnameTokens: readonly string[]): boolean =>
    IList.isArrayOfLength3(pathnameTokens) &&
    pathnameTokens[0] === pathToken.answerPage &&
    pathnameTokens[2] === pathToken.editPageSuffix,

  eventListPage: (pathnameTokens: readonly string[]): boolean =>
    IList.isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.eventListPage,

  registerPage: (pathnameTokens: readonly string[]): boolean =>
    IList.isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.registerUser,

  signInPage: (pathnameTokens: readonly string[]): boolean =>
    IList.isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.signIn,
} as const;

export const redirectRules = IMap.new<string, string>([
  ['/', routes.createPage],
]);

export const getEventIdFromPathname = (
  pathnameTokens: readonly string[]
): string | undefined => pathnameTokens[1];
