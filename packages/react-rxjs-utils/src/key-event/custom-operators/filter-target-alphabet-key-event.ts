import { KeyboardEventType } from '@mono/react-utils';
import { Alphabet } from '@mono/ts-utils';
import { MonoTypeOperatorFunction } from 'rxjs';
import { filterTargetKeyEvent } from './filter-target-key-event';

export const filterTargetAlphabetKeyEvent = (
  key: Alphabet
): MonoTypeOperatorFunction<['down' | 'up', KeyboardEventType]> =>
  filterTargetKeyEvent(key);
