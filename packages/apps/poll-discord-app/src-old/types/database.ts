import * as t from '@noshiro/io-ts';
import type { Poll } from './poll';
import { fillPoll, pollJsonTypeDef, pollToJson } from './poll';
import type { CommandMessageId, DateOptionId, PollId } from './types';
import {
  commandMessageIdTypeDef,
  createPollId,
  dateOptionIdTypeDef,
  pollIdTypeDef,
} from './types';

const databaseJsonTypeDef = t.record({
  polls: t.keyValueRecord({
    keyType: pollIdTypeDef,
    valueType: pollJsonTypeDef,
  }),
  dateToPollIdMap: t.keyValueRecord({
    keyType: dateOptionIdTypeDef,
    valueType: pollIdTypeDef,
  }),
  commandMessageIdToPollIdMap: t.keyValueRecord({
    keyType: commandMessageIdTypeDef,
    valueType: pollIdTypeDef,
  }),
});

export type DatabaseJson = t.TypeOf<typeof databaseJsonTypeDef>;

assertType<TypeExtends<DatabaseJson, ReadonlyJSONType>>();

export type Database = Readonly<{
  polls: IMap<PollId, Poll>;
  dateToPollIdMap: IMap<DateOptionId, PollId>;
  commandMessageIdToPollIdMap: IMap<CommandMessageId, PollId>;
}>;

export const databaseFromJson = (database: DatabaseJson): Database => ({
  polls: IMap.new<PollId, Poll>(
    Obj.entries(database.polls).map(([k, v]) => [createPollId(k), fillPoll(v)])
  ),
  dateToPollIdMap: IMap.new<DateOptionId, PollId>(
    Obj.entries(database.dateToPollIdMap)
  ),
  commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>(
    Obj.entries(database.commandMessageIdToPollIdMap)
  ),
});

export const databaseToJson = (database: Database): DatabaseJson => ({
  polls: Obj.fromEntries(database.polls.map(pollToJson).toEntriesArray()),
  dateToPollIdMap: Obj.fromEntries(database.dateToPollIdMap.toEntriesArray()),
  commandMessageIdToPollIdMap: Obj.fromEntries(
    database.commandMessageIdToPollIdMap.toEntriesArray()
  ),
});

export const databaseDefaultValue: Database = databaseFromJson(
  databaseJsonTypeDef.defaultValue
);

export const fillDatabase = (o?: unknown): Database =>
  databaseFromJson(databaseJsonTypeDef.fill(o));
