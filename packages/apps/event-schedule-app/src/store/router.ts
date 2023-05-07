import { Routes } from '../constants';

const _router = createRouter();

const toPathSegments = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');

const pathSegments$: InitializedObservable<readonly string[]> =
  _router.pathname$.chain(mapI(toPathSegments));

const pageToBack$ = _router.pathname$.chain(
  filter((pathname) => {
    const pathSegments = toPathSegments(pathname);
    // ログインページ・新規登録ページは除外
    return (
      !Routes.isRoute.registerPage(pathSegments) &&
      !Routes.isRoute.signInPage(pathSegments)
    );
  })
);

export const router = {
  ..._router,
  pathSegments$,
  pageToBack$,

  isRoute: {
    createPage$: pathSegments$
      .chain(mapI(Routes.isRoute.createPage))
      .chain(distinctUntilChangedI()),
    answerPage$: pathSegments$
      .chain(mapI(Routes.isRoute.answerPage))
      .chain(distinctUntilChangedI()),
    editPage$: pathSegments$
      .chain(mapI(Routes.isRoute.editPage))
      .chain(distinctUntilChangedI()),
    eventListPage$: pathSegments$
      .chain(mapI(Routes.isRoute.eventListPage))
      .chain(distinctUntilChangedI()),
    registerPage$: pathSegments$
      .chain(mapI(Routes.isRoute.registerPage))
      .chain(distinctUntilChangedI()),
    signInPage$: pathSegments$
      .chain(mapI(Routes.isRoute.signInPage))
      .chain(distinctUntilChangedI()),
  },
  eventId$: pathSegments$
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
