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
  fetchEventListOfUser,
  getAnswers,
  getEventSchedule,
  unarchiveEventSchedule,
  updateAnswer,
  updateEventSchedule,
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
    get: getEventSchedule,
    update: updateEventSchedule,
    archive: archiveEventSchedule,
    unarchive: unarchiveEventSchedule,
  },
  answers: {
    add: addAnswer,
    getList: getAnswers,
    update: updateAnswer,
    delete: deleteAnswer,
  },
  eventList: {
    get: fetchEventListOfUser,
  },
} as const;
