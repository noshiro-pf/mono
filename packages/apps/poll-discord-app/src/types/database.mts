import * as t from '@noshiro/io-ts';
import {
  commandMessageIdType,
  dateOptionIdType,
  pollIdType,
  toCommandMessageId,
  toDateOptionId,
  toPollId,
  type CommandMessageId,
  type DateOptionId,
  type PollId,
} from './branded-types.mjs';
import { pollFromJson, pollJsonType, pollToJson, type Poll } from './poll.mjs';

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
    pollIdType,
  ),
});

export type DatabaseJson = t.TypeOf<typeof databaseJsonType>;

expectType<DatabaseJson, JsonObject>('<=');

export const databaseDefaultValue = {
  polls: IMap.new<PollId, Poll>([]),
  dateToPollIdMap: IMap.new<DateOptionId, PollId>([]),
  commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>([]),
} as const satisfies Database;

export const databaseFromJson = (o?: unknown): Database =>
  pipe(o)
    .chain(databaseJsonType.fill)
    .chain((p) => ({
      polls: IMap.new<PollId, Poll>(
        Object.entries(p.polls).map(([k, v]) => [toPollId(k), pollFromJson(v)]),
      ),
      dateToPollIdMap: IMap.new<DateOptionId, PollId>(
        Object.entries(p.dateToPollIdMap).map(([k, v]) => [
          toDateOptionId(k),
          toPollId(v satisfies PollId | string),
        ]),
      ),
      commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>(
        Object.entries(p.commandMessageIdToPollIdMap).map(([k, v]) => [
          toCommandMessageId(k),
          toPollId(v satisfies PollId | string),
        ]),
      ),
    })).value;

export const databaseToJson = (database: Database): DatabaseJson => ({
  polls: Object.fromEntries(database.polls.map(pollToJson).toEntriesArray()),
  dateToPollIdMap: Object.fromEntries(
    database.dateToPollIdMap.toEntriesArray(),
  ),
  commandMessageIdToPollIdMap: Object.fromEntries(
    database.commandMessageIdToPollIdMap.toEntriesArray(),
  ),
});
