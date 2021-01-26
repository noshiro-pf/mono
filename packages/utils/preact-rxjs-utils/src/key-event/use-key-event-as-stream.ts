import { useKeyEventListener } from '@mono/preact-utils';
import { filterNotUndefined, mergeTyped } from '@mono/rxjs-utils';
import { tuple } from '@mono/ts-utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { useStateAsStream } from '../rxjs-hooks';

export const useKeyEventAsStream = (): Observable<
  ['down' | 'up', KeyboardEvent]
> => {
  const [
    //
    onKeyDown$,
    onKeyDown,
  ] = useStateAsStream<KeyboardEvent | undefined>(undefined);

  const [
    //
    onKeyUp$,
    onKeyUp,
  ] = useStateAsStream<KeyboardEvent | undefined>(undefined);

  useKeyEventListener(onKeyDown, onKeyUp);

  return mergeTyped(
    onKeyDown$.pipe(
      filterNotUndefined(),
      map((e) => tuple('down' as const, e))
    ),
    onKeyUp$.pipe(
      filterNotUndefined(),
      map((e) => tuple('up' as const, e))
    )
  );
};
