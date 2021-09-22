import type { Unsubscribe } from '@firebase/firestore';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from '@firebase/firestore';
import type { Observable } from '@noshiro/syncflow';
import { subject } from '@noshiro/syncflow';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../constants';
import type { GameStateAction, Room } from '../types';
import { assertIsGameStateAction, assertIsRoom } from '../types';

export const fbApp = initializeApp(firebaseConfig);

export const paths = {
  rooms: 'rooms',
  actions: 'actions',
} as const;

export const db = getFirestore();

const roomIdSource$ = subject<string>();

export const roomId$: Observable<string> = roomIdSource$;

export const setRoomId = (nextRoomId: string): void => {
  roomIdSource$.next(nextRoomId);
};

const roomSource$ = subject<Room>();

export const room$: Observable<Room> = roomSource$;

const actionsFromDbSource$ = subject<readonly GameStateAction[]>();

export const actionsFromDb$: Observable<readonly GameStateAction[]> =
  actionsFromDbSource$;

let unsubscribeRoom: Unsubscribe | undefined = undefined;
let unsubscribeActions: Unsubscribe | undefined = undefined;

roomId$.subscribe((roomId) => {
  if (unsubscribeRoom !== undefined) {
    unsubscribeRoom();
  }
  if (unsubscribeActions !== undefined) {
    unsubscribeActions();
  }

  const roomDoc = doc(db, paths.rooms, roomId);

  const coll = query(
    collection(db, paths.rooms, roomId, paths.actions),
    orderBy('timestamp')
  );

  unsubscribeRoom = onSnapshot(roomDoc, (d) => {
    const data = d.data();
    assertIsRoom(data);
    roomSource$.next(data);
  });

  unsubscribeActions = onSnapshot(coll, (q) => {
    const actions: GameStateAction[] = [];
    q.forEach((d) => {
      const data = d.data();
      assertIsGameStateAction(data);
      actions.push(data);
    });

    actionsFromDbSource$.next(actions);
  });
});
