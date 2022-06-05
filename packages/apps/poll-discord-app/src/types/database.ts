import { isRecord } from '@noshiro/ts-utils';
import type { Poll, PollJson } from './poll';
import { fillPoll, pollToJson } from './poll';
import type { CommandMessageId, DateOptionId, PollId } from './types';
import {
  createCommandMessageId,
  createDateOptionId,
  createPollId,
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

assertType<TypeExtends<DatabaseJson, ReadonlyJSONType>>();

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
        polls: IRecord.hasKeyValue(o, 'polls', isRecord)
          ? pipe(o.polls)
              .chainNullable(IRecord.entries)
              .chainNullable((entries) =>
                IMap.new<PollId, Poll>(
                  entries.map(([k, v]) => [createPollId(k), fillPoll(v)])
                )
              ).value ?? d.polls
          : d.polls,

        dateToPollIdMap: IRecord.hasKeyValue(o, 'dateToPollIdMap', isRecord)
          ? pipe(o.dateToPollIdMap)
              .chainNullable(IRecord.entries)
              .chainNullable((entries) =>
                entries
                  .filter((entry): entry is [typeof entry[0], string] =>
                    isString(entry[1])
                  )
                  .map(([k, v]) => tp(createDateOptionId(k), v))
              )
              .chainNullable((entries) =>
                IMap.new<DateOptionId, PollId>(entries)
              ).value ?? d.dateToPollIdMap
          : d.dateToPollIdMap,

        commandMessageIdToPollIdMap: IRecord.hasKeyValue(
          o,
          'commandMessageIdToPollIdMap',
          isRecord
        )
          ? pipe(o.commandMessageIdToPollIdMap)
              .chainNullable(IRecord.entries)
              .chainNullable((entries) =>
                entries
                  .filter((entry): entry is [typeof entry[0], string] =>
                    isString(entry[1])
                  )
                  .map(([k, v]) => tp(createCommandMessageId(k), v))
              )
              .chainNullable((entries) =>
                IMap.new<CommandMessageId, PollId>(entries)
              ).value ?? d.commandMessageIdToPollIdMap
          : d.commandMessageIdToPollIdMap,
      };

export const databaseToJson = (database: Database): DatabaseJson => ({
  polls: IRecord.fromEntries(database.polls.map(pollToJson).toEntriesArray()),
  dateToPollIdMap: IRecord.fromEntries(
    database.dateToPollIdMap.toEntriesArray()
  ),
  commandMessageIdToPollIdMap: IRecord.fromEntries(
    database.commandMessageIdToPollIdMap.toEntriesArray()
  ),
});
