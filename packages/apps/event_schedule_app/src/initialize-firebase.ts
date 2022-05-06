import {
  firebaseConfig,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import firebaseJson from '../firebase.json';
import { isDevelopment } from './env';
import { clog } from './utils';

const app = initializeApp(firebaseConfig);

clog('firebase.initializeApp done.');

export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  // https://zenn.dev/cauchye/articles/20210816_yutaro-elk
  experimentalForceLongPolling: hasKey(window, 'Cypress'),
});
// if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
//   const host = 'localhost';
//   const port = firebaseJson.emulators.firestore.port;
//   // db.useEmulator(host, port);
//   db.settings({ host: `${host}:${port}`, ssl: false });
//   clog(`using firestore emulator. (${host}:${port})`);
// }

export const dbEvents = collection(
  db,
  `${firestorePaths.events}${isDevelopment ? '_dev' : ''}`
);

export const auth = getAuth();

export const googleAuthProvider = new GoogleAuthProvider();

export const functions = getFunctions(app);

if (isDevelopment) {
  connectFirestoreEmulator(
    db,
    'localhost',
    firebaseJson.emulators.firestore.port
  );

  connectFunctionsEmulator(
    functions,
    'localhost',
    firebaseJson.emulators.functions.port
  );

  // connectAuthEmulator(
  //   auth,
  //   `localhost:${firebaseJson.emulators.auth.port.toString()}`
  // );
}
