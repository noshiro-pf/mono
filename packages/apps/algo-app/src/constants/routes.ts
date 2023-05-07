export const routes = {
  main: '/',
  createRoom: '/create',
  rooms: '/rooms',
} as const;

export const params = {
  playerId: 'player-id',
  replay: 'replay',
  observe: 'observe',
} as const;

// eslint-disable-next-line security/detect-non-literal-regexp
const getRoomIdRegexp = new RegExp(
  `^${routes.rooms}/(?<roomId>[^/]+)/.*$`,
  'u'
);

export const getRoomId = (path: string): string | undefined =>
  getRoomIdRegexp.exec(path)?.groups?.['roomId'];

export const isMainPage = (path: string): boolean =>
  path === routes.main || path === withSlash(routes.createRoom);

export const getParams = (
  queryParams: DeepReadonly<URLSearchParams>
): DeepReadonly<{
  playerId: string | undefined;
  replay: boolean;
  observe: boolean;
}> => ({
  playerId: queryParams.get(params.playerId) ?? undefined,
  replay: queryParams.get(params.replay) === 'true',
  observe: queryParams.get(params.observe) === 'true',
});
