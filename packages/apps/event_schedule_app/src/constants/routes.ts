import {
  IMap,
  isArrayOfLength1,
  isArrayOfLength2,
  isArrayOfLength3,
} from '@noshiro/ts-utils';

const pathToken = {
  createPage: 'create',
  answerPage: 'event',
  editPageSuffix: 'edit',
  registerUser: 'register',
  signIn: 'signIn',
} as const;

export const routes = {
  createPage: `/${pathToken.createPage}/`,

  answerPage: (eventId: string) => `/${pathToken.answerPage}/${eventId}/`,

  editPage: (eventId: string) =>
    `/${pathToken.answerPage}/${eventId}/${pathToken.editPageSuffix}/`,

  registerPage: `/${pathToken.registerUser}/`,
  signInPage: `/${pathToken.signIn}/`,
} as const;

export const isRoute = {
  createPage: (pathnameTokens: readonly string[]): boolean =>
    isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.createPage,

  answerPage: (pathnameTokens: readonly string[]): boolean =>
    isArrayOfLength2(pathnameTokens) &&
    pathnameTokens[0] === pathToken.answerPage,

  editPage: (pathnameTokens: readonly string[]): boolean =>
    isArrayOfLength3(pathnameTokens) &&
    pathnameTokens[0] === pathToken.answerPage &&
    pathnameTokens[2] === pathToken.editPageSuffix,

  registerPage: (pathnameTokens: readonly string[]): boolean =>
    isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.registerUser,

  signInPage: (pathnameTokens: readonly string[]): boolean =>
    isArrayOfLength1(pathnameTokens) && pathnameTokens[0] === pathToken.signIn,
} as const;

export const redirectRules = IMap.new<string, string>([
  ['/', routes.createPage],
]);

export const getEventIdFromPathname = (
  pathnameTokens: readonly string[]
): string | undefined => pathnameTokens[1];
