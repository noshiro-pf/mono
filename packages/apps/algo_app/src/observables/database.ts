import type { DocumentData, Unsubscribe } from '@firebase/firestore';
import { collection, getFirestore, onSnapshot } from '@firebase/firestore';
import type { Observable } from '@noshiro/syncflow';
import { subject } from '@noshiro/syncflow';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../constants';
import type { GameStateAction } from '../types';

export const fbApp = initializeApp(firebaseConfig);

export const paths = {
  rooms: 'rooms',
  actions: 'actions',
} as const;

export const db = getFirestore();

const roomIdSource$ = subject<string>();

export const roomId$ = roomIdSource$;

export const setRoomId = (nextRoomId: string): void => {
  roomIdSource$.next(nextRoomId);
};

const actionsFromDbSource$ = subject<readonly GameStateAction[]>();

export const actionsFromDb$: Observable<readonly GameStateAction[]> =
  actionsFromDbSource$;

let unsubscribe: Unsubscribe | undefined = undefined;

roomId$.subscribe((roomId) => {
  if (unsubscribe !== undefined) {
    unsubscribe();
  }

  const coll = collection(db, paths.rooms, roomId, paths.actions);

  unsubscribe = onSnapshot(coll, (q) => {
    const actions: DocumentData[] = [];
    q.forEach((d) => {
      actions.push(d.data());
    });

    actionsFromDbSource$.next(actions.map((d) => d as GameStateAction)); // TODO: check type
  });
});
