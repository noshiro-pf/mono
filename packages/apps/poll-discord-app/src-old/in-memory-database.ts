import { psqlRowType } from './constants';
import { psql } from './postgre-sql';
import type {
  AnswerOfDate,
  AnswerType,
  CommandMessageId,
  Database,
  DatabaseMutRef,
  DatabaseRef,
  DateOptionId,
  Poll,
  PsqlClient,
  UserId,
} from './types';
import {
  createTimestamp,
  databaseDefaultValue,
  databaseToJson,
  fillDatabase,
} from './types';

export const addPoll = (
  ref: DatabaseRef,
  psqlClient: PsqlClient,
  poll: Poll,
  messageId: CommandMessageId
): Promise<Result<undefined, ReadonlyJSONValue>> =>
  setDatabase(
    ref,
    psqlClient,
    pipe(ref.db)
      .chain((db) =>
        IRecord.update(db, 'polls', (polls) => polls.set(poll.id, poll))
      )
      .chain((db) =>
        IRecord.update(db, 'dateToPollIdMap', (dateToPollIdMap) =>
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
        IRecord.update(db, 'commandMessageIdToPollIdMap', (map) =>
          map.set(messageId, poll.id)
        )
      ).value
  );

export const updatePoll = (
  ref: DatabaseRef,
  psqlClient: PsqlClient,
  poll: Poll
): Promise<Result<undefined, ReadonlyJSONValue>> =>
  setDatabase(
    ref,
    psqlClient,
    IRecord.update(ref.db, 'polls', (polls) => polls.set(poll.id, poll))
  );

export const getPollByDateId = (
  ref: DatabaseRef,
  dateOptionId: DateOptionId
): Result<Poll, string> => {
  const pollId = ref.db.dateToPollIdMap.get(dateOptionId);
  if (pollId === undefined) {
    return Result.err(`pollId for "${dateOptionId}" not found.`);
  }
  const curr = ref.db.polls.get(pollId);
  if (curr === undefined) {
    return Result.err(`poll with id ${pollId} not found.`);
  }

  return Result.ok(curr);
};

export const updateVote = async (
  ref: DatabaseRef,
  psqlClient: PsqlClient,
  dateOptionId: DateOptionId,
  userId: UserId,
  action: Readonly<{ type: 'add' | 'remove'; value: AnswerType }>
): Promise<Result<Poll, string>> => {
  const pollResult = getPollByDateId(ref, dateOptionId);
  if (Result.isErr(pollResult)) return Result.err('');
  const curr = pollResult.value;

  const next = pipe(curr)
    .chain((poll) =>
      IRecord.set(poll, 'updatedAt', createTimestamp(IDate.now()))
    )
    .chain((poll) =>
      IRecord.update(poll, 'answers', (answers) =>
        answers.update(dateOptionId, (answerOfDate): AnswerOfDate => {
          switch (action.type) {
            case 'add':
              return IRecord.update(answerOfDate, action.value, (set) =>
                set.add(userId)
              );
            case 'remove': {
              return IRecord.update(answerOfDate, action.value, (set) =>
                set.delete(userId)
              );
            }
          }
        })
      )
    ).value;

  const pollId = curr.id;

  const res = await setDatabase(
    ref,
    psqlClient,
    IRecord.update(ref.db, 'polls', (polls) => polls.set(pollId, next))
  );
  if (Result.isErr(res)) {
    return Result.err(
      `setDatabase failed. ${Result.unwrapThrow(Json.stringify(res.value))}`
    );
  }
  return Result.ok(next);
};

const databaseFromJson = (dbJson: unknown): Database =>
  isNonNullObject(dbJson) ? fillDatabase(dbJson) : databaseDefaultValue;

const setDatabase = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_ref: DatabaseMutRef,
  psqlClient: DeepReadonly<PsqlClient>,
  next: Database
): Promise<Result<undefined, ReadonlyJSONValue>> => {
  mut_ref.db = next;
  return psql.setJsonData(psqlClient, databaseToJson(next));
};

export const initializeInMemoryDatabase = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_ref: DatabaseMutRef,
  psqlClient: DeepReadonly<PsqlClient>
): Promise<Result<undefined, Error>> => {
  const res = await psql.getJsonData(psqlClient);
  if (Result.isErr(res)) return res;

  mut_ref.db = databaseFromJson(res.value[psqlRowType.data]);
  return Result.ok(undefined);
};
