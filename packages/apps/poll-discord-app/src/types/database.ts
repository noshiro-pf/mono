import {
  expectType,
  IMap,
  isNotUndefined,
  mapOptional,
  Obj,
  pipe,
  tp,
} from '@noshiro/ts-utils';
import {
  fillPoll,
  pollToJson,
  type PartialPollJson,
  type Poll,
  type PollJson,
} from './poll';
import {
  createCommandMessageId,
  createDateOptionId,
  createPollId,
  type CommandMessageId,
  type DateOptionId,
  type PollId,
} from './types';

export type Database = Readonly<{
  polls: IMap<PollId, Poll>;
  dateToPollIdMap: IMap<DateOptionId, PollId>;
  commandMessageIdToPollIdMap: IMap<CommandMessageId, PollId>;
}>;

export type DatabaseJson = DeepReadonly<{
  polls: Record<PollId, PollJson>;
  dateToPollIdMap: Record<DateOptionId, PollId>;
  commandMessageIdToPollIdMap: Record<CommandMessageId, PollId>;
}>;

expectType<DatabaseJson, JSONType>('<=');

export type PartialDatabaseJson = Partial<
  Readonly<{
    polls: Record<PollId, PartialPollJson>;
    dateToPollIdMap: Partial<Record<DateOptionId, PollId>>;
    commandMessageIdToPollIdMap: Partial<Record<CommandMessageId, PollId>>;
  }>
>;

export const databaseDefaultValue: Database = {
  polls: IMap.new<PollId, Poll>([]),
  dateToPollIdMap: IMap.new<DateOptionId, PollId>([]),
  commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>([]),
} as const;

const d = databaseDefaultValue;

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const fillDatabase = (p?: PartialDatabaseJson): Database => ({
  polls:
    pipe(p?.polls)
      .chain((polls) => mapOptional(polls, Obj.entries))
      .chain((entries) =>
        mapOptional(entries, (e) =>
          IMap.new<PollId, Poll>(
            e.map(([k, v]) => [createPollId(k), fillPoll(v)])
          )
        )
      ).value ?? d.polls,
  dateToPollIdMap:
    pipe(p?.dateToPollIdMap)
      .chain((a) => mapOptional(a, Obj.entries))
      .chain((a) =>
        mapOptional(a, (entries) =>
          entries
            .filter(
              (
                entry
              ): entry is [(typeof entry)[0], NonNullable<(typeof entry)[1]>] =>
                isNotUndefined(entry[1])
            )
            .map(([k, v]) => tp(createDateOptionId(k), v))
        )
      )
      .chain((a) =>
        mapOptional(a, (entries) => IMap.new<DateOptionId, PollId>(entries))
      ).value ?? d.dateToPollIdMap,
  commandMessageIdToPollIdMap:
    pipe(p?.commandMessageIdToPollIdMap)
      .chain((a) => mapOptional(a, Obj.entries))
      .chain((a) =>
        mapOptional(a, (entries) =>
          entries
            .filter(
              (
                entry
              ): entry is [(typeof entry)[0], NonNullable<(typeof entry)[1]>] =>
                isNotUndefined(entry[1])
            )
            .map(([k, v]) => tp(createCommandMessageId(k), v))
        )
      )
      .chain((a) =>
        mapOptional(a, (entries) => IMap.new<CommandMessageId, PollId>(entries))
      ).value ?? d.commandMessageIdToPollIdMap,
});

export const databaseToJson = (database: Database): DatabaseJson => ({
  polls: Obj.fromEntries(database.polls.map(pollToJson).toEntriesArray()),
  dateToPollIdMap: Obj.fromEntries(database.dateToPollIdMap.toEntriesArray()),
  commandMessageIdToPollIdMap: Obj.fromEntries(
    database.commandMessageIdToPollIdMap.toEntriesArray()
  ),
});
