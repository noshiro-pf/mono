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
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { convertRoomToRoomRemote } from '../types/index.mjs';
import { parseActionDocs } from './parse-action-docs.mjs';
import { parseRoomDoc } from './parse-room-doc.mjs';
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
    addAction: async (roomId, { id, action }) => {
      await setDoc(
        doc(firestore, paths.rooms, roomId, paths.actions, id),
        action,
      );
    },
    watchRoom: (roomId, onChange) =>
      onSnapshot(doc(firestore, paths.rooms, roomId), (d) => {
        const parsed = parseRoomDoc(d.id, d.data());

        // A document that is not a room is reported and the room kept as it
        // was: it is there, so it is not missing.
        if (Result.isErr(parsed)) {
          console.error(parsed.value);

          return;
        }

        onChange(parsed.value);
      }),
    watchActions: (roomId, onChange) =>
      onSnapshot(
        query(
          collection(firestore, paths.rooms, roomId, paths.actions),
          orderBy('timestamp'),
        ),
        (q) => {
          onChange(
            parseActionDocs(q.docs, (id, reason) => {
              console.error(
                `rooms/${roomId}/actions/${id} is not an action, and is skipped: ${reason}`,
              );
            }),
          );
        },
      ),
  };
};

const paths = {
  rooms: 'rooms',
  actions: 'actions',
} as const;
