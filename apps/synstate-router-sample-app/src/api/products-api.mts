import { Optional } from 'ts-std-forge';
import type { SafeInt } from 'ts-type-forge';
import { asPageNumber, type PageNumber } from '../page-number.mjs';
import { productTable, type ProductRow } from './database.mjs';

/**
 * `GET /api/products?q&sort&page`: one page of summaries. Filtering, sorting
 * and paging are the server's.
 */
export const fetchProductSummaries = async (
  query: ProductQuery,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a DOM class; `fromAbortablePromise` hands it over as is
  signal: AbortSignal,
): Promise<ProductSummaryPage> =>
  respond(
    `GET /api/products?q=${query.q ?? ''}&sort=${query.sort}&page=${query.page}`,
    signal,
    () => {
      const { q, sort, page } = query;

      const found = productTable
        .filter(
          (p) =>
            q === undefined || p.name.toLowerCase().includes(q.toLowerCase()),
        )
        .toSorted((a, b) =>
          sort === 'price' ? a.price - b.price : a.name.localeCompare(b.name),
        );

      return {
        items: found
          .slice((page - 1) * productsPerPage, page * productsPerPage)
          .map(toSummary),
        lastPage: asPageNumber(
          Math.max(1, Math.ceil(found.length / productsPerPage)),
        ),
      };
    },
  );

/** `GET /api/products/{id}`: none for a 404. */
export const fetchProduct = async (
  id: SafeInt,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a DOM class; `fromAbortablePromise` hands it over as is
  signal: AbortSignal,
): Promise<Optional<ProductDetail>> =>
  respond(`GET /api/products/${id}`, signal, () => {
    const index = productTable.findIndex((p) => p.id === id);

    const row = productTable[index];

    return row === undefined
      ? Optional.none
      : Optional.some({
          ...row,
          next: productTable[index + 1]?.id,
        });
  });

/** What `GET /api/products` returns for each product: enough for the list. */
export type ProductSummary = Readonly<{
  id: SafeInt;
  name: string;
  price: number;
}>;

/** What `GET /api/products/{id}` returns: what the product page needs. */
export type ProductDetail = Readonly<{
  id: SafeInt;
  name: string;
  price: number;
  description: string;
  /** The product after this one, whatever its id. */
  next: SafeInt | undefined;
}>;

export type ProductQuery = Readonly<{
  q: string | undefined;
  sort: 'name' | 'price';
  page: PageNumber;
}>;

export type ProductSummaryPage = Readonly<{
  items: readonly ProductSummary[];
  lastPage: PageNumber;
}>;

const productsPerPage = 3;

/** How long the fake server takes to answer, so that loading shows. */
const latencyMs = 150;

const toSummary = (row: ProductRow): ProductSummary =>
  ({
    id: row.id,
    name: row.name,
    price: row.price,
  }) as const;

/**
 * Answers after `latencyMs`, or rejects as `fetch` does: with an `AbortError`
 * when `signal` aborts, and with what `answer` throws. Each request and its end
 * are logged, so that the console shows the requests a navigation aborts.
 */
const respond = async <A,>(
  request: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a DOM class; `fromAbortablePromise` hands it over as is
  signal: AbortSignal,
  answer: () => A,
): Promise<A> =>
  new Promise<A>((resolve, reject) => {
    const abort = (): void => {
      console.info(`${request}: aborted`);

      reject(new DOMException('The request was aborted.', 'AbortError'));
    };

    if (signal.aborted) {
      abort();

      return;
    }

    console.info(`${request}: sent`);

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);

      let mut_value: A;

      try {
        mut_value = answer();
      } catch (error: unknown) {
        console.info(`${request}: failed`);

        reject(new Error('The fake server failed.', { cause: error }));

        return;
      }

      console.info(`${request}: answered`);

      resolve(mut_value);
    }, latencyMs);

    const onAbort = (): void => {
      clearTimeout(timer);

      abort();
    };

    signal.addEventListener('abort', onAbort, { once: true });
  });
