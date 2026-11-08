import type { Nodes, Root } from 'mdast';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { directive } from 'micromark-extension-directive';
import { mdxjs } from 'micromark-extension-mdxjs';
import { createHash } from 'node:crypto';
import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as YAML from 'yaml';

/**
 * The JSDoc of the declaration `export const|function|class name`, as Markdown
 * for an MDX page: the leading `*` stripped, any code fence left out (the
 * page's own example shows the API) and each paragraph on one line, as the
 * pages are written.
 *
 * Each paragraph is parsed as the page will be (MDX, with the directives
 * Starlight reads), and is refused unless it is one paragraph of text, code
 * spans, emphasis and links: anything else (a list, which one line would
 * flatten, JSX, an expression, ESM, a heading, a quote, a fence, an aside)
 * would not survive being put on one line, or would not be prose at all.
 */
export const extractJsdoc = (
  source: string,
  name: string,
): Result<string, string> => {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const pattern = new RegExp(
    String.raw`/\*\*((?:(?!/\*\*)[\s\S])*?)\*/\s*\n(?:export (?:const|function|class) ${name}\b)`,
    'u',
  );

  const body = pattern.exec(source)?.[1];

  const paragraphs = (body ?? '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/u, ''))
    .join('\n')
    .replaceAll(/```[\s\S]*?```\n?/gu, '')
    .trim()
    .split(/\n{2,}/u)
    .filter((paragraph) => paragraph !== '');

  if (Arr.isEmpty(paragraphs)) {
    return Result.err('has no JSDoc to embed');
  }

  const mut_lines: string[] = [];

  for (const paragraph of paragraphs) {
    const line = paragraph.replaceAll(/\s*\n\s*/gu, ' ');

    // As written and as embedded: a construct that interrupts a paragraph shows
    // in the first, and putting it on one line must not make one.
    const refused =
      refusedConstruct(paragraph) ??
      (line === paragraph ? undefined : refusedConstruct(line));

    if (refused !== undefined) {
      return Result.err(
        `has a JSDoc paragraph the page cannot show as prose (${refused}): write it as plain sentences, with code in backticks (${JSON.stringify(line)})`,
      );
    }

    mut_lines.push(line);
  }

  return Result.ok(mut_lines.join('\n\n'));
};

/** The text up to the first full stop that ends a sentence, on one line. */
export const firstSentence = (text: string): string => {
  const flat = text.replaceAll(/\s+/gu, ' ');

  const end = /\.(?:\s|$)/u.exec(flat);

  return end === null ? flat : flat.slice(0, end.index + 1);
};

/**
 * The English page with its `description` set, and the text the Japanese page
 * translates. A page of one export takes the JSDoc's first sentence; a page of
 * several describes them all by hand, since the first one's sentence would
 * describe only that one, and its description is then part of what the
 * Japanese page translates.
 */
export const describeEnglish = (
  page: string,
  jsdocText: string,
  single: boolean,
): Result<Readonly<{ page: string; text: string }>, string> => {
  if (single) {
    const described = setDescription(page, firstSentence(jsdocText));

    return described === undefined
      ? Result.err(
          "has no one-line `description:` string in its frontmatter for the JSDoc's first sentence",
        )
      : Result.ok({ page: described, text: jsdocText });
  }

  const description = readDescription(page);

  return description === undefined
    ? Result.err(
        'documents several exports, so its `description:` is written by hand: add one, as a string',
      )
    : Result.ok({ page, text: `${description}\n\n${jsdocText}` });
};

/** The frontmatter's `description`, if it has a non-empty one. */
export const readDescription = (page: string): string | undefined => {
  const frontmatter = frontmatterOf(page);

  if (frontmatter === undefined) {
    return undefined;
  }

  const description = parseYaml(frontmatter.body)?.description;

  return description === undefined || description.trim() === ''
    ? undefined
    : description;
};

/**
 * Sets the frontmatter's `description`, single-quoted on one line as Prettier
 * writes it; `undefined` when the frontmatter has no `description` written on
 * one line, which is all this replaces.
 */
export const setDescription = (
  page: string,
  description: string,
): string | undefined => {
  const frontmatter = frontmatterOf(page);

  if (frontmatter === undefined) {
    return undefined;
  }

  const body = frontmatter.body.replace(
    /^description:.*$/mu,
    () => `description: '${description.replaceAll("'", "''")}'`,
  );

  // A value that ran on to more lines (a block scalar, a wrapped string) has
  // left them behind; the YAML then no longer reads as the description set.
  return parseYaml(body)?.description === description
    ? `---\n${body}---\n${page.slice(frontmatter.length)}`
    : undefined;
};

/** A version of `text`, to name what a Japanese page was translated from. */
export const textVersion = (text: string): string =>
  createHash('sha256').update(text).digest('hex').slice(0, 12);

const allowedInline: ReadonlySet<Nodes['type']> = new Set<Nodes['type']>([
  'text',
  'inlineCode',
  'emphasis',
  'strong',
  'link',
  // `word:name` reads as a text directive, which Starlight writes back as the
  // text it was when no plugin handles it.
  'textDirective',
]);

const firstRefusedInline = (
  nodes: readonly DeepReadonly<Nodes>[],
): string | undefined => {
  for (const node of nodes) {
    if (!allowedInline.has(node.type)) {
      return node.type;
    }

    if (!isRecord(node) || !hasKey(node, 'children')) {
      continue;
    }

    const inner = firstRefusedInline(node.children);

    if (inner !== undefined) {
      return inner;
    }
  }

  return undefined;
};

/** What in `markdown`, parsed as an MDX page, is not one prose paragraph. */
const refusedConstruct = (markdown: string): string | undefined => {
  let mut_tree: Root;

  try {
    mut_tree = fromMarkdown(markdown, {
      extensions: [mdxjs(), directive()],
      mdastExtensions: [mdxFromMarkdown(), directiveFromMarkdown()],
    });
  } catch (error) {
    const reason =
      isRecord(error) &&
      hasKey(error, 'message') &&
      typeof error.message === 'string'
        ? error.message
        : 'unknown error';

    return `MDX does not parse it: ${reason}`;
  }

  const [first, ...rest] = mut_tree.children;

  return first === undefined
    ? 'nothing'
    : first.type !== 'paragraph'
      ? first.type
      : Arr.isNonEmpty(rest)
        ? rest[0].type
        : firstRefusedInline(first.children);
};

/** The frontmatter's YAML and the length of the whole block, fences included. */
const frontmatterOf = (
  page: string,
): Readonly<{ body: string; length: number }> | undefined => {
  if (!page.startsWith('---\n')) {
    return undefined;
  }

  // The newline before the closing fence: the opening fence's own when the
  // frontmatter is empty.
  const close = page.indexOf('\n---', 3);

  if (close === -1) {
    return undefined;
  }

  const after = close + '\n---'.length;

  if (after !== page.length && page[after] !== '\n') {
    return undefined;
  }

  return {
    body: page.slice('---\n'.length, close + 1),
    length: Math.min(after + 1, page.length),
  };
};

const parseYaml = (
  yaml: string,
): Readonly<{ description?: string }> | undefined => {
  try {
    const parsed: unknown = YAML.parse(yaml);

    if (typeof parsed !== 'object' || parsed === null) {
      return undefined;
    }

    const description: unknown = Reflect.get(parsed, 'description');

    return typeof description === 'string' ? { description } : {};
  } catch {
    return undefined;
  }
};
