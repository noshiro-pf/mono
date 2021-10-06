import {
  addAnswer,
  addEventSchedule,
  deleteAnswer,
  getAnswers,
  getEventSchedule,
  updateAnswer,
  updateEventSchedule,
} from './crud';

export const api = {
  event: {
    add: addEventSchedule,
    get: getEventSchedule,
    update: updateEventSchedule,
  },
  answers: {
    add: addAnswer,
    getList: getAnswers,
    update: updateAnswer,
    delete: deleteAnswer,
  },
} as const;
