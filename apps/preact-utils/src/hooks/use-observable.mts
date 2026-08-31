import * as Preact from 'preact/hooks';
import { source, type SourceObservable } from 'synstate';

/**
 * A `synstate` source that lives as long as the component that made it.
 *
 * The two hooks that used to sit beside this one — subscribe for an effect,
 * read the latest value — are `useObservableEffect` and `useObservableValue` in
 * `synstate-preact-hooks`. Creating the source is the only one of the three
 * with no counterpart there. This mirrors `apps/react-utils`, which replaced
 * the same `@noshiro/ts-utils` tiny-observable hooks the same way.
 */
export const useObservable = <T,>(): SourceObservable<T> =>
  Preact.useMemo<SourceObservable<T>>(source, []);
