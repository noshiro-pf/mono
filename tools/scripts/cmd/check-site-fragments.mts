import BananaSlug from 'github-slugger';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  PAGES_SITE_ORIGIN,
  PAGES_SITE_ROOT,
  pagesAstroSites,
} from '../../configs/pages-apps.mjs';
import {
  markdownLines,
  withoutCodeSpans,
  type MarkdownLine,
} from '../lib/markdown.mjs';
import {
  isRepositoryProse,
  listTrackedFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';

/**
 * Fails when a link to a heading on one of the Astro docs sites
 * (`pagesAstroSites`) names a fragment its page does not have.
 *
 * Starlight gives each heading an id slugged from its text with
 * github-slugger, as Astro's `rehypeHeadingIds` does. Rewording a heading —
 * in Japanese, changing one particle is enough — changes the id, and every
 * link to it then lands at the top of the page with nothing failing.
 * `check:prose:mono-links` resolves links into the repository; this resolves
 * links into the sites:
 *
 * - from a site page: `[x](#fragment)` on the same page, a relative
 *   `[x](../page/#fragment)` resolved against the page's URL as a browser
 *   does, `[x](/mono/<site>/<page>/#fragment)`, and an `href` written in HTML
 *   or JSX;
 * - from a site page or any of the repository's own Markdown documents:
 *   `https://noshiro-pf.github.io/mono/<site>/<page>/#fragment`, linked or
 *   bare.
 *
 * A link written in code — a fence or a code span — is an example, and is not
 * read.
 *
 * The ids a page has are read from its source, so that this stays buildless:
 * its ATX headings (`## …`), outside fences, slugged in order from the text
 * they render to; the `id` attributes written in it; and `_top`, which
 * Starlight gives the title. A setext heading, a heading written in HTML, one
 * a component renders, one with inline math on a site that renders it (its
 * text is what KaTeX renders) and one with a character reference this check
 * does not know are not seen, and a link to one is reported; write the
 * heading in plain Markdown, or give the element an `id` in the page.
 */
export const checkSiteFragments = async (): Promise<
  Result<CheckSummary, string>
> => {
  const trackedResult = await listTrackedFiles();

  if (Result.isErr(trackedResult)) {
    return Result.err(trackedResult.value);
  }

  const tracked = trackedResult.value;

  const pages = new Set(tracked.filter(isDocsSitePage));

  const configs = pagesAstroSites.map(({ packageDir }) =>
    astroConfigOf(packageDir),
  );

  // The sites' configs are read with the pages: each says whether its site
  // renders math.
  const scanned = [
    ...configs,
    ...tracked.filter(
      (relativePath) =>
        pages.has(relativePath) || isRepositoryProse(relativePath),
    ),
  ] as const;

  const results = await Promise.all(
    scanned.map(async (relativePath) => {
      const readResult = await readRepositoryFile(relativePath);

      return Result.isErr(readResult)
        ? readResult
        : Result.ok({ relativePath, text: readResult.value });
    }),
  );

  const firstError = results.find(Result.isErr);

  if (firstError !== undefined) {
    return Result.err(firstError.value);
  }

  const files = Arr.generate(function* () {
    for (const result of results) {
      if (!Result.isErr(result)) {
        yield result.value;
      }
    }
  });

  const mathPackages = new Set(
    Arr.generate(function* () {
      for (const { relativePath, text } of files) {
        const site = pagesAstroSites.find(
          ({ packageDir }) => astroConfigOf(packageDir) === relativePath,
        );

        if (site !== undefined && IMPORTS_REMARK_MATH.test(text)) {
          yield site.packageDir;
        }
      }
    }),
  );

  const idsByRoute = new Map(
    files
      .filter(({ relativePath }) => pages.has(relativePath))
      .map(({ relativePath, text }) => [
        routeOfPage(relativePath),
        pageIds(
          text,
          mathPackages.has(siteOfPage(relativePath)?.packageDir ?? ''),
        ),
      ]),
  );

  const links = files
    .filter(({ relativePath }) => !configs.includes(relativePath))
    .flatMap(({ relativePath, text }) =>
      findSiteLinks(text, relativePath).map((link) => ({ relativePath, link })),
    );

  const broken = Arr.generate(function* () {
    for (const { relativePath, link } of links) {
      const ids = idsByRoute.get(link.page);

      const reason =
        ids === undefined
          ? 'no page of the site is served there'
          : ids.has(link.fragment)
            ? undefined
            : (`the page has no id "${link.fragment}"` as const);

      if (reason !== undefined) {
        yield { relativePath, link, reason };
      }
    }
  });

  return Arr.isNonEmpty(broken)
    ? Result.err(formatBroken(broken, idsByRoute))
    : Result.ok({ pages: pages.size, links: links.length });
};

/**
 * The ids `fileText`, the source of a site page, renders to, as
 * {@link checkSiteFragments} reads them. `rendersMath` is whether the site
 * renders inline math (`remark-math`).
 */
export const pageIds = (
  fileText: string,
  rendersMath: boolean,
): ReadonlySet<string> => {
  const slugger = new BananaSlug();

  const lines = proseLines(fileText);

  return new Set<string>([
    TOP_ID,
    ...Arr.generate(function* () {
      for (const { text } of lines) {
        const heading = atxHeadingText(text);

        if (heading === undefined) {
          continue;
        }

        const rendered = renderedText(heading, rendersMath);

        // A heading whose text cannot be told is left out of the slugger's
        // count of repeats too: what it renders to rarely repeats another
        // heading, and its text as written would claim a slug it never has.
        if (rendered !== undefined) {
          yield slugger.slug(rendered);
        }
      }
    }),
    ...lines.flatMap(({ text }) =>
      Array.from(withoutCodeSpans(text).matchAll(ID_ATTRIBUTE), (matched) =>
        quotedValue(matched.groups),
      ),
    ),
  ]);
};

/**
 * Every link in `fileText` into a page of the sites with a fragment, in the
 * order they are read. `relativePath` is the file's path from the repository
 * root; it decides which links are read and what a relative one is resolved
 * against.
 */
export const findSiteLinks = (
  fileText: string,
  relativePath: string,
): readonly SiteLink[] => {
  const pageRoute = isDocsSitePage(relativePath)
    ? routeOfPage(relativePath)
    : undefined;

  return proseLines(fileText).flatMap(({ line, text }) => {
    const prose = withoutCodeSpans(text);

    const written = [
      ...Array.from(prose.matchAll(FULL_URL), (matched) => ({
        index: matched.index,
        href: DELIMITED_BEFORE.test(prose.slice(0, matched.index))
          ? matched[0]
          : matched[0].replace(AUTOLINK_TRAILING, ''),
      })),
      // A full URL in a link is read above; on a site page the rest of its
      // links are routes of the site.
      ...(pageRoute === undefined
        ? []
        : [
            ...Array.from(prose.matchAll(MARKDOWN_LINK), (matched) => ({
              index: matched.index,
              href: matched.groups?.['href'] ?? '',
            })),
            ...Array.from(prose.matchAll(HREF_ATTRIBUTE), (matched) => ({
              index: matched.index,
              href: quotedValue(matched.groups),
            })),
          ].filter(({ href }) => !HAS_SCHEME.test(href))),
    ].toSorted((a, b) => a.index - b.index);

    return Arr.generate(function* () {
      // `[url](url)` is read twice, as a bare URL and as a link.
      for (const { href } of Arr.uniqBy(written, ({ href: h }) => h)) {
        const link = toSiteLink(href, line, pageRoute);

        if (link !== undefined) {
          yield link;
        }
      }
    });
  });
};

/** Where Starlight serves the page whose source is at `relativePath`. */
export const routeOfPage = (relativePath: string): string => {
  const site = siteOfPage(relativePath);

  if (site === undefined) {
    throw new Error(`${relativePath} is not a page of a docs site.`);
  }

  const pagePath = relativePath
    .slice(contentDirOf(site.packageDir).length + 1)
    .replace(PAGE_EXTENSION, '')
    .replace(INDEX_SEGMENT, '');

  return `${PAGES_SITE_ROOT}${site.siteDir}/${pagePath === '' ? '' : `${pagePath}/`}`;
};

/** Whether `route`, ending in `/`, is under one of the sites. */
export const isSiteRoute = (route: string): boolean =>
  pagesAstroSites.some(({ siteDir }) =>
    route.startsWith(`${PAGES_SITE_ROOT}${siteDir}/`),
  );

export type SiteLink = Readonly<{
  /** 1-based. */
  line: number;
  /** The link as written. */
  written: string;
  /** The route of the page it points at, ending in `/`. */
  page: string;
  /** Decoded. */
  fragment: string;
}>;

type BrokenLink = Readonly<{
  relativePath: string;
  link: SiteLink;
  reason: string;
}>;

type CheckSummary = Readonly<{
  pages: number;
  links: number;
}>;

/** The id Starlight gives a page's title, which the slugger never sees. */
const TOP_ID = '_top';

/** The opening of an ATX heading: up to three spaces and one to six `#`. */
const ATX_OPENING = /^ {0,3}#{1,6}(?=[\t ]|$)/u;

/** The optional closing run of `#` of an ATX heading, once it is trimmed. */
const ATX_CLOSING = /(?:^|[\t ])#+$/u;

/** An `id` written as an HTML or JSX attribute: `id="x"` or `id={'x'}`. */
const ID_ATTRIBUTE =
  /(?<![\w-])id=\{?(?:"(?<double>[^"]+)"|'(?<single>[^']+)')/gu;

/** The destination of a Markdown link or image, up to a title or `)`. */
const MARKDOWN_LINK = /\]\((?<href>[^\s()<>]+)/gu;

/** An `href` written as an HTML or JSX attribute: `href="x"` or `href={'x'}`. */
const HREF_ATTRIBUTE =
  /(?<![\w-])href=\{?(?:"(?<double>[^"]+)"|'(?<single>[^']+)')/gu;

/**
 * A full URL, up to whitespace, a quote, a bracket or a backtick; which of
 * them point into a site is decided by their origin.
 */
const FULL_URL = /https:\/\/[^\s"'`<>()[\]]+/gu;

/**
 * What GFM leaves out of the end of a bare URL it links. Japanese punctuation
 * is not among it, and a URL followed by `。` links to a fragment ending in it.
 */
const AUTOLINK_TRAILING = /[!*,.:;?_~]+$/u;

/** What comes before a URL that is delimited: a link, an autolink, a quote. */
const DELIMITED_BEFORE = /(?:\]\(|<|["'])$/u;

/** A URL with a scheme, `https:` or `mailto:`. */
const HAS_SCHEME = /^[a-z][\d+.a-z-]*:/iu;

const PAGE_EXTENSION = /\.mdx?$/u;

const FRONTMATTER_FENCE = '---';

const INDEX_SEGMENT = /(?:^|\/)index$/u;

/** Splits a line into prose and code spans, the code at odd indices. */
const CODE_SPAN_SPLIT = /`+([^`]+)`+/u;

const IMAGE = /!\[[^\]]*\]\([^)]*\)/gu;

const LINK = /\[(?<text>[^\]]*)\]\([^)]*\)/gu;

const TAG = /<\/?[A-Za-z][^>]*>/gu;

/**
 * `*`, `~` and a run of `_` that is not inside a word: CommonMark does not
 * read `snake_case_name` as emphasis.
 */
const EMPHASIS = /[*~]+|(?<![\p{L}\p{N}])_+|_+(?![\p{L}\p{N}])/gu;

/** A backslash escape: a backslash and an ASCII punctuation character. */
const ESCAPE = /\\([!-/:-@[-`{-~])/gu;

/**
 * Where an escaped character is moved to while a heading is read: the
 * private use area, which no heading holds.
 */
const MASK_BASE = 0xe0_00;

/** The end of the masks: an escaped character is ASCII. */
const MASK_END = MASK_BASE + 0x80;

/** Inline math, which KaTeX renders to text this check cannot compute. */
const MATH = /\$[^$]+\$/u;

/** The import of an `astro.config.mjs` that renders inline math. */
const IMPORTS_REMARK_MATH = /^import .* from 'remark-math';$/mu;

/** A decimal, hexadecimal or named character reference. */
const CHARACTER_REFERENCE = /&#?[\dA-Za-z]+;/gu;

/** The digits of a reference CommonMark reads: up to seven, or six in hex. */
const DECIMAL_DIGITS = /^\d{1,7}$/u;

const HEX_DIGITS = /^[\dA-Fa-f]{1,6}$/u;

const REPLACEMENT_CHARACTER = String.fromCodePoint(0xff_fd);

/**
 * The named references a heading is likely to hold; a heading with another is
 * not read.
 */
// cspell:ignore apos -- the named reference of `'`
const NAMED_REFERENCES: ReadonlyMap<string, string> = new Map<string, string>([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', '\u{A0}'],
]);

/** The lines of a page outside its frontmatter and its fenced code. */
const proseLines = (fileText: string): readonly MarkdownLine[] => {
  const lines = markdownLines(fileText);

  const frontmatterEnd =
    lines[0]?.text === FRONTMATTER_FENCE
      ? lines.findIndex(
          ({ text }, index) => index > 0 && text === FRONTMATTER_FENCE,
        )
      : -1;

  return lines.slice(frontmatterEnd + 1).filter(({ fenced }) => !fenced);
};

/**
 * The text of the ATX heading `line` is, without its closing run of `#`, or
 * `undefined` when it is not one.
 */
const atxHeadingText = (line: string): string | undefined => {
  const opening = ATX_OPENING.exec(line)?.[0];

  return opening === undefined
    ? undefined
    : line.slice(opening.length).trim().replace(ATX_CLOSING, '').trim();
};

/** The value of an attribute matched with either quote. */
const quotedValue = (
  groups: ReadonlyRecord<string, string | undefined> | undefined,
): string => groups?.['double'] ?? groups?.['single'] ?? '';

const contentDirOf = (packageDir: string): string =>
  `apps/${packageDir}/src/content/docs` as const;

/** The site whose content directory holds `relativePath`. */
const siteOfPage = (
  relativePath: string,
): (typeof pagesAstroSites)[number] | undefined =>
  pagesAstroSites.find(({ packageDir }) =>
    relativePath.startsWith(`${contentDirOf(packageDir)}/`),
  );

/**
 * Whether `relativePath` is a page of one of the docs sites; narrower than
 * `isSitePage` in `repo-files.mts`, which is any page of any app.
 */
const isDocsSitePage = (relativePath: string): boolean =>
  PAGE_EXTENSION.test(relativePath) && siteOfPage(relativePath) !== undefined;

const astroConfigOf = (packageDir: string): string =>
  `apps/${packageDir}/astro.config.mjs` as const;

const decoded = (encoded: string): string => {
  const result = Result.fromThrowable(() => decodeURI(encoded));

  return Result.isErr(result) ? encoded : result.value;
};

/**
 * The link `href` points at, when it points into a site with a fragment.
 * `pageRoute` is the route of the page it is written on, when that is a site
 * page; only full URLs are read from anywhere else.
 */
const toSiteLink = (
  href: string,
  line: number,
  pageRoute: string | undefined,
): SiteLink | undefined => {
  if (!href.includes('#')) {
    return undefined;
  }

  const url = Result.fromThrowable(() =>
    pageRoute === undefined
      ? new URL(href)
      : new URL(href, new URL(pageRoute, PAGES_SITE_ORIGIN)),
  );

  if (
    Result.isErr(url) ||
    url.value.origin !== PAGES_SITE_ORIGIN ||
    // `#` alone is the top of the page.
    url.value.hash === ''
  ) {
    return undefined;
  }

  const route = `${decoded(url.value.pathname).replace(/\/+$/u, '')}/` as const;

  if (!isSiteRoute(route)) {
    return undefined;
  }

  return {
    line,
    written: href,
    page: route,
    fragment: decoded(url.value.hash.slice(1)),
  };
};

/**
 * The character a decimal, hexadecimal or named character reference stands
 * for, or `undefined` when this check does not know.
 */
const decodedReference = (reference: string): string | undefined => {
  // `&` and `;`.
  const body = reference.slice(1, -1);

  if (!body.startsWith('#')) {
    return NAMED_REFERENCES.get(body);
  }

  const isHex = body.startsWith('#x') || body.startsWith('#X');

  const digits = body.slice(isHex ? 2 : 1);

  // Not a reference to CommonMark, so it is the text as written.
  if (!(isHex ? HEX_DIGITS : DECIMAL_DIGITS).test(digits)) {
    return reference;
  }

  const codePoint = isHex
    ? Number.parseInt(digits, 16)
    : Result.unwrapOkOr(Num.safeParseInt(digits), Number.NaN);

  // CommonMark replaces U+0000, a surrogate and a code point past Unicode
  // with U+FFFD.
  return codePoint === 0 ||
    (0xd8_00 <= codePoint && codePoint <= 0xdf_ff) ||
    codePoint > 0x10_ff_ff
    ? REPLACEMENT_CHARACTER
    : String.fromCodePoint(codePoint);
};

/** {@link renderedText} of prose outside code spans, its escapes masked. */
const renderedProse = (prose: string): string | undefined => {
  const text = prose
    .replaceAll(IMAGE, '')
    .replaceAll(LINK, '$<text>')
    .replaceAll(TAG, '')
    .replaceAll(EMPHASIS, '');

  const unknownReference = text
    .matchAll(CHARACTER_REFERENCE)
    .some(([reference]) => decodedReference(reference) === undefined);

  return unknownReference
    ? undefined
    : text.replaceAll(
        CHARACTER_REFERENCE,
        (reference) => decodedReference(reference) ?? reference,
      );
};

/** `text` with each masked character put back. */
const unmasked = (text: string): string =>
  Array.from(text, (char) => {
    const codePoint = char.codePointAt(0) ?? 0;

    return MASK_BASE <= codePoint && codePoint < MASK_END
      ? String.fromCodePoint(codePoint - MASK_BASE)
      : char;
  }).join('');

/**
 * The text a heading's Markdown renders to, which is what Astro slugs, or
 * `undefined` when this check cannot tell: with inline math, which KaTeX
 * renders, or a named character reference it does not know. Code spans and
 * backslash-escaped characters are kept as written, a link keeps its text,
 * an image and an HTML or JSX tag leave nothing, emphasis goes and character
 * references are decoded. An MDX expression is kept as written, as Astro
 * does.
 */
const renderedText = (
  markdown: string,
  rendersMath: boolean,
): string | undefined => {
  // An escaped character is literal text: masked, it is neither a backtick
  // of a code span, nor emphasis, nor a bracket of a link, nor the `$` of
  // math, nor the `&` of a reference. In a code span a backslash is kept and
  // the slugger then drops it, so masking there changes nothing.
  const parts = markdown
    .replaceAll(ESCAPE, (_, char) =>
      String.fromCodePoint(MASK_BASE + (char?.codePointAt(0) ?? 0)),
    )
    .split(CODE_SPAN_SPLIT);

  if (
    rendersMath &&
    MATH.test(parts.filter((_, index) => index % 2 === 0).join(''))
  ) {
    return undefined;
  }

  const rendered = parts.map((part, index) =>
    index % 2 === 1 ? part : renderedProse(part),
  );

  return rendered.includes(undefined) ? undefined : unmasked(rendered.join(''));
};

const commonPrefixLength = (a: string, b: string): number => {
  const chars = Array.from(a);

  const other = Array.from(b);

  const mismatch = chars.findIndex((char, index) => other[index] !== char);

  return mismatch === -1 ? Math.min(chars.length, other.length) : mismatch;
};

/** The page's ids that share the most leading characters with `fragment`. */
const nearest = (
  fragment: string,
  ids: readonly string[],
): readonly string[] => {
  const scored = ids
    .filter((id) => id !== TOP_ID)
    .map((id) => ({ id, score: commonPrefixLength(fragment, id) }));

  const best = Math.max(0, ...scored.map(({ score }) => score));

  return best === 0
    ? []
    : scored.filter(({ score }) => score === best).map(({ id }) => id);
};

const formatBroken = (
  broken: readonly BrokenLink[],
  idsByRoute: ReadonlyMap<string, ReadonlySet<string>>,
): string =>
  [
    `❌ ${broken.length} link(s) into the docs sites name a fragment that is not there:`,
    '',
    ...broken.map(({ relativePath, link, reason }) => {
      const ids = idsByRoute.get(link.page);

      const near =
        ids === undefined
          ? ([] as const)
          : nearest(link.fragment, Array.from(ids));

      return [
        `  ${relativePath}:${link.line}  ${link.written}`,
        `      ${reason}`,
        ...(Arr.isNonEmpty(near)
          ? [`      ids it has: ${near.join(', ')}`]
          : []),
      ].join('\n');
    }),
    '',
    'Point each link at the heading as it is slugged now, or reword the',
    'heading back. A heading this check cannot see (setext, HTML, rendered by',
    'a component, with math, with a named character reference other than',
    '&amp; &lt; &gt; &quot; &apos; &nbsp;) can be written in plain Markdown,',
    'or given an `id`.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkSiteFragments().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every fragment link into the docs sites resolves (${result.value.links} links, ${result.value.pages} pages).`,
  );
}
