import { initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';
import firebaseJson from '../../firebase.json';
import { isDev, useEmulators } from '../env';
import { firebaseConfig } from './config';

const fbApp = initializeApp(firebaseConfig);

console.log('firebase.initializeApp done.');

export const firestoreApp = initializeFirestore(fbApp, {
  ignoreUndefinedProperties: true,
});

if (isDev && useEmulators) {
  connectFirestoreEmulator(
    firestoreApp,
    'localhost',
    firebaseJson.emulators.firestore.port,
  );
}
