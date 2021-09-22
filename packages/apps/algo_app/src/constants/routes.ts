import type { QueryParams } from '@noshiro/preact-router-utils';
import { withSlash } from '@noshiro/preact-router-utils';

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

const getRoomIdRegexp = new RegExp(
  `^${routes.rooms}/(?<roomId>[^/]+)/.*$`,
  'u'
);

export const getRoomId = (path: string): string | undefined =>
  getRoomIdRegexp.exec(path)?.groups?.['roomId'];

export const isMainPage = (path: string): boolean =>
  path === routes.main || path === withSlash(routes.createRoom);

export const getParams = (
  queryParams: QueryParams
): DeepReadonly<{
  playerId: string | undefined;
  replay: boolean;
  observe: boolean;
}> => ({
  playerId: queryParams.get(params.playerId),
  replay: queryParams.get(params.replay) === 'true',
  observe: queryParams.get(params.observe) === 'true',
});
