import {
  firebaseConfig,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import firebaseJson from '../firebase.json';
import { isDevelopment, useEmulators } from './env';
import { clog } from './utils';

const fbApp = initializeApp(firebaseConfig);

clog('firebase.initializeApp done.');

const firestore = initializeFirestore(fbApp, {
  ignoreUndefinedProperties: true,
  // https://zenn.dev/cauchye/articles/20210816_yutaro-elk
  experimentalForceLongPolling: Object.hasOwn(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion, unicorn/prefer-global-this
    window as unknown as UnknownRecord,
    'Cypress',
  ),
});
// if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
//   const host = 'localhost';
//   const port = firebaseJson.emulators.firestore.port;
//   // db.useEmulator(host, port);
//   db.settings({ host: `${host}:${port}`, ssl: false });
//   clog(`using firestore emulator. (${host}:${port})`);
// }

export const firestoreEvents = collection(firestore, firestorePaths.events);

export const fbAuth = getAuth();

export const googleAuthProvider = new GoogleAuthProvider();

export const fbFunctions = getFunctions(fbApp, 'asia-northeast2');

if (isDevelopment && useEmulators) {
  connectFirestoreEmulator(
    firestore,
    'localhost',
    firebaseJson.emulators.firestore.port,
  );

  connectFunctionsEmulator(
    fbFunctions,
    'localhost',
    firebaseJson.emulators.functions.port,
  );

  // connectAuthEmulator(
  //   auth,
  //   `localhost:${firebaseJson.emulators.auth.port.toString()}`
  // );
}
