import {
  createUser,
  deleteUser,
  googleSignInWithPopup,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signIn,
  updateDisplayName,
  updateEmail,
  updatePassword,
} from './auth';
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
} from './crud';

export const api = {
  auth: {
    createUser,
    deleteUser,
    reauthenticateWithCredential,
    sendEmailVerification,
    sendPasswordResetEmail,
    signIn,
    googleSignInWithPopup,
    update: {
      displayName: updateDisplayName,
      email: updateEmail,
      password: updatePassword,
    },
  },
  event: {
    add: addEventSchedule,
    fetch: fetchEventSchedule,
    update: updateEventSchedule,
    archive: archiveEventSchedule,
    unarchive: unarchiveEventSchedule,
    setAuthorsEmail,
    verifyEmail,
  },
  answers: {
    add: addAnswer,
    fetchList: fetchAnswers,
    update: updateAnswer,
    delete: deleteAnswer,
  },
  eventList: {
    fetch: fetchEventListOfUser,
  },
  sendReport,
} as const;
