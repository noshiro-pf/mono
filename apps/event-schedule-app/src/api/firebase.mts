import { firebaseConfig, firestorePaths } from 'event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, type Auth } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  initializeFirestore,
  type CollectionReference,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from 'firebase/functions';
import type { DeepReadonly } from 'ts-type-forge';
import firebaseJson from '../../firebase.json' with { type: 'json' };
import { isDevelopment, useEmulators } from '../env.mjs';
import { clog } from '../utils/index.mjs';

/** What the API functions are built on: one of each, made by `initializeFirebase`. */
export type FirebaseHandles = DeepReadonly<{
  firestoreEvents: CollectionReference;
  fbAuth: Auth;
  googleAuthProvider: GoogleAuthProvider;
  fbFunctions: Functions;
}>;

/**
 * Connects to Firebase — to the emulators in development. Called once, when the
 * app's API is made.
 */
export const initializeFirebase = (): FirebaseHandles => {
  const fbApp = initializeApp(firebaseConfig);

  clog('firebase.initializeApp done.');

  const firestore = initializeFirestore(fbApp, {
    ignoreUndefinedProperties: true,
  });

  const fbFunctions = getFunctions(fbApp, 'asia-northeast2');

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

  return {
    firestoreEvents: collection(firestore, firestorePaths.events),
    fbAuth: getAuth(fbApp),
    googleAuthProvider: new GoogleAuthProvider(),
    fbFunctions,
  };
};
