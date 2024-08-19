import { initializeApp } from 'firebase/app';
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
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore';
import { firebaseConfig } from '../constants';
import { newRoom } from '../functions';
import {
  assertIsGameStateAction,
  assertIsRoomRemote,
  convertRoomRemoteToRoom,
  convertRoomToRoomRemote,
  type GameStateAction,
  type Player,
  type Room,
} from '../types';

const { state: roomId$, setState: setRoomId } = createState<string | undefined>(
  undefined,
);

const { state: room$, setState: setRoom } = createState<Room | undefined>(
  undefined,
);

const [actionsFromDb$, _setActionsFromDb] =
  createEventEmitter<readonly GameStateAction[]>();

const fbApp = initializeApp(firebaseConfig);

const firestore = getFirestore();

const paths = {
  rooms: 'rooms',
  actions: 'actions',
  players: 'players',
} as const;

const { state: myName$, setState: setMyName } = createState<string | undefined>(
  undefined,
);

const addAction = (
  roomId: string,
  localAction: GameStateAction,
): Promise<Result<DocumentReference, unknown>> =>
  Result.fromPromise(
    addDoc(
      collection(firestore, paths.rooms, roomId, paths.actions),
      localAction,
    ),
  );

const addPlayer = (
  roomId: string,
  username: string,
): Promise<Result<void, unknown>> => {
  const ref: DocumentReference = doc(firestore, paths.rooms, roomId);

  const player: Player = {
    name: username,
    online: true,
  };

  return Result.fromPromise(
    updateDoc(ref, {
      players: arrayUnion(player),
    }),
  );
};

const createRoom = async ({
  username,
  password,
}: Readonly<{
  username: string;
  password: string | undefined;
}>): Promise<Room> => {
  const room = newRoom(password, { name: username, online: true });
  const res = await addDoc(
    collection(firestore, paths.rooms),
    convertRoomToRoomRemote(room),
  );

  const id = res.id;

  return { ...room, id };
};

export const db = {
  setRoomId,
  room$,
  actionsFromDb$,
  fbApp,
  paths,
  firestore,
  myName$,
  setMyName,
  addAction,
  addPlayer,
  createRoom,
} as const;

const mut_unsubscribe: {
  room: Unsubscribe | undefined;
  actions: Unsubscribe | undefined;
} = {
  room: undefined,
  actions: undefined,
};

roomId$.subscribe((roomId) => {
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
    orderBy('timestamp'),
  );

  mut_unsubscribe.room = onSnapshot(roomDoc, (d) => {
    const data = d.data();
    assertIsRoomRemote(data);
    setRoom(convertRoomRemoteToRoom(data, d.id));
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
