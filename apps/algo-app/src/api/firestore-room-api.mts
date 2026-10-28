import { initializeApp, type FirebaseOptions } from 'firebase/app';
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
import type { DeepReadonly } from 'ts-type-forge';
import {
  assertIsGameStateAction,
  assertIsRoomRemote,
  convertRoomRemoteToRoom,
  convertRoomToRoomRemote,
  type GameStateAction,
} from '../types/index.mjs';
import type { RoomApi } from './room-api.mjs';

/** Connects to Firestore; called once, from `store/store.mts`. */
export const createFirestoreRoomApi = (
  config: DeepReadonly<FirebaseOptions>,
): RoomApi => {
  const firestore = getFirestore(initializeApp(config));

  return {
    addRoom: async (room) => {
      const res = await addDoc(
        collection(firestore, paths.rooms),
        convertRoomToRoomRemote(room),
      );

      return res.id;
    },
    addPlayer: (roomId, player) =>
      updateDoc(doc(firestore, paths.rooms, roomId), {
        players: arrayUnion(player),
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
    watchActions: (roomId, onChange) =>
      onSnapshot(
        query(
          collection(firestore, paths.rooms, roomId, paths.actions),
          orderBy('timestamp'),
        ),
        (q) => {
          const mut_actions: GameStateAction[] = [];

          for (const d of q.docs) {
            const data = d.data();

            assertIsGameStateAction(data);

            mut_actions.push(data);
          }

          onChange(mut_actions);
        },
      ),
  };
};

const paths = {
  rooms: 'rooms',
  actions: 'actions',
} as const;
