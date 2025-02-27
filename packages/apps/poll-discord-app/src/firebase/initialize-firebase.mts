import { initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';
import firebaseJson from '../../firebase.json' with { type: 'json' };
import { isDev, useEmulators } from '../env.mjs';
import { firebaseConfig } from './config.mjs';

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
