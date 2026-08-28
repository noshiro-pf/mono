import { ISet } from 'ts-data-forge';
import { type Poll, type UserId } from '../types/index.mjs';

export const getUserIdsFromAnswers = (answers: Poll['answers']): ISet<UserId> =>
  ISet.create<UserId>([]).withMutations(
    answers
      .toValuesArray()
      .flatMap((v) => [...v.good, ...v.fair, ...v.poor])
      .map((id) => ({ type: 'add' as const, key: id })),
  );
