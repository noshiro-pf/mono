import { KeyboardEventType } from '@mono/react-utils';
import { Alphabet } from '@mono/ts-utils';
import { OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from './map-to-target-key-is-down';

export const mapToTargetAlphabetKeyIsDown = (
  key: Alphabet
): OperatorFunction<['down' | 'up', KeyboardEventType], boolean> =>
  mapToTargetKeyIsDown(key);
