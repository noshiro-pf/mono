import type { InitializedObservable } from '@noshiro/syncflow';
import { subject, withInitialValue } from '@noshiro/syncflow';
import type { PlayerIndex } from '../../types';

const myPlayerIndexSubject$ = subject<PlayerIndex>();

export const setMyPlayerIndex = (myPlayerIndex: PlayerIndex): void => {
  myPlayerIndexSubject$.next(myPlayerIndex);
};

export const myPlayerIndex$: InitializedObservable<PlayerIndex> =
  myPlayerIndexSubject$.chain(withInitialValue(0));
