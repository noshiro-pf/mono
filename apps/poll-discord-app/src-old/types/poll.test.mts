import { IMap } from 'ts-data-forge';
import type { AnswerOfDate } from './answer-of-date.mjs';
import {
  timestampType,
  toPollId,
  toTitleMessageId,
  type DateOptionId,
} from './branded-types.mjs';
import { pollFromJson } from './poll.mjs';

describe('default value', () => {
  test(pollFromJson, () => {
    assert.deepStrictEqual(pollFromJson(), {
      id: toPollId(''),
      title: '',
      // `Timestamp`'s default is the time the module was loaded, not 0.
      updatedAt: timestampType.defaultValue,
      dateOptions: [],
      answers: IMap.create<DateOptionId, AnswerOfDate>([]),
      titleMessageId: toTitleMessageId(''),
    });
  });
});
