import { addAnswer } from './crud/add-answer';
import { addEventSchedule } from './crud/add-event-schedule';
import { deleteAnswer } from './crud/delete-answer';
import { getAnswers } from './crud/get-answers';
import { getEventSchedule } from './crud/get-event-schedule';
import { updateAnswer } from './crud/update-answer';

export const api = {
  event: {
    add: addEventSchedule,
    get: getEventSchedule,
  },
  answers: {
    add: addAnswer,
    getList: getAnswers,
    update: updateAnswer,
    delete: deleteAnswer,
  },
};
