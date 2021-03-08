import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { IList } from '../../immutable';
import { HistogramView } from './histogram-view';

const domain = IList<number>([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

const add = (a: number, b: number): number => a + b;

export const Histogram = memoNamed<
  Readonly<{
    sumCount: IList<number>;
  }>
>('Histogram', ({ sumCount }) => {
  const xy = useMemo(() => domain.zip(sumCount), [sumCount]);
  const max = useMemo(() => sumCount.max() ?? 0, [sumCount]);
  const numSample = useMemo(() => sumCount.reduce(add) ?? 0, [sumCount]);
  return <HistogramView xy={xy} max={max} numSample={numSample} />;
});
