import { Arr, asUint32 } from 'ts-data-forge';
import { fetchAllReactionUsers } from './fetch-reaction-users.mjs';

/** A reaction's users as Discord pages them: ascending, after the id named. */
const pagesOf =
  (ids: readonly string[]) =>
  (
    options: Readonly<{ limit: number; after?: string }>,
  ): Promise<ReadonlyMap<string, Readonly<{ id: string }>>> => {
    const start =
      options.after === undefined ? 0 : ids.indexOf(options.after) + 1;

    return Promise.resolve(
      new Map(
        ids
          .slice(start, start + options.limit)
          .map((id) => [id, { id }] as const),
      ),
    );
  };

const idsOf = (count: number): readonly string[] =>
  Arr.seq(asUint32(count)).map((i) => (1000 + i).toString());

describe(fetchAllReactionUsers, () => {
  test('reads every page, past the 100 one request returns', async () => {
    const ids = idsOf(250);

    const fetchPage = vi.fn(pagesOf(ids));

    const users = await fetchAllReactionUsers(fetchPage);

    assert.deepStrictEqual(
      users.map(({ id }) => id),
      ids,
    );

    expect(fetchPage).toHaveBeenCalledTimes(3);

    expect(fetchPage).toHaveBeenLastCalledWith({ limit: 100, after: '1199' });
  });

  test('asks once more after a full last page, which comes back empty', async () => {
    const fetchPage = vi.fn(pagesOf(idsOf(100)));

    const users = await fetchAllReactionUsers(fetchPage);

    assert.lengthOf(users, 100);

    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  test('stops on a full page that does not move past the last id', async () => {
    const page = new Map(idsOf(100).map((id) => [id, { id }] as const));

    const fetchPage = vi.fn(() => Promise.resolve(page));

    const users = await fetchAllReactionUsers(fetchPage);

    assert.lengthOf(users, 100);

    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});
