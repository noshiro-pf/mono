import { isNonNullObject, Optional } from 'ts-data-forge';
import type {
  StandardSchemaV1,
  StandardSchemaV1Output,
  StandardSchemaV1Result,
} from './standard-schema.mjs';

/**
 * Reads a history entry's state into a value and writes it back. The state is
 * kept by the browser next to the URL, never in it, and survives back and
 * forward; `encode` returns what the browser stores, so it is a value the
 * structured clone algorithm copies (no functions, no class instances). An
 * entry whose state does not decode reads as having none.
 */
export type HistoryStateCodec<T> = Readonly<{
  decode: (raw: unknown) => Optional<T>;
  encode: (value: T) => unknown;
}>;

const historyStateCustom = <T,>(
  codec: HistoryStateCodec<T>,
): HistoryStateCodec<T> => codec;

const historyStateSchema = <S extends StandardSchemaV1>(
  schema: S,
): HistoryStateCodec<StandardSchemaV1Output<S>> =>
  ({
    decode: (raw) => {
      const result: unknown = schema['~standard'].validate(raw);

      if (isThenable(result)) {
        // A synchronous match cannot wait for it. The rejection is caught so
        // that it does not surface as an unhandled rejection.
        Promise.resolve(result).catch(noop);

        console.error(
          'synstate-router: the schema of a history state validated asynchronously; the state is read as absent',
        );

        return Optional.none;
      }

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `validate` returns when it does not return a Promise
      const sync = result as StandardSchemaV1Result<StandardSchemaV1Output<S>>;

      return sync.issues === undefined
        ? Optional.some(sync.value)
        : Optional.none;
    },
    encode: (value) => value,
  }) as const;

const noop = (): void => {};

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  isNonNullObject(value) && typeof Reflect.get(value, 'then') === 'function';

/**
 * Codecs for the history state a page declares with `state`, which `push` and
 * `replace` write with `{ state }` and the page's match reads back typed.
 *
 * - `historyState.custom({ decode, encode })`: any codec.
 * - `historyState.schema(schema)`: a Standard Schema (Zod, Valibot, ArkType),
 *   validated synchronously; the value is stored as it is.
 */
export const historyState = {
  custom: historyStateCustom,
  schema: historyStateSchema,
} as const;
