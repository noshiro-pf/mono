/**
 * Every user of one reaction. Discord returns at most
 * {@link REACTION_USERS_PAGE} of them per request, in ascending order of id,
 * after the id it is given; so pages are read until one comes back short.
 */
export const fetchAllReactionUsers = async <
  User extends Readonly<{ id: string }>,
>(
  fetchPage: (
    options: Readonly<{ limit: number; after?: string }>,
  ) => Promise<ReadonlyMap<string, User>>,
  after?: string,
): Promise<readonly User[]> => {
  const page = await fetchPage(
    after === undefined
      ? { limit: REACTION_USERS_PAGE }
      : { limit: REACTION_USERS_PAGE, after },
  );

  const users = Array.from(page.values());

  const last = users.at(-1);

  // An empty page ends the reading, and so does one ending at the id it was
  // asked to start after: it did not move, and reading on would ask for it
  // forever.
  return last === undefined || last.id === after
    ? []
    : users.length < REACTION_USERS_PAGE
      ? users
      : [...users, ...(await fetchAllReactionUsers(fetchPage, last.id))];
};

/** The most users Discord returns for one request of a reaction's users. */
const REACTION_USERS_PAGE = 100;
