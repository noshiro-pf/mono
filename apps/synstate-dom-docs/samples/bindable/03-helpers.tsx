import { debounce, withInitialValue } from 'synstate';
import {
  derive,
  mapBindable,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';

type SearchSummaryProps = Readonly<{
  query: Bindable<string>;
  hits: Bindable<number>;
}>;

export const SearchSummary = ({
  query,
  hits,
}: SearchSummaryProps): JSX.Element => {
  // A constant `hits` gives a constant, an observable a `map` node, and a view
  // a composed view.
  const hitsLabel = mapBindable(hits, (n) => (n === 1 ? '1 hit' : `${n} hits`));

  // All constants: `fn` runs once and the result is a constant.
  // Otherwise: `combine` and `map`.
  const heading = derive([query, hits], (q, n) =>
    n === 0 ? `Nothing for "${q}"` : `Results for "${q}"`,
  );

  // Only where an observable is really needed: here, to apply an operator.
  const settledQuery = toObservable(query)
    .pipe(debounce(300))
    .pipe(withInitialValue(''));

  return (
    <header>
      <h2>{heading}</h2>
      <p>{hitsLabel}</p>
      <small>{settledQuery}</small>
    </header>
  );
};
