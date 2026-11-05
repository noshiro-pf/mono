import { type InitializedObservable, map } from 'synstate';
import { constant, inlineMap, type JSX } from 'synstate-dom';
import { Link, type ProductListValues } from '../routes.mjs';

type Props = Readonly<{
  list$: InitializedObservable<ProductListValues>;
  sort: 'name' | 'price';
}>;

/** Sorts the list by `sort` from its first page; current while it does. */
export const SortLink = ({ list$, sort }: Props): JSX.Element => (
  <Link
    aria-current={inlineMap(list$, (list) =>
      list.search.sort === sort ? 'true' : undefined,
    )}
    to={list$.pipe(map((list) => list.withSearch({ sort, page: undefined })))}
  >
    {constant(sort)}
  </Link>
);
