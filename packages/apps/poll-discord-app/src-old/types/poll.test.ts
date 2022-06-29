import { IMap } from '@noshiro/ts-utils';
import type { AnswerOfDate } from './answer-of-date';
import { pollDefaultValue } from './poll';
import type { DateOptionId } from './types';

describe('default value', () => {
  test('pollDefaultValue', () => {
    expect(pollDefaultValue).toStrictEqual({
      id: '',
      title: '',
      updatedAt: 0,
      dateOptions: [],
      answers: IMap.new<DateOptionId, AnswerOfDate>([]),
      titleMessageId: '',
    } as const);
  });
});
