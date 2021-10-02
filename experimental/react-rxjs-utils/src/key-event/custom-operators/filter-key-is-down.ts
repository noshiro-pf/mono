import type { KeyboardEventType } from '@noshiro/react-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const filterKeyIsDown =
  (): OperatorFunction<
    readonly ['down' | 'up', KeyboardEventType],
    KeyboardEventType
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>
  ): Observable<KeyboardEventType> =>
    keyEvents$.pipe(
      filter(([du, _ev]) => du === 'down'),
      map(([_, ev]) => ev)
    );
