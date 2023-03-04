import { DateUtils, Json, Obj, pipe, Result } from '@noshiro/ts-utils';
import { psqlRowType } from './constants';
import { psql } from './postgre-sql';
import {
  databaseFromJson,
  databaseToJson,
  toTimestamp,
  type AnswerOfDate,
  type AnswerType,
  type CommandMessageId,
  type Database,
  type DatabaseMutRef,
  type DatabaseRef,
  type DateOptionId,
  type Poll,
  type PsqlClient,
  type UserId,
} from './types';

export const addPoll = (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  poll: Poll,
  messageId: CommandMessageId
): Promise<Result<undefined, JSONValue>> =>
  setDatabase(
    databaseRef,
    psqlClient,
    pipe(databaseRef.db)
      .chain((db) =>
        Obj.update(db, 'polls', (polls) => polls.set(poll.id, poll))
      )
      .chain((db) =>
        Obj.update(db, 'dateToPollIdMap', (dateToPollIdMap) =>
          dateToPollIdMap.withMutations(
            poll.dateOptions.map((d) => ({
              type: 'set',
              key: d.id,
              value: poll.id,
            }))
          )
        )
      )
      .chain((db) =>
        Obj.update(db, 'commandMessageIdToPollIdMap', (map) =>
          map.set(messageId, poll.id)
        )
      ).value
  );

export const updatePoll = (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  poll: Poll
): Promise<Result<undefined, JSONValue>> =>
  setDatabase(
    databaseRef,
    psqlClient,
    Obj.update(databaseRef.db, 'polls', (polls) => polls.set(poll.id, poll))
  );

const getPollByDateId = (
  databaseRef: DatabaseRef,
  dateOptionId: DateOptionId
): Result<Poll, string> => {
  const pollId = databaseRef.db.dateToPollIdMap.get(dateOptionId);
  if (pollId === undefined) {
    return Result.err(`pollId for "${dateOptionId}" not found.`);
  }
  const curr = databaseRef.db.polls.get(pollId);
  if (curr === undefined) {
    return Result.err(`poll with id ${pollId} not found.`);
  }

  return Result.ok(curr);
};

export const updateVote = async (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  dateOptionId: DateOptionId,
  userId: UserId,
  action: Readonly<{ type: 'add' | 'remove'; value: AnswerType }>
): Promise<Result<Poll, string>> => {
  const pollResult = getPollByDateId(databaseRef, dateOptionId);
  if (Result.isErr(pollResult)) return Result.err('');
  const curr = pollResult.value;

  const next = pipe(curr)
    .chain((poll) => Obj.set(poll, 'updatedAt', toTimestamp(DateUtils.now())))
    .chain((poll) =>
      Obj.update(poll, 'answers', (answers) =>
        answers.update(dateOptionId, (answerOfDate): AnswerOfDate => {
          switch (action.type) {
            case 'add':
              return Obj.update(answerOfDate, action.value, (set) =>
                set.add(userId)
              );
            case 'remove': {
              return Obj.update(answerOfDate, action.value, (set) =>
                set.delete(userId)
              );
            }
          }
        })
      )
    ).value;

  const pollId = curr.id;

  const res = await setDatabase(
    databaseRef,
    psqlClient,
    Obj.update(databaseRef.db, 'polls', (polls) => polls.set(pollId, next))
  );
  if (Result.isErr(res)) {
    return Result.err(
      `setDatabase failed. ${Result.unwrapThrow(Json.stringify(res.value))}`
    );
  }
  return Result.ok(next);
};

const setDatabase = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_ref: DatabaseMutRef,
  psqlClient: PsqlClient,
  next: Database
): Promise<Result<undefined, JSONValue>> => {
  mut_ref.db = next;
  return psql.setJsonData(psqlClient, databaseToJson(next));
};

export const initializeInMemoryDatabase = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_ref: DatabaseMutRef,
  psqlClient: PsqlClient
): Promise<Result<undefined, Error>> => {
  const res = await psql.getJsonData(psqlClient);
  if (Result.isErr(res)) return res;

  mut_ref.db = databaseFromJson(res.value[psqlRowType.data]);
  return Result.ok(undefined);
};
