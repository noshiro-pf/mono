import * as t from '@noshiro/io-ts';
import { expectType, IMap, Obj, pipe, tp } from '@noshiro/ts-utils';
import {
  commandMessageIdType,
  dateOptionIdType,
  pollIdType,
  type CommandMessageId,
  type DateOptionId,
  type PollId,
} from './branded-types';
import { pollFromJson, pollJsonType, pollToJson, type Poll } from './poll';

export type Database = Readonly<{
  polls: IMap<PollId, Poll>;
  dateToPollIdMap: IMap<DateOptionId, PollId>;
  commandMessageIdToPollIdMap: IMap<CommandMessageId, PollId>;
}>;

const databaseJsonType = t.record({
  polls: t.keyValueRecord(pollIdType, pollJsonType),
  dateToPollIdMap: t.keyValueRecord(dateOptionIdType, pollIdType),
  commandMessageIdToPollIdMap: t.keyValueRecord(
    commandMessageIdType,
    pollIdType
  ),
});

export type DatabaseJson = t.TypeOf<typeof databaseJsonType>;

expectType<DatabaseJson, JSONType>('<=');

export const databaseDefaultValue: Database = {
  polls: IMap.new<PollId, Poll>([]),
  dateToPollIdMap: IMap.new<DateOptionId, PollId>([]),
  commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>([]),
} as const;

export const databaseFromJson = (o?: unknown): Database =>
  pipe(o)
    .chain(databaseJsonType.fill)
    .chain((p) => ({
      polls: IMap.new<PollId, Poll>(
        Obj.entries(p.polls).map(([k, v]) => tp(k, pollFromJson(v)))
      ),
      dateToPollIdMap: IMap.new<DateOptionId, PollId>(
        Obj.entries(p.dateToPollIdMap)
      ),
      commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>(
        Obj.entries(p.commandMessageIdToPollIdMap)
      ),
    })).value;

export const databaseToJson = (database: Database): DatabaseJson => ({
  polls: Obj.fromEntries(database.polls.map(pollToJson).toEntriesArray()),
  dateToPollIdMap: Obj.fromEntries(database.dateToPollIdMap.toEntriesArray()),
  commandMessageIdToPollIdMap: Obj.fromEntries(
    database.commandMessageIdToPollIdMap.toEntriesArray()
  ),
});
