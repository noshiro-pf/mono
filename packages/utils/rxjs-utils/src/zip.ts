import type { Observable, ObservableInput } from 'rxjs';
import { zip } from 'rxjs';
import type { Unwrap } from './unwrap';

export const zipTyped = zip as <T extends readonly ObservableInput<unknown>[]>(
  ...observables: T
) => Observable<Unwrap<T>>;
