import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  initializeFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import {
  assertIsPlayerWithId,
  assertIsRoomRemote,
  convertRoomRemoteToRoom,
  convertRoomToRoomRemote,
  keyForOrderingPlayers,
  type Player,
  type PlayerWithId,
  type RoomRemote,
} from '../types/index.mjs';
import { parseActionDocs } from './parse-action-docs.mjs';
import type { RoomApi } from './room-api.mjs';

/**
 * Connects to Firestore; called once, from `store/store.mts`. With `emulator`,
 * to the local emulator (`pnpm run emulators`) instead.
 */
export const createFirestoreRoomApi = (
  config: DeepReadonly<FirebaseOptions>,
  options?: Readonly<{
    emulator?: Readonly<{ host: string; port: number }>;
  }>,
): RoomApi => {
  const firestore = initializeFirestore(initializeApp(config), {
    ignoreUndefinedProperties: true,
  });

  if (options?.emulator !== undefined) {
    connectFirestoreEmulator(
      firestore,
      options.emulator.host,
      options.emulator.port,
    );
  }

  return {
    addRoom: async (room) => {
      const res = await addDoc(
        collection(firestore, paths.rooms),
        convertRoomToRoomRemote(room),
      );

      return res.id;
    },
    addPlayer: async (roomId, playerName) => {
      const player: Player = {
        name: playerName,
        online: true,
        createdAt: serverTimestamp(),
      };

      const res = await addDoc(
        collection(firestore, paths.rooms, roomId, paths.players),
        player,
      );

      return res.id;
    },
    removePlayer: (roomId, playerId) =>
      deleteDoc(doc(firestore, paths.rooms, roomId, paths.players, playerId)),
    updateRoomState: (roomId, state) =>
      updateDoc(doc(firestore, paths.rooms, roomId), {
        [roomFields.state]: state,
      }),
    updateShuffleDef: (roomId, shuffleDef) =>
      updateDoc(doc(firestore, paths.rooms, roomId), {
        [roomFields.shuffleDef]: shuffleDef,
      }),
    addAction: async (roomId, action) => {
      await addDoc(
        collection(firestore, paths.rooms, roomId, paths.actions),
        action,
      );
    },
    watchRoom: (roomId, onChange) =>
      onSnapshot(doc(firestore, paths.rooms, roomId), (d) => {
        const data = d.data();

        assertIsRoomRemote(data);

        onChange(convertRoomRemoteToRoom(data, d.id));
      }),
    watchPlayers: (roomId, onChange) =>
      onSnapshot(
        query(
          collection(firestore, paths.rooms, roomId, paths.players),
          orderBy(keyForOrderingPlayers),
        ),
        (q) => {
          onChange(
            q.docs.map((d): PlayerWithId => {
              const data: unknown = { ...d.data(), id: d.id };

              assertIsPlayerWithId(data);

              return data;
            }),
          );
        },
      ),
    watchActions: (roomId, onChange) =>
      onSnapshot(
        query(
          collection(firestore, paths.rooms, roomId, paths.actions),
          orderBy('timestamp'),
        ),
        (q) => {
          onChange(parseActionDocs(q.docs));
        },
      ),
  };
};

const paths = {
  rooms: 'rooms',
  actions: 'actions',
  players: 'players',
} as const;

/** The fields of a room that are updated on their own. */
const roomFields = {
  state: 'state',
  shuffleDef: 'shuffleDef',
} as const satisfies ReadonlyRecord<string, keyof RoomRemote>;
