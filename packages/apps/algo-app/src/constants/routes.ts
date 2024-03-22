const pathToken = {
  main: 'main',
  createRoom: 'create',
  rooms: 'rooms',
} as const;

const queryParamKeys = {
  playerId: 'player-id',
  replay: 'replay',
  spectator: 'spectator',
  test: 'test',
} as const;

const routes = {
  main: `/${pathToken.main}/`,
  createRoom: `/${pathToken.createRoom}/`,
  rooms: `/${pathToken.rooms}/`,
  room: (roomId: string) => `/${pathToken.rooms}/${roomId}/`,
  roomWithPlayerId: (roomId: string, playerId: string) =>
    `/${pathToken.rooms}/${roomId}/?${queryParamKeys.playerId}=${playerId}`,
} as const;

const isRoute = {
  mainPage: (pathnameTokens: readonly string[]): boolean =>
    Arr.isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.main,

  createRoomPage: (pathnameTokens: readonly string[]): boolean =>
    Arr.isArrayOfLength1(pathnameTokens) &&
    pathnameTokens[0] === pathToken.createRoom,

  /** PathnameTokens[1] is `room-id` */
  roomsPage: (pathnameTokens: readonly string[]): boolean =>
    Arr.isArrayOfLength2(pathnameTokens) &&
    pathnameTokens[0] === pathToken.rooms,
} as const;

const redirectRules = IMap.new<string, string>([['/', routes.main]]);

const getRoomIdFromPathname = (
  pathnameTokens: readonly string[],
): string | undefined => pathnameTokens[1];

export const Routes = {
  queryParamKeys,
  routes,
  isRoute,
  redirectRules,
  getRoomIdFromPathname,
};
