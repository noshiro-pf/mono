import { createRouter } from '@noshiro/tiny-router-observable';
import { getEventIdFromPathname, isRoute, redirectRules } from '../constants';

const _router = createRouter();

const toPathnameTokens = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');

const pathnameTokens$: InitializedObservable<readonly string[]> =
  _router.pathname$.chain(mapI(toPathnameTokens));

const pageToBack$ = _router.pathname$.chain(
  filter((pathname) => {
    const tokens = toPathnameTokens(pathname);
    // ログインページ・新規登録ページは除外
    return !isRoute.registerPage(tokens) && !isRoute.signInPage(tokens);
  })
);

export const router = {
  ..._router,
  pathnameTokens$,
  pageToBack$,

  isRoute: {
    createPage$: pathnameTokens$
      .chain(mapI(isRoute.createPage))
      .chain(distinctUntilChangedI()),
    answerPage$: pathnameTokens$
      .chain(mapI(isRoute.answerPage))
      .chain(distinctUntilChangedI()),
    editPage$: pathnameTokens$
      .chain(mapI(isRoute.editPage))
      .chain(distinctUntilChangedI()),
    eventListPage$: pathnameTokens$
      .chain(mapI(isRoute.eventListPage))
      .chain(distinctUntilChangedI()),
    registerPage$: pathnameTokens$
      .chain(mapI(isRoute.registerPage))
      .chain(distinctUntilChangedI()),
    signInPage$: pathnameTokens$
      .chain(mapI(isRoute.signInPage))
      .chain(distinctUntilChangedI()),
  },
  eventId$: pathnameTokens$
    .chain(mapI(getEventIdFromPathname))
    .chain(distinctUntilChangedI()),
} as const;

export const useShowPage = (): Readonly<{
  createPage: boolean;
  answerPage: boolean;
  editPage: boolean;
  eventListPage: boolean;
  registerPage: boolean;
  signInPage: boolean;
}> => {
  const createPage = useObservableValue(router.isRoute.createPage$);
  const answerPage = useObservableValue(router.isRoute.answerPage$);
  const editPage = useObservableValue(router.isRoute.editPage$);
  const eventListPage = useObservableValue(router.isRoute.eventListPage$);
  const registerPage = useObservableValue(router.isRoute.registerPage$);
  const signInPage = useObservableValue(router.isRoute.signInPage$);

  return {
    createPage,
    answerPage,
    editPage,
    eventListPage,
    registerPage,
    signInPage,
  };
};

router.pathname$.subscribe((pathname) => {
  const to = redirectRules.get(pathname);
  if (to !== undefined) {
    router.redirect(to);
  }
});
