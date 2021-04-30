import { Alphabet } from '@noshiro/ts-utils';
import { MonoTypeOperatorFunction } from 'rxjs';
import { filterTargetKeyEvent } from './filter-target-key-event';

export const filterTargetAlphabetKeyEvent = (
  key: Alphabet
): MonoTypeOperatorFunction<readonly ['down' | 'up', KeyboardEvent]> =>
  filterTargetKeyEvent(key);
