import {
  comparisonLibraries,
  readComparisonLibraryVersions,
} from './environment.mjs';

/**
 * Prints the cache key for one measurement: the versions it compares.
 *
 * This is what keeps the committed tables from churning. A benchmark result is
 * a fact about a set of library versions, so CI measures once per set and
 * reuses that measurement until one of them moves — rather than re-measuring
 * every push and committing whatever the noise gave it.
 *
 * Written out rather than hashed, because a cache key is read by people: a
 * glance at the entry says which versions it holds, and a key that changed
 * says which one moved. It deliberately does not cover the runner image or the
 * Node version; the workflow prefixes those itself, for the same reason.
 */
const main = async (): Promise<void> => {
  const versions = await readComparisonLibraryVersions();

  const key = comparisonLibraries
    .map((name) => `${slug(name)}${versions[name] ?? 'unknown'}`)
    .join('-');

  console.log(key);
};

/** A cache key may not carry `@` or `/`, which a scoped name has both of. */
const slug = (name: string): string => name.replaceAll(/[^a-zA-Z0-9]/gu, '');

await main();
