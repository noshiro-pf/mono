import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { HistogramView } from './histogram-view';

const domain = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const add = (a: number, b: number): number => a + b;

type Props = Readonly<{
  sumCount: ArrayOfLength<11, number>;
}>;

export const Histogram = memoNamed<Props>('Histogram', ({ sumCount }) => {
  const xy = useMemo(() => IList.zip(domain, sumCount), [sumCount]);
  const mx = useMemo(() => IList.max(sumCount), [sumCount]);
  const numSample = useMemo(() => sumCount.reduce(add, 0), [sumCount]);
  return <HistogramView max={mx} numSample={numSample} xy={xy} />;
});