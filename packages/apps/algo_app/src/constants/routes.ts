export const routes = {
  main: '/',
  createRoom: '/create',
  rooms: '/rooms',
} as const;

export const withSlash = (path: string): string =>
  path.endsWith('/') ? path : `${path}/`;

const getRoomIdRegexp = new RegExp(
  `^${routes.rooms}/(?<roomId>[^/]+)/.*$`,
  'u'
);

export const getRoomId = (path: string): string | undefined =>
  getRoomIdRegexp.exec(path)?.groups?.['roomId'];

export const isMainPage = (path: string): boolean =>
  path === routes.main || path === withSlash(routes.createRoom);
