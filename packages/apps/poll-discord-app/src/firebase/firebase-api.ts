import * as t from '@noshiro/io-ts';
import {
  DateUtils,
  mapOptional,
  match,
  noop,
  pipe,
  Result,
  Str,
} from '@noshiro/ts-utils';
import * as firestore from 'firebase/firestore';
import {
  pollFromJson,
  pollToJson,
  toPollId,
  toTimestamp,
  type AnswerType,
  type CommandMessageId,
  type DateOptionId,
  type Poll,
  type PollId,
  type UserId,
} from '../types';
import { firestoreApp } from './initialize-firebase';

const pollsCollection = firestore.collection(firestoreApp, 'polls');

const dateToPollIdMapCollection = firestore.collection(
  firestoreApp,
  'dateOptionIdToPollIdMap'
);

const commandMessageIdToPollIdMapCollection = firestore.collection(
  firestoreApp,
  'commandMessageIdToPollIdMap'
);

const valueType = t.record({
  value: t.union({
    types: [t.string(''), t.undefinedType],
    defaultType: t.undefinedType,
  }),
});

const getPollIdByCommandMessageId = (
  commandMessageId: CommandMessageId
): Promise<Result<PollId | undefined, string>> =>
  Result.fromPromise(
    firestore
      .getDoc(
        firestore.doc(commandMessageIdToPollIdMapCollection, commandMessageId)
      )
      .then((d) => d.data())
  ).then((result) =>
    Result.fold(
      result,
      (data) =>
        pipe(data)
          .chain(valueType.fill)
          .chain((o) => o.value)
          .chainOptional(toPollId).value,
      Str.from
    )
  );

const setPollIdForCommandMessageId = (
  commandMessageId: CommandMessageId,
  pollId: PollId
): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.setDoc(
      firestore.doc(commandMessageIdToPollIdMapCollection, commandMessageId),
      {
        value: pollId,
      }
    )
  ).then((result) => Result.fold(result, noop, Str.from));

const getPollIdByDateOptionId = (
  dateOptionId: DateOptionId
): Promise<Result<PollId | undefined, string>> =>
  Result.fromPromise(
    firestore
      .getDoc(firestore.doc(dateToPollIdMapCollection, dateOptionId))
      .then((d) => d.data())
  ).then((result) =>
    Result.fold(
      result,
      (data) =>
        pipe(data)
          .chain(valueType.fill)
          .chain((o) => o.value)
          .chainOptional(toPollId).value,
      Str.from
    )
  );

const setPollIdForDateOptionIds = async (
  dateOptionIds: readonly DateOptionId[],
  pollId: PollId
): Promise<Result<void, string>> => {
  try {
    const batch = firestore.writeBatch(firestoreApp);

    for (const dateOptionId of dateOptionIds) {
      batch.set(firestore.doc(dateToPollIdMapCollection, dateOptionId), {
        value: pollId,
      });
    }

    await batch.commit();

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(Str.from(error));
  }
};

const setPoll = (poll: Poll): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.setDoc(firestore.doc(pollsCollection, poll.id), pollToJson(poll))
  ).then((result) => Result.fold(result, noop, Str.from));

const getPollById = (
  pollId: PollId
): Promise<Result<Poll | undefined, string>> =>
  Result.fromPromise(
    firestore
      .getDoc(firestore.doc(pollsCollection, pollId))
      .then((d) => d.data())
  ).then((result) =>
    Result.fold(result, (d) => mapOptional(d, pollFromJson), Str.from)
  );

const updatePollTitle = (
  pollId: PollId,
  title: Poll['title']
): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.updateDoc(firestore.doc(pollsCollection, pollId), { title })
  ).then((a) => Result.fold(a, noop, Str.from));

const updatePollUpdatedAt = (pollId: PollId): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.updateDoc(firestore.doc(pollsCollection, pollId), {
      updatedAt: toTimestamp(DateUtils.now()),
    })
  ).then((a) => Result.fold(a, noop, Str.from));

const updateMessageReaction = (
  pollId: PollId,
  dateOptionId: DateOptionId,
  answerType: AnswerType,
  userId: UserId,
  actionType: 'add' | 'remove'
): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.updateDoc(firestore.doc(pollsCollection, pollId), {
      [['answers', dateOptionId, answerType].join('.')]: match(actionType, {
        add: firestore.arrayUnion(userId),
        remove: firestore.arrayRemove(userId),
      }),
    })
  ).then((a) => Result.fold(a, noop, Str.from));

export const firestoreApi = {
  getPollIdByCommandMessageId,
  setPollIdForCommandMessageId,
  getPollIdByDateOptionId,
  setPollIdForDateOptionIds,
  setPoll,
  getPollById,
  updatePollTitle,
  updatePollUpdatedAt,
  updateMessageReaction,
} as const;
