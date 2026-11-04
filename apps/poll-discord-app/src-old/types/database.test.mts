import { IMap } from 'ts-data-forge';
import type {
  CommandMessageId,
  DateOptionId,
  PollId,
} from './branded-types.mjs';
import { databaseDefaultValue, databaseFromJson } from './database.mjs';
import type { Poll } from './poll.mjs';

describe('default value', () => {
  test(databaseFromJson, () => {
    assert.deepStrictEqual(databaseFromJson(), databaseDefaultValue);
  });

  test('databaseDefaultValue', () => {
    assert.deepStrictEqual(databaseDefaultValue, {
      polls: IMap.create<PollId, Poll>([]),
      dateToPollIdMap: IMap.create<DateOptionId, PollId>([]),
      commandMessageIdToPollIdMap: IMap.create<CommandMessageId, PollId>([]),
    });
  });
});
