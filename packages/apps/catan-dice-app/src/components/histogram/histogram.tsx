import { HistogramView } from './histogram-view';

const domain = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type Props = Readonly<{
  sumCount: ArrayOfLength<11, SafeUint>;
}>;

export const Histogram = memoNamed<Props>('Histogram', ({ sumCount }) => {
  const xy = useMemo(() => Arr.zip(domain, sumCount), [sumCount]);
  const mx = useMemo(() => Arr.max(sumCount), [sumCount]);
  const numSample = useMemo(() => sumCount.reduce(SafeUint.add, 0), [sumCount]);
  return <HistogramView max={mx} numSample={numSample} xy={xy} />;
});
