import type { Alphabet } from '@noshiro/ts-utils';
import type { MonoTypeOperatorFunction } from 'rxjs';
import { filterTargetKeyEvent } from './filter-target-key-event';

export const filterTargetAlphabetKeyEvent = (
  key: Alphabet,
): MonoTypeOperatorFunction<
  readonly ['down' | 'up', Readonly<KeyboardEvent>]
> => filterTargetKeyEvent(key);
