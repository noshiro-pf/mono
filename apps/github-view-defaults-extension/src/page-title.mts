/**
 * The tab title of a pull request or an issue, with its number in front.
 *
 * GitHub puts the number near the end — `Fix the thing by someone · Pull
 * Request #2054 · owner/repo` — which is exactly the part a tab strip cuts off.
 * `#2054 Fix the thing …` keeps it readable in the narrowest tab.
 *
 * Like `page-url.mts`, strings in and a string out; `content.mts` reads the
 * title, asks this, and writes the answer back.
 *
 * The title is returned unchanged when the page is not a pull request or an
 * issue, when it already starts with the number — which is also what this
 * function wrote a moment ago, read back — and when it is empty. An empty title
 * is the document before its `<title>` has been parsed, and writing one then
 * would put a second `<title>` ahead of the page's own.
 */
export const numberedTitleOf = (title: string, pageHref: string): string => {
  if (title === '') {
    return title;
  }

  const number = numberOf(pageHref);

  if (number === undefined) {
    return title;
  }

  const prefix = `#${number}` as const;

  return title === prefix || title.startsWith(`${prefix} `)
    ? title
    : `${prefix} ${title}`;
};

/**
 * A pull request or an issue, and every tab below either of them.
 *
 * The number is the whole segment, so `/issues/new` and the lists are not
 * matched. Discussions are numbered too on GitHub, and are left out only
 * because nobody has asked for them.
 */
const numberedPagePath = /^\/[^/]+\/[^/]+\/(?:pull|issues)\/(\d+)(?:\/|$)/u;

/** The pull request or issue number `pageHref` is at, if it is at one. */
const numberOf = (pageHref: string): string | undefined => {
  try {
    const url = new URL(pageHref);

    return numberedPagePath.exec(url.pathname)?.[1];
  } catch {
    return undefined;
  }
};
