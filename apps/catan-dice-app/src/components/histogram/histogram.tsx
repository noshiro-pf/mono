import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Arr, asSafeUint, Optional, SafeUint, tp } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { HistogramView } from './histogram-view.js';

const domain = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type Props = Readonly<{
  sumCount: FixedLengthTuple<11, SafeUint>;
}>;

export const Histogram = memoNamed<Props>('Histogram', ({ sumCount }) => {
  // `.map` rather than `Arr.zip`: `Arr.zip`'s `const` type parameters
  // reconstruct both tuples, and `tsc` gives up with TS2589/TS2590. The view
  // only asks for `readonly (readonly [number, number])[]`.
  const xy = React.useMemo(
    () => domain.map((d, i) => tp(d, sumCount[i] ?? asSafeUint(0))),
    [sumCount],
  );

  // `Arr.max` returns `Optional`; `sumCount` is a fixed 11-tuple so it is
  // always `Some`.
  const mx = React.useMemo(
    () => Optional.unwrapOr(Arr.max(sumCount), asSafeUint(0)),
    [sumCount],
  );

  const numSample = React.useMemo(
    () => sumCount.reduce(SafeUint.add, 0),
    [sumCount],
  );

  return <HistogramView max={mx} numSample={numSample} xy={xy} />;
});
