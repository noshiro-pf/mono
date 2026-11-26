/**
 * A note when the diff changes the profile page's content and leaves its "last
 * updated" date alone. `lastUpdatedAt` is set by hand, since nothing can derive
 * when the author last revised what the page says (a shallow clone and
 * mechanical commits both give the wrong date), so a content update can leave
 * it stale with nothing failing. A note rather than a failure: a mechanical
 * edit of the same files should not move the date.
 */
export const findProfileDateNotes = (
  changedFiles: readonly string[],
): readonly string[] =>
  changedFiles.some((file) => PROFILE_CONTENT.test(file)) &&
  !changedFiles.includes(PROFILE_DATE)
    ? ([
        `The profile's content changed (apps/profile/src/assets/) and ${PROFILE_DATE} did not: set \`lastUpdatedAt\` if this is a content update.`,
      ] as const)
    : ([] as const);

/** The files the page's text is written in, directly under `assets/`. */
const PROFILE_CONTENT =
  /^apps\/profile\/src\/assets\/(?:[^/]+\.mdx|products\.mts|writings\.mts)$/u;

const PROFILE_DATE = 'apps/profile/src/assets/last-updated.mts';
