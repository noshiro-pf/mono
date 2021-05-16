import type { KeyboardEventType } from '@noshiro/react-utils';
import { useKeyEventListener } from '@noshiro/react-utils';
import { filterNotUndefined, mergeTyped } from '@noshiro/rxjs-utils';
import { tuple } from '@noshiro/ts-utils';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { useStateAsStream } from '../rxjs-hooks';

export const useKeyEventAsStream = (): Observable<
  readonly ['down' | 'up', KeyboardEventType]
> => {
  const [
    //
    onKeyDown$,
    onKeyDown,
  ] = useStateAsStream<KeyboardEventType | undefined>(undefined);

  const [
    //
    onKeyUp$,
    onKeyUp,
  ] = useStateAsStream<KeyboardEventType | undefined>(undefined);

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
