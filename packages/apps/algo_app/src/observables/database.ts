import { createEventEmitter, createState } from '@noshiro/syncflow';
import type { Result } from '@noshiro/ts-utils';
import { promiseToResult } from '@noshiro/ts-utils';
import { initializeApp } from 'firebase/app';
import type { DocumentReference, Unsubscribe } from 'firebase/firestore';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { firebaseConfig } from '../constants';
import { newRoom } from '../functions';
import type { GameStateAction, Player, Room } from '../types';
import {
  assertIsGameStateAction,
  assertIsRoomRemote,
  convertRoomRemoteToRoom,
  convertRoomToRoomRemote,
} from '../types';

const { state$: _roomId$, setState: _setRoomId } = createState<
  string | undefined
>(undefined);

const { state$: _room$, setState: _setRoom } = createState<Room | undefined>(
  undefined
);

const [_actionsFromDb$, _setActionsFromDb] =
  createEventEmitter<readonly GameStateAction[]>();

export namespace db {
  export const fbApp = initializeApp(firebaseConfig);

  export const firestore = getFirestore();

  export const paths = {
    rooms: 'rooms',
    actions: 'actions',
    players: 'players',
  } as const;

  export const setRoomId = _setRoomId;

  export const room$ = _room$;

  export const { state$: myName$, setState: setMyName } = createState<
    string | undefined
  >(undefined);

  export const actionsFromDb$ = _actionsFromDb$;

  export const addAction = (
    roomId: string,
    localAction: GameStateAction
  ): Promise<Result<DocumentReference, unknown>> =>
    promiseToResult(
      addDoc(
        collection(firestore, paths.rooms, roomId, paths.actions),
        localAction
      )
    );

  export const addPlayer = (
    roomId: string,
    username: string
  ): Promise<Result<void, unknown>> => {
    const ref: DocumentReference = doc(firestore, paths.rooms, roomId);

    const player: Player = {
      name: username,
      online: true,
    };

    return promiseToResult(
      updateDoc(ref, {
        players: arrayUnion(player),
      })
    );
  };

  export const createRoom = async ({
    username,
    password,
  }: Readonly<{
    username: string;
    password: string | undefined;
  }>): Promise<Room> => {
    const room = newRoom(password, { name: username, online: true });
    const res = await addDoc(
      collection(firestore, paths.rooms),
      convertRoomToRoomRemote(room)
    );

    const id = res.id;

    return { ...room, id };
  };
}

const mut_unsubscribe: {
  room: Unsubscribe | undefined;
  actions: Unsubscribe | undefined;
} = {
  room: undefined,
  actions: undefined,
};

_roomId$.subscribe((roomId) => {
  if (roomId === undefined) return;

  if (mut_unsubscribe.room !== undefined) {
    mut_unsubscribe.room();
  }
  if (mut_unsubscribe.actions !== undefined) {
    mut_unsubscribe.actions();
  }

  const roomDoc = doc(db.firestore, db.paths.rooms, roomId);

  const actionsColl = query(
    collection(db.firestore, db.paths.rooms, roomId, db.paths.actions),
    orderBy('timestamp')
  );

  mut_unsubscribe.room = onSnapshot(roomDoc, (d) => {
    const data = d.data();
    assertIsRoomRemote(data);
    _setRoom(convertRoomRemoteToRoom(data, d.id));
  });

  mut_unsubscribe.actions = onSnapshot(actionsColl, (q) => {
    const mut_actions: GameStateAction[] = [];
    // eslint-disable-next-line unicorn/no-array-for-each
    q.forEach((d) => {
      const data = d.data();
      assertIsGameStateAction(data);
      mut_actions.push(data);
    });

    _setActionsFromDb(mut_actions);
  });
});
