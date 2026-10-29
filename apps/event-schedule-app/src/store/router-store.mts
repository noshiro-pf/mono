import {
  filter,
  map,
  pluck,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import {
  createRouter,
  type Router,
  type RouterBrowser,
} from 'tiny-router-observable';
import { Optional } from 'ts-data-forge';
import { Routes } from '../constants/index.mjs';

/**
 * The app's router: the URL, which page it names, and the event id in it.
 * `browser` is the real window when left out; a test hands it
 * `createMemoryBrowser`.
 */
export const createAppRouter = (browser?: RouterBrowser): AppRouter => {
  const router_ = createRouter({
    redirect: (pathname) =>
      Optional.toNullable(Routes.redirectRules.get(pathname)),
    ...(browser === undefined ? {} : { browser }),
  });

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

  const router = {
    ...router_,
    pathSegments$,
    pageToBack$,

    isRoute: {
      createPage$: pathSegments$.pipe(map(Routes.isRoute.createPage)),
      answerPage$: pathSegments$.pipe(map(Routes.isRoute.answerPage)),
      editPage$: pathSegments$.pipe(map(Routes.isRoute.editPage)),
      eventListPage$: pathSegments$.pipe(map(Routes.isRoute.eventListPage)),
      registerPage$: pathSegments$.pipe(map(Routes.isRoute.registerPage)),
      signInPage$: pathSegments$.pipe(map(Routes.isRoute.signInPage)),
    },
    eventId$: pathSegments$.pipe(map(Routes.getEventIdFromPathname)),

    useShowPage: (): Readonly<{
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
    },
  } as const;

  return router;
};

export type AppRouter = Router &
  Readonly<{
    pathSegments$: InitializedObservable<readonly string[]>;
    /**
     * The last pathname that was neither the sign-in nor the register page:
     * where signing in or registering returns to.
     */
    pageToBack$: SynstateObservable<string>;
    isRoute: Readonly<{
      createPage$: InitializedObservable<boolean>;
      answerPage$: InitializedObservable<boolean>;
      editPage$: InitializedObservable<boolean>;
      eventListPage$: InitializedObservable<boolean>;
      registerPage$: InitializedObservable<boolean>;
      signInPage$: InitializedObservable<boolean>;
    }>;
    eventId$: InitializedObservable<string | undefined>;
    useShowPage: () => Readonly<{
      createPage: boolean;
      answerPage: boolean;
      editPage: boolean;
      eventListPage: boolean;
      registerPage: boolean;
      signInPage: boolean;
    }>;
  }>;
