import { firebaseConfig, firestorePaths } from 'event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  type Auth,
} from 'firebase/auth';
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
import { clog } from '../utils/index.mjs';
import { emulatorEndpoints, firebaseAppOptions } from './emulator-mode.mjs';

/** What the API functions are built on: one of each, made by `initializeFirebase`. */
export type FirebaseHandles = DeepReadonly<{
  firestoreEvents: CollectionReference;
  fbAuth: Auth;
  googleAuthProvider: GoogleAuthProvider;
  fbFunctions: Functions;
}>;

/**
 * Connects to Firebase — to the emulators in a development build, unless
 * `VITE_FIREBASE_EMULATORS` says otherwise (`emulator-mode.mts`). Called once,
 * when the app's API is made.
 */
export const initializeFirebase = (): FirebaseHandles => {
  const emulators = import.meta.env.DEV
    ? emulatorEndpoints(
        import.meta.env.VITE_FIREBASE_EMULATORS,
        document.location.hostname,
        {
          auth: firebaseJson.emulators.auth.port,
          firestore: firebaseJson.emulators.firestore.port,
          functions: firebaseJson.emulators.functions.port,
        },
      )
    : undefined;

  const fbApp = initializeApp(firebaseAppOptions(firebaseConfig, emulators));

  clog('firebase.initializeApp done.');

  const firestore = initializeFirestore(fbApp, {
    ignoreUndefinedProperties: true,
  });

  const fbAuth = getAuth(fbApp);

  const fbFunctions = getFunctions(fbApp, 'asia-northeast2');

  if (emulators !== undefined) {
    connectAuthEmulator(fbAuth, emulators.authUrl, { disableWarnings: true });

    connectFirestoreEmulator(
      firestore,
      emulators.firestore.host,
      emulators.firestore.port,
    );

    connectFunctionsEmulator(
      fbFunctions,
      emulators.functions.host,
      emulators.functions.port,
    );

    clog('Using the Firebase emulators', emulators);
  }

  return {
    firestoreEvents: collection(firestore, firestorePaths.events),
    fbAuth,
    googleAuthProvider: new GoogleAuthProvider(),
    fbFunctions,
  };
};
