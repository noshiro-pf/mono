import { Routes } from '../constants';

const router_ = createRouter();

const pathSegments$: InitializedObservable<readonly string[]> =
  router_.state.chain(map((state) => state.pathSegments));

const pageToBack$ = router_.state.chain(pluck('pathname')).chain(
  filter((pathname) => {
    const pathSegments = router_.utils.splitToPathSegments(pathname);

    return (
      // ログインページ・新規登録ページは除外
      !Routes.isRoute.registerPage(pathSegments) &&
      !Routes.isRoute.signInPage(pathSegments)
    );
  }),
);

export const Router = {
  ...router_,
  pathSegments$,
  pageToBack$,

  isRoute: {
    createPage$: pathSegments$
      .chain(map(Routes.isRoute.createPage))
      .chain(skipIfNoChange()),
    answerPage$: pathSegments$
      .chain(map(Routes.isRoute.answerPage))
      .chain(skipIfNoChange()),
    editPage$: pathSegments$
      .chain(map(Routes.isRoute.editPage))
      .chain(skipIfNoChange()),
    eventListPage$: pathSegments$
      .chain(map(Routes.isRoute.eventListPage))
      .chain(skipIfNoChange()),
    registerPage$: pathSegments$
      .chain(map(Routes.isRoute.registerPage))
      .chain(skipIfNoChange()),
    signInPage$: pathSegments$
      .chain(map(Routes.isRoute.signInPage))
      .chain(skipIfNoChange()),
  },
  eventId$: pathSegments$
    .chain(map(Routes.getEventIdFromPathname))
    .chain(skipIfNoChange()),

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

Router.state.subscribe(({ pathname }) => {
  const to = Routes.redirectRules.get(pathname);
  if (to !== undefined) {
    Router.redirect(to);
  }
});
