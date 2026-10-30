import {
  createUser,
  currentUser,
  deleteUser,
  emailCredential,
  googleSignInWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signIn,
  signOut,
  updateDisplayName,
  updateEmail,
  updatePassword,
} from './auth/index.mjs';
import {
  addAnswer,
  addEventSchedule,
  archiveEventSchedule,
  deleteAnswer,
  fetchAnswers,
  fetchEventListOfUser,
  fetchEventSchedule,
  sendReport,
  setAuthorsEmail,
  unarchiveEventSchedule,
  updateAnswer,
  updateEventSchedule,
  verifyEmail,
} from './crud/index.mjs';
import type { FirebaseHandles } from './firebase.mjs';

/**
 * Everything the app asks of Firebase. Nothing outside `src/api/` imports
 * `firebase/*`; it is handed an `Api` instead, and a test hands it a fake.
 */
export type Api = ReturnType<typeof createApi>;

export const createApi = (firebase: FirebaseHandles) =>
  ({
    auth: {
      createUser: createUser(firebase),
      deleteUser,
      reauthenticateWithCredential,
      sendEmailVerification,
      sendPasswordResetEmail: sendPasswordResetEmail(firebase),
      signIn: signIn(firebase),
      signOut: signOut(firebase),
      googleSignInWithPopup: googleSignInWithPopup(firebase),
      onAuthStateChanged: onAuthStateChanged(firebase),
      currentUser: currentUser(firebase),
      emailCredential,
      update: {
        displayName: updateDisplayName,
        email: updateEmail,
        password: updatePassword,
      },
    },
    event: {
      add: addEventSchedule(firebase),
      fetch: fetchEventSchedule(firebase),
      update: updateEventSchedule(firebase),
      archive: archiveEventSchedule(firebase),
      unarchive: unarchiveEventSchedule(firebase),
      setAuthorsEmail: setAuthorsEmail(firebase),
      verifyEmail: verifyEmail(firebase),
    },
    answers: {
      add: addAnswer(firebase),
      fetchList: fetchAnswers(firebase),
      update: updateAnswer(firebase),
      delete: deleteAnswer(firebase),
    },
    eventList: { fetch: fetchEventListOfUser(firebase) },
    sendReport: sendReport(firebase),
  }) as const;
