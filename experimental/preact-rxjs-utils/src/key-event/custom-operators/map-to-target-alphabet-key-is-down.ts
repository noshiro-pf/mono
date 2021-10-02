import type { Alphabet } from '@noshiro/ts-utils';
import type { OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from './map-to-target-key-is-down';

export const mapToTargetAlphabetKeyIsDown = (
  key: Alphabet
): OperatorFunction<
  readonly ['down' | 'up', Readonly<KeyboardEvent>],
  boolean
> => mapToTargetKeyIsDown(key);
