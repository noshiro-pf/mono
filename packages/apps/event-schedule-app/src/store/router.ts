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
  }),
);

export const Router = {
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

  useShowPage: (): Readonly<{
    createPage: boolean;
    answerPage: boolean;
    editPage: boolean;
    eventListPage: boolean;
    registerPage: boolean;
    signInPage: boolean;
  }> => {
    const createPage = useObservableValue(Router.isRoute.createPage$);
    const answerPage = useObservableValue(Router.isRoute.answerPage$);
    const editPage = useObservableValue(Router.isRoute.editPage$);
    const eventListPage = useObservableValue(Router.isRoute.eventListPage$);
    const registerPage = useObservableValue(Router.isRoute.registerPage$);
    const signInPage = useObservableValue(Router.isRoute.signInPage$);

    return {
      createPage,
      answerPage,
      editPage,
      eventListPage,
      registerPage,
      signInPage,
    };
  },
} as const;

Router.state$.subscribe(({ pathname }) => {
  const to = Routes.redirectRules.get(pathname);
  if (to !== undefined) {
    Router.redirect(to);
  }
});
