import {
  firebaseConfig,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore';
import { clog } from './utils';
// import firebasejson from '../firebase.json';

initializeApp(firebaseConfig);

clog('firebase.initializeApp done.');

export const db = getFirestore();
// if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
//   const host = 'localhost';
//   const port = firebasejson.emulators.firestore.port;
//   // db.useEmulator(host, port);
//   db.settings({ host: `${host}:${port}`, ssl: false });
//   clog(`using firestore emulator. (${host}:${port})`);
// }

export const dbEvents = collection(db, firestorePaths.events);
