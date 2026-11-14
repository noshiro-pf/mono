import { Arr, asUint32 } from 'ts-data-forge';
import {
  listVariablesWith,
  type RepoVariable,
} from './list-variables-with.mjs';

/** A variable named `VAR_<n>`, `n` zero-padded so names sort as numbers do. */
const variableNamed = (n: number): RepoVariable =>
  ({
    name: `VAR_${n.toString().padStart(2, '0')}`,
    value: `value-${n}`,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }) as const;

/**
 * A page reader over `count` variables in reverse name order, recording what it
 * was asked for. Its pages are of the size asked, up to 30 (GitHub's documented
 * maximum for this endpoint).
 */
const readerOf = (
  count: number,
): Readonly<{
  fetchPage: (
    page: number,
    perPage: number,
  ) => Promise<readonly RepoVariable[]>;
  requested: readonly (readonly [page: number, perPage: number])[];
}> => {
  const all = Arr.seq(asUint32(count))
    .map((i) => variableNamed(i + 1))
    .toReversed();

  const mut_requested: (readonly [page: number, perPage: number])[] = [];

  return {
    fetchPage: (page, perPage) => {
      mut_requested.push([page, perPage]);

      const size = Math.min(perPage, 30);

      return Promise.resolve(all.slice((page - 1) * size, page * size));
    },
    requested: mut_requested,
  };
};

describe(listVariablesWith, () => {
  test('reads every page of 65 variables and sorts them by name', async () => {
    const reader = readerOf(65);

    const variables = await listVariablesWith(reader.fetchPage);

    assert.deepStrictEqual(
      variables.map((v) => v.name),
      Arr.seq(asUint32(65)).map((i) => variableNamed(i + 1).name),
    );

    assert.deepStrictEqual(reader.requested, [
      [1, 30],
      [2, 30],
      [3, 30],
    ]);
  });

  test('asks for one more, empty page when the last one is full', async () => {
    const reader = readerOf(30);

    const variables = await listVariablesWith(reader.fetchPage);

    assert.strictEqual(variables.length, 30);

    assert.deepStrictEqual(reader.requested, [
      [1, 30],
      [2, 30],
    ]);
  });

  test('gives none after one request when there are none', async () => {
    const reader = readerOf(0);

    const variables = await listVariablesWith(reader.fetchPage);

    assert.deepStrictEqual(variables, []);

    assert.deepStrictEqual(reader.requested, [[1, 30]]);
  });
});
