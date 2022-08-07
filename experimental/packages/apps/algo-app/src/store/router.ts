import { Routes } from '../constants';

const router_ = createRouter();

const toPathnameTokens = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');

const pathnameTokens$: InitializedObservable<readonly string[]> = router_.state
  .chain(pluck('pathname'))
  .chain(map(toPathnameTokens));

export const router = {
  ...router_,
  pathnameTokens$,

  isRoute: {
    mainPage$: pathnameTokens$
      .chain(map(Routes.isRoute.mainPage))
      .chain(skipIfNoChange()),
    createRoomPage$: pathnameTokens$
      .chain(map(Routes.isRoute.createRoomPage))
      .chain(skipIfNoChange()),
    roomsPage$: pathnameTokens$
      .chain(map(Routes.isRoute.roomsPage))
      .chain(skipIfNoChange()),
  },

  roomId$: pathnameTokens$
    .chain(map(Routes.getRoomIdFromPathname))
    .chain(skipIfNoChange()),

  playerId$: router_.state.chain(
    map(
      ({ searchParams }) =>
        searchParams.get(Routes.queryParamKeys.playerId) ?? undefined,
    ),
  ),

  isSpectatorMode$: router_.state.chain(
    map(
      ({ searchParams }) =>
        searchParams.get(Routes.queryParamKeys.spectator) === 'true',
    ),
  ),

  isReplayMode$: router_.state.chain(
    map(
      ({ searchParams }) =>
        searchParams.get(Routes.queryParamKeys.replay) === 'true',
    ),
  ),
} as const;

export const useShowPage = (): Readonly<{
  mainPage: boolean;
  createRoomPage: boolean;
  roomsPage: boolean;
}> => {
  const mainPage = useObservableValue(router.isRoute.mainPage$);
  const createRoomPage = useObservableValue(router.isRoute.createRoomPage$);
  const roomsPage = useObservableValue(router.isRoute.roomsPage$);

  return {
    mainPage,
    createRoomPage,
    roomsPage,
  };
};

router.state.subscribe(({ pathname }) => {
  const to = Routes.redirectRules.get(pathname);
  console.log({ pathname, to });
  if (to !== undefined) {
    router.redirect(to);
  }
});
