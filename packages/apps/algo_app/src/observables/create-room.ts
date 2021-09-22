import type { InitializedObservable } from '@noshiro/syncflow';
import {
  map,
  mapTo,
  merge,
  subject,
  switchMap,
  timer,
  withInitialValue,
} from '@noshiro/syncflow';

const createRoom$ = subject<Readonly<{ username: string; password: string }>>();

export const response$ = createRoom$
  .chain(switchMap(() => timer(3000)))
  .chain(map(() => ({ id: 'aaaa' })));

export const isWaitingResponse$: InitializedObservable<boolean> = merge([
  createRoom$.chain(mapTo(true)),
  response$.chain(mapTo(false)),
] as const).chain(withInitialValue(false));

export const onCreateRoomClick = (username: string, password: string): void => {
  createRoom$.next({
    username,
    password,
  });
};
