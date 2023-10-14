import type { KeyboardEventType } from '@noshiro/react-utils';
import type { Alphabet } from '@noshiro/ts-utils';
import type { OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from './map-to-target-key-is-down';

export const mapToTargetAlphabetKeyIsDown = (
  key: Alphabet,
): OperatorFunction<readonly ['down' | 'up', KeyboardEventType], boolean> =>
  mapToTargetKeyIsDown(key);
