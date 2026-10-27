import { Result } from 'ts-data-forge';

/**
 * The records among `docs` that validate, in creation order, with a warning
 * for each one that does not. An invalid document is skipped rather than
 * failing the whole collection: one bad record — written by hand, or by a
 * future version — should not take every other one off the screen.
 */
export const readValidDocs = <
  T extends Readonly<{ createdAt: number; id: string }>,
>(
  docs: readonly Readonly<{ id: string; data: unknown }>[],
  fromDoc: (id: string, data: unknown) => Result<T, readonly string[]>,
  warn: (message: string) => void,
): readonly T[] =>
  docs
    .flatMap(({ id, data }) => {
      const result = fromDoc(id, data);

      if (Result.isErr(result)) {
        warn(`Skipped an invalid document "${id}": ${result.value.join('; ')}`);

        return [];
      }

      return [result.value];
    })
    .toSorted((a, b) =>
      a.createdAt === b.createdAt
        ? a.id < b.id
          ? -1
          : a.id > b.id
            ? 1
            : 0
        : a.createdAt - b.createdAt,
    );
