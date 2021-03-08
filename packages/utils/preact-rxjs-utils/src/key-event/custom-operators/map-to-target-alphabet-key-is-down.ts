import { Alphabet } from '@noshiro/ts-utils';
import { OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from './map-to-target-key-is-down';

export const mapToTargetAlphabetKeyIsDown = (
  key: Alphabet
): OperatorFunction<['down' | 'up', KeyboardEvent], boolean> =>
  mapToTargetKeyIsDown(key);
