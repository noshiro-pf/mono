import { Routes } from '../constants';

const _router = createRouter();

const toPathnameTokens = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');

const pathnameTokens$: InitializedObservable<readonly string[]> = _router.state$
  .chain(pluckI('pathname'))
  .chain(mapI(toPathnameTokens));

export const router = {
  ..._router,
  pathnameTokens$,

  isRoute: {
    mainPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.mainPage))
      .chain(distinctUntilChangedI()),
    createRoomPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.createRoomPage))
      .chain(distinctUntilChangedI()),
    roomsPage$: pathnameTokens$
      .chain(mapI(Routes.isRoute.roomsPage))
      .chain(distinctUntilChangedI()),
  },

  roomId$: pathnameTokens$
    .chain(mapI(Routes.getRoomIdFromPathname))
    .chain(distinctUntilChangedI()),

  playerId$: _router.state$.chain(
    mapI(
      ({ searchParams }) =>
        searchParams.get(Routes.queryParamKeys.playerId) ?? undefined,
    ),
  ),

  isSpectatorMode$: _router.state$.chain(
    mapI(
      ({ searchParams }) =>
        searchParams.get(Routes.queryParamKeys.spectator) === 'true',
    ),
  ),

  isReplayMode$: _router.state$.chain(
    mapI(
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

router.state$.subscribe(({ pathname }) => {
  const to = Routes.redirectRules.get(pathname);
  console.log({ pathname, to });
  if (to !== undefined) {
    router.redirect(to);
  }
});
