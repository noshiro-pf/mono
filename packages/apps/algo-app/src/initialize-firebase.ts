import { initializeApp } from 'firebase/app';
import {
  collection,
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';
import firebaseJson from '../firebase.json';
import { firebaseConfig, firestorePaths } from './constants';
import { isDevelopment } from './env';

const fbApp = initializeApp(firebaseConfig);
if (isDevelopment) {
  console.log('firebase.initializeApp done.');
}

export const firestore = initializeFirestore(fbApp, {
  ignoreUndefinedProperties: true,
  // https://zenn.dev/cauchye/articles/20210816_yutaro-elk
  experimentalForceLongPolling: Object.hasOwn(
    window as unknown as RecordBase,
    'Cypress',
  ),
});

export const firestoreRooms = collection(firestore, firestorePaths.rooms);

if (isDevelopment) {
  connectFirestoreEmulator(
    firestore,
    'localhost',
    firebaseJson.emulators.firestore.port,
  );
}
