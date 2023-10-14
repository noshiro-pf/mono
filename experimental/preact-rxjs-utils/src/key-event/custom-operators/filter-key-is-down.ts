import type { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const filterKeyIsDown =
  (): OperatorFunction<
    readonly ['down' | 'up', Readonly<KeyboardEvent>],
    Readonly<KeyboardEvent>
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]>,
  ): Observable<Readonly<KeyboardEvent>> =>
    keyEvents$.pipe(
      filter(([du, _ev]) => du === 'down'),
      map(([_, ev]) => ev),
    );
