import * as firestore from 'firebase/firestore';
import { Result, pipe, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
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
} from '../types/index.mjs';
import { DateUtils, mapOptional, match, noop } from '../utils/index.mjs';
import { firestoreApp } from './initialize-firebase.mjs';

const pollsCollection = firestore.collection(firestoreApp, 'polls');

const dateToPollIdMapCollection = firestore.collection(
  firestoreApp,
  'dateOptionIdToPollIdMap',
);

const commandMessageIdToPollIdMapCollection = firestore.collection(
  firestoreApp,
  'commandMessageIdToPollIdMap',
);

const valueType = t.record({
  value: t.union([t.string(''), t.undefinedType], {
    defaultType: t.undefinedType,
  }),
});

const getPollIdByCommandMessageId = (
  commandMessageId: CommandMessageId,
): Promise<Result<PollId | undefined, string>> =>
  Result.fromPromise(
    firestore
      .getDoc(
        firestore.doc(commandMessageIdToPollIdMapCollection, commandMessageId),
      )
      .then((d) => d.data()),
  ).then(
    Result.fold(
      (data) =>
        pipe(data)
          .map(valueType.fill)
          .map((o) => o.value)
          .map((v) => mapOptional(v, toPollId)).value,
      unknownToString,
    ),
  );

const setPollIdForCommandMessageId = (
  commandMessageId: CommandMessageId,
  pollId: PollId,
): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.setDoc(
      firestore.doc(commandMessageIdToPollIdMapCollection, commandMessageId),
      {
        value: pollId,
      },
    ),
  ).then(Result.fold(noop, unknownToString));

const getPollIdByDateOptionId = (
  dateOptionId: DateOptionId,
): Promise<Result<PollId | undefined, string>> =>
  Result.fromPromise(
    firestore
      .getDoc(firestore.doc(dateToPollIdMapCollection, dateOptionId))
      .then((d) => d.data()),
  ).then(
    Result.fold(
      (data) =>
        pipe(data)
          .map(valueType.fill)
          .map((o) => o.value)
          .map((v) => mapOptional(v, toPollId)).value,
      unknownToString,
    ),
  );

const setPollIdForDateOptionIds = async (
  dateOptionIds: readonly DateOptionId[],
  pollId: PollId,
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
    return Result.err(unknownToString(error));
  }
};

const setPoll = (poll: Poll): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.setDoc(firestore.doc(pollsCollection, poll.id), pollToJson(poll)),
  ).then(Result.fold(noop, unknownToString));

const getPollById = (
  pollId: PollId,
): Promise<Result<Poll | undefined, string>> =>
  Result.fromPromise(
    firestore
      .getDoc(firestore.doc(pollsCollection, pollId))
      .then((d) => d.data()),
  ).then(Result.fold((d) => mapOptional(d, pollFromJson), unknownToString));

const updatePollTitle = (
  pollId: PollId,
  title: Poll['title'],
): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.updateDoc(firestore.doc(pollsCollection, pollId), { title }),
  ).then(Result.fold(noop, unknownToString));

const updatePollUpdatedAt = (pollId: PollId): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.updateDoc(firestore.doc(pollsCollection, pollId), {
      updatedAt: toTimestamp(DateUtils.now()),
    }),
  ).then(Result.fold(noop, unknownToString));

const updateMessageReaction = (
  pollId: PollId,
  dateOptionId: DateOptionId,
  answerType: AnswerType,
  userId: UserId,
  actionType: 'add' | 'remove',
): Promise<Result<void, string>> =>
  Result.fromPromise(
    firestore.updateDoc(firestore.doc(pollsCollection, pollId), {
      [['answers', dateOptionId, answerType].join('.')]: match(actionType, {
        add: firestore.arrayUnion(userId),
        remove: firestore.arrayRemove(userId),
      }),
    }),
  ).then(Result.fold(noop, unknownToString));

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
