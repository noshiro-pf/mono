// cspell:ignore FEFF
import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmStrikethroughFromMarkdown } from 'mdast-util-gfm-strikethrough';
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import { parse } from 'yaml';
import {
  isSitePage,
  listTrackedFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';

/**
 * Fails when a docs site page's hero uses Markdown.
 *
 * Starlight renders the hero's title and tagline with `set:html`, not as
 * Markdown, so a backtick, emphasis or a link written there reaches the reader
 * as the characters themselves, and nothing else in the build notices. Write
 * HTML instead (`<code>map</code>`). An action's text is written escaped, so it
 * takes plain text alone.
 */
export const checkHeroMarkdown = async (): Promise<Result<number, string>> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const pages = tracked.value.filter(
    (file) => isSitePage(file) && /\.mdx?$/u.test(file),
  );

  const lines = await Promise.all(
    pages.map(async (page) => {
      const content = await readRepositoryFile(page);

      const found = Result.isErr(content)
        ? content
        : findHeroMarkdown(content.value);

      return Result.isErr(found)
        ? [`  ${page}: ${found.value}`]
        : found.value.map((mark) => `  ${page}: ${mark}`);
    }),
  );

  const offenders = lines.flat();

  if (Arr.isNonEmpty(offenders)) {
    return Result.err(
      [
        '❌ Markdown in a hero, which Starlight renders as HTML, or a page that could not be read:',
        '',
        ...offenders,
        '',
        'Write HTML in a title or tagline instead, such as `<code>map</code>` for `map`, and plain text in an action or a page title.',
      ].join('\n'),
    );
  }

  return Result.ok(pages.length);
};

/**
 * The Markdown found in the hero of the page's frontmatter, as `<key>: <what>`:
 * in `hero.title` and `hero.tagline`, both HTML; and in plain text, where HTML
 * and character references are not allowed either: the `text` of each of
 * `hero.actions`, and the page's `title` when the hero has none, which
 * Starlight shows in its place. The error is the YAML parser's.
 */
export const findHeroMarkdown = (
  content: string,
): Result<readonly string[], string> => {
  // A byte order mark and spaces after a fence are allowed, as YAML front
  // matter readers allow them.
  const frontmatter =
    /^\u{FEFF}?---[ \t]*\r?\n(?<body>[\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/u.exec(
      content,
    )?.groups?.['body'];

  if (frontmatter === undefined) {
    return Result.ok([]);
  }

  const data = Result.fromThrowable((): unknown => parse(frontmatter));

  if (Result.isErr(data)) {
    return Result.err(
      `the frontmatter does not parse: ${unknownToString(data.value)}`,
    );
  }

  const page = isRecord(data.value) ? data.value : ({} as const);

  if (!isRecord(page['hero'])) {
    return Result.ok([]);
  }

  const hero = page['hero'];

  const title =
    hero['title'] === undefined
      ? ([
          'title (shown as the hero title, and as plain text elsewhere: give the hero a `title` instead)',
          page['title'],
        ] as const)
      : undefined;

  const htmlFields = [
    ['hero.title', hero['title']],
    ['hero.tagline', hero['tagline']],
  ] as const;

  // The page title is also shown as plain text, and Starlight writes an
  // action's text escaped, so HTML and character references there are shown as
  // written too.
  const textFields = [
    ...(title === undefined ? ([] as const) : ([title] as const)),
    ...(Arr.isArray(hero['actions']) ? hero['actions'] : [])
      .map((action: unknown, index) =>
        isRecord(action)
          ? ([`hero.actions[${index}].text`, action['text']] as const)
          : undefined,
      )
      .filter((field) => field !== undefined),
  ] as const;

  return Result.ok([
    ...htmlFields.flatMap(([key, value]) =>
      typeof value === 'string'
        ? markdownIn(value, { html: true }).map((what) => `${key}: ${what}`)
        : [],
    ),
    ...textFields.flatMap(([key, value]) =>
      typeof value === 'string'
        ? markdownIn(value, { html: false }).map((what) => `${key}: ${what}`)
        : [],
    ),
  ]);
};

/** How each kind of Markdown is named in the report. */
const kindLabel: Readonly<Partial<ReadonlyRecord<string, string>>> = {
  inlineCode: '`code`',
  strong: '**strong**',
  emphasis: '*emphasis*',
  delete: '~~strikethrough~~',
  link: 'a link',
  linkReference: 'a link',
  definition: 'a link definition',
  image: 'an image',
  imageReference: 'an image',
  break: 'a line break',
  heading: 'a heading',
  list: 'a list',
  listItem: 'a list',
  blockquote: 'a block quote',
  code: 'a code block',
  thematicBreak: 'a thematic break',
} as const;

/**
 * What `text` would be as Markdown, each kind once, in the order first met.
 * Text is not Markdown, and HTML and character references are not when `html`
 * holds; nor, then, is anything inside a `<code>`, `<kbd>`, `<samp>` or `<pre>`
 * element, whose content is shown as written. A tag that starts the text is
 * read as inline
 * HTML rather than as an HTML block, whose content Markdown would not parse.
 */
const markdownIn = (
  text: string,
  { html }: Readonly<{ html: boolean }>,
): readonly string[] => {
  const tree = fromMarkdown(text, {
    extensions: [
      gfmStrikethrough(),
      { disable: { null: ['htmlFlow', 'codeIndented'] } },
    ],
    mdastExtensions: [gfmStrikethroughFromMarkdown()],
  });

  const mut_found = new Set<string>();

  let mut_literalDepth = 0;

  const visit = (node: DeepReadonly<Nodes>): void => {
    if (node.type === 'html') {
      if (!html) {
        mut_found.add('HTML (shown here as written)');
      } else if (
        /^<(?:code|kbd|samp|pre)(?=[\s>])(?![^>]*\/>)/iu.test(node.value)
      ) {
        mut_literalDepth += 1;
      } else if (/^<\/(?:code|kbd|samp|pre)\s*>/iu.test(node.value)) {
        mut_literalDepth = Math.max(0, mut_literalDepth - 1);
      }

      return;
    }

    if (node.type === 'text') {
      const source = text.slice(
        node.position?.start.offset,
        node.position?.end.offset,
      );

      // A backslash before punctuation is a Markdown escape: HTML shows both.
      if (mut_literalDepth === 0 && /\\[!-/:-@[-`{-~]/u.test(source)) {
        mut_found.add('a backslash escape');
      }

      // Markdown decodes `&amp;`, as HTML does; plain text shows it as written.
      if (!html && /&(?:#\d+|#x[\da-f]+|[a-z][\da-z]*);/iu.test(source)) {
        mut_found.add('a character reference (shown here as written)');
      }

      return;
    }

    if (
      mut_literalDepth === 0 &&
      node.type !== 'root' &&
      node.type !== 'paragraph'
    ) {
      mut_found.add(kindLabel[node.type] ?? node.type);
    }

    if (isRecord(node) && hasKey(node, 'children')) {
      for (const child of node.children) {
        visit(child);
      }
    }
  };

  visit(tree);

  return Array.from(mut_found);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkHeroMarkdown().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(`${result.value} site page(s) read; no hero uses Markdown.`);
}
