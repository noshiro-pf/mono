import * as React from 'react';
import { source, type Source } from 'synstate';

/**
 * A `synstate` source that lives as long as the component that made it.
 *
 * The two hooks that used to sit beside this one — subscribe for an effect,
 * read the latest value — are `useObservableEffect` and `useObservableValue` in
 * `synstate-react-hooks`. Creating the source is the only one of the three with
 * no counterpart there.
 */
export const useObservable = <T,>(): Source<T> =>
  React.useMemo<Source<T>>(source, []);
