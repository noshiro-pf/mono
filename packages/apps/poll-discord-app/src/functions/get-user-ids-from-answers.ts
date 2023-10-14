import { type Poll, type UserId } from '../types';

export const getUserIdsFromAnswers = (answers: Poll['answers']): ISet<UserId> =>
  ISet.new<UserId>([]).withMutations(
    answers
      .toValuesArray()
      .flatMap((v) => [
        ...v.good.map((id) => ({ type: 'add' as const, key: id })),
        ...v.fair.map((id) => ({ type: 'add' as const, key: id })),
        ...v.poor.map((id) => ({ type: 'add' as const, key: id })),
      ]),
  );
