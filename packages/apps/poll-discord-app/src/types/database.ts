import { isRecord } from '@noshiro/ts-utils';
import { fillPoll, pollToJson, type Poll, type PollJson } from './poll';
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

assertType<TypeExtends<DatabaseJson, JSONType>>();

export const databaseDefaultValue: Database = {
  polls: IMap.new<PollId, Poll>([]),
  dateToPollIdMap: IMap.new<DateOptionId, PollId>([]),
  commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>([]),
} as const;

const d = databaseDefaultValue;

export const fillDatabase = (o?: unknown): Database =>
  o === undefined || !isRecord(o)
    ? d
    : {
        polls: Obj.hasKeyValue(o, 'polls', isRecord)
          ? pipe(o.polls)
              .chainOptional(Obj.entries)
              .chainOptional((entries) =>
                IMap.new<PollId, Poll>(
                  entries.map(([k, v]) => [createPollId(k), fillPoll(v)])
                )
              ).value ?? d.polls
          : d.polls,

        dateToPollIdMap: Obj.hasKeyValue(o, 'dateToPollIdMap', isRecord)
          ? pipe(o.dateToPollIdMap)
              .chainOptional(Obj.entries)
              .chainOptional((entries) =>
                entries
                  .filter((entry): entry is [typeof entry[0], string] =>
                    isString(entry[1])
                  )
                  .map(([k, v]) => tp(createDateOptionId(k), v))
              )
              .chainOptional((entries) =>
                IMap.new<DateOptionId, PollId>(entries)
              ).value ?? d.dateToPollIdMap
          : d.dateToPollIdMap,

        commandMessageIdToPollIdMap: Obj.hasKeyValue(
          o,
          'commandMessageIdToPollIdMap',
          isRecord
        )
          ? pipe(o.commandMessageIdToPollIdMap)
              .chainOptional(Obj.entries)
              .chainOptional((entries) =>
                entries
                  .filter((entry): entry is [typeof entry[0], string] =>
                    isString(entry[1])
                  )
                  .map(([k, v]) => tp(createCommandMessageId(k), v))
              )
              .chainOptional((entries) =>
                IMap.new<CommandMessageId, PollId>(entries)
              ).value ?? d.commandMessageIdToPollIdMap
          : d.commandMessageIdToPollIdMap,
      };

export const databaseToJson = (database: Database): DatabaseJson => ({
  polls: Obj.fromEntries(database.polls.map(pollToJson).toEntriesArray()),
  dateToPollIdMap: Obj.fromEntries(database.dateToPollIdMap.toEntriesArray()),
  commandMessageIdToPollIdMap: Obj.fromEntries(
    database.commandMessageIdToPollIdMap.toEntriesArray()
  ),
});
