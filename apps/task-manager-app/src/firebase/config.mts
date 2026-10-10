/**
 * The Firebase web app's configuration. Public by design — it names the
 * project, it does not grant anything: what a signed-in user may read and
 * write is decided by `firestore.rules`, and which sites may sign in by the
 * project's authorized domains.
 *
 * No `measurementId`: Analytics is not used.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCfazM0tTAna5TCNVrwEEhLlqGkFiCtSH8',
  authDomain: 'task-manager-app-d0cae.firebaseapp.com',
  projectId: 'task-manager-app-d0cae',
  storageBucket: 'task-manager-app-d0cae.firebasestorage.app',
  messagingSenderId: '1061861340344',
  appId: '1:1061861340344:web:e6d39075b15a536a16f04d',
} as const;
