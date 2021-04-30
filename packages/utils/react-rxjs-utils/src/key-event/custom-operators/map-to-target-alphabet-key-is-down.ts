import { KeyboardEventType } from '@noshiro/react-utils';
import { Alphabet } from '@noshiro/ts-utils';
import { OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from './map-to-target-key-is-down';

export const mapToTargetAlphabetKeyIsDown = (
  key: Alphabet
): OperatorFunction<readonly ['down' | 'up', KeyboardEventType], boolean> =>
  mapToTargetKeyIsDown(key);
