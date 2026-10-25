/**
 * The Firebase web app's configuration. Public by design — it names the
 * project, it does not grant anything: what a signed-in user may read and
 * write is decided by `firestore.rules`, and which sites may sign in by the
 * project's authorized domains.
 *
 * No `measurementId`: Analytics is not used.
 */
export const firebaseConfig = {
  // cspell:disable-next-line -- a generated key, not words
  apiKey: 'AIzaSyDsyJv_WzrGHTJ0cOSXOF_d8Ry75RhbOpY',
  authDomain: 'life-plan-simulator-9eab3.firebaseapp.com',
  projectId: 'life-plan-simulator-9eab3',
  storageBucket: 'life-plan-simulator-9eab3.firebasestorage.app',
  messagingSenderId: '57635195877',
  appId: '1:57635195877:web:64154c60e4c0a9a83abd0c',
} as const;
