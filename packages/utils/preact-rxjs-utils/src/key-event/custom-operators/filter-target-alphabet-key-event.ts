import { Alphabet } from '@mono/ts-utils';
import { MonoTypeOperatorFunction } from 'rxjs';
import { filterTargetKeyEvent } from './filter-target-key-event';

export const filterTargetAlphabetKeyEvent = (
  key: Alphabet
): MonoTypeOperatorFunction<['down' | 'up', KeyboardEvent]> =>
  filterTargetKeyEvent(key);
