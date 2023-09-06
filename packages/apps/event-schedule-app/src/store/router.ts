import { Routes } from '../constants';

const _router = createRouter();

const pathSegments$: InitializedObservable<readonly string[]> =
  _router.state$.chain(mapI((state) => state.pathSegments));

const pageToBack$ = _router.state$.chain(pluckI('pathname')).chain(
  filter((pathname) => {
    const pathSegments = _router.utils.splitToPathSegments(pathname);

    return (
      // ログインページ・新規登録ページは除外
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

router.state$.subscribe(({ pathname }) => {
  const to = Routes.redirectRules.get(pathname);
  if (to !== undefined) {
    router.redirect(to);
  }
});
