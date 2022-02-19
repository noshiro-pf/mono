import {
  firebaseConfig,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, initializeFirestore } from 'firebase/firestore';
import { isDevelopment } from './env';
import { clog } from './utils';
// import firebasejson from '../firebase.json';

const app = initializeApp(firebaseConfig);

clog('firebase.initializeApp done.');

export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});
// if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
//   const host = 'localhost';
//   const port = firebasejson.emulators.firestore.port;
//   // db.useEmulator(host, port);
//   db.settings({ host: `${host}:${port}`, ssl: false });
//   clog(`using firestore emulator. (${host}:${port})`);
// }

export const dbEvents = collection(
  db,
  `${firestorePaths.events}${isDevelopment ? '_dev' : ''}`
);

export const auth = getAuth();
