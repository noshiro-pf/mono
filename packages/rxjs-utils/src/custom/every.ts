import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { combineLatestTyped } from '../combine-latest';

export const every = (
  ...conditions: readonly Observable<boolean>[]
): Observable<boolean> =>
  combineLatestTyped(conditions).pipe(map((cs) => cs.every((e) => e)));
