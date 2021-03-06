import {
  firebaseConfig,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import firebase from 'firebase/app';
import 'firebase/firestore';
import './index.css';
import { clog } from './utils';
// import firebasejson from '../firebase.json';

firebase.initializeApp(firebaseConfig);

clog('firebase.initializeApp done.');

const db = firebase.firestore();
// if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
//   const host = 'localhost';
//   const port = firebasejson.emulators.firestore.port;
//   // db.useEmulator(host, port);
//   db.settings({ host: `${host}:${port}`, ssl: false });
//   clog(`using firestore emulator. (${host}:${port})`);
// }

export const dbEvents = db.collection(firestorePaths.events);
