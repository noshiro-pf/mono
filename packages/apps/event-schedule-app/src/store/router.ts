import { Routes } from '../constants';

const _router = createRouter();

const toPathnameTokens = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');

const pathnameTokens$: InitializedObservable<readonly string[]> =
  _router.pathname$.chain(mapI(toPathnameTokens));

const pageToBack$ = _router.pathname$.chain(
  filter((pathname) => {
    const tokens = toPathnameTokens(pathname);
    // ログインページ・新規登録ページは除外
    return (
      !Routes.isRoute.registerPage(tokens) && !Routes.isRoute.signInPage(tokens)
    );
  })
);

export const router = {
  ..._router,
  pathnameTokens$,
  pageToBack$,

  isRoute: {
    createPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.createPage))
      .chain(distinctUntilChangedI()),
    answerPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.answerPage))
      .chain(distinctUntilChangedI()),
    editPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.editPage))
      .chain(distinctUntilChangedI()),
    eventListPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.eventListPage))
      .chain(distinctUntilChangedI()),
    registerPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.registerPage))
      .chain(distinctUntilChangedI()),
    signInPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.signInPage))
      .chain(distinctUntilChangedI()),
  },
  eventId$: pathnameTokens$
    .chain(mapI(Routes.getEventIdFromPathname))
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
  const to = Routes.redirectRules.get(pathname);
  if (to !== undefined) {
    router.redirect(to);
  }
});
