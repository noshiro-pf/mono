import {
  type InitializedObservable,
  filter,
  map,
  pluck,
  skipIfNoChange,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { createRouter } from 'tiny-router-observable';
import { Optional } from 'ts-data-forge';
import { Routes } from '../constants/index.mjs';

const router_ = createRouter();

const pathSegments$: InitializedObservable<readonly string[]> =
  router_.state.pipe(map((state) => state.pathSegments));

const pageToBack$ = router_.state.pipe(pluck('pathname')).pipe(
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
      .pipe(map(Routes.isRoute.createPage))
      .pipe(skipIfNoChange()),
    answerPage$: pathSegments$
      .pipe(map(Routes.isRoute.answerPage))
      .pipe(skipIfNoChange()),
    editPage$: pathSegments$
      .pipe(map(Routes.isRoute.editPage))
      .pipe(skipIfNoChange()),
    eventListPage$: pathSegments$
      .pipe(map(Routes.isRoute.eventListPage))
      .pipe(skipIfNoChange()),
    registerPage$: pathSegments$
      .pipe(map(Routes.isRoute.registerPage))
      .pipe(skipIfNoChange()),
    signInPage$: pathSegments$
      .pipe(map(Routes.isRoute.signInPage))
      .pipe(skipIfNoChange()),
  },
  eventId$: pathSegments$
    .pipe(map(Routes.getEventIdFromPathname))
    .pipe(skipIfNoChange()),

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
  const to = Optional.toNullable(Routes.redirectRules.get(pathname));

  if (to !== undefined) {
    Router.redirect(to);
  }
});
