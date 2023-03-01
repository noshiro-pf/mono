import { IMap } from '@noshiro/ts-utils';
import { databaseDefaultValue } from './database';
import type { Poll } from './poll';
import type { CommandMessageId, DateOptionId, PollId } from './types';

describe('default value', () => {
  test('databaseDefaultValue', () => {
    expect(databaseDefaultValue).toStrictEqual({
      polls: IMap.new<PollId, Poll>([]),
      dateToPollIdMap: IMap.new<DateOptionId, PollId>([]),
      commandMessageIdToPollIdMap: IMap.new<CommandMessageId, PollId>([]),
    } as const);
  });
});
