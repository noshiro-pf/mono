import type { Nodes, Root } from 'mdast';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { directive } from 'micromark-extension-directive';
import { mdxjs } from 'micromark-extension-mdxjs';
import { createHash } from 'node:crypto';
import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
import type {
  DeepReadonly,
  NonEmptyTuple,
  ReadonlyRecord,
} from 'ts-type-forge';
import ts from 'typescript';
import * as YAML from 'yaml';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import { skipExpressionWrappers } from '../../../tools/scripts/lib/ts-expression-wrappers.mjs';

/**
 * The JSDoc of the exported declaration `name`, as Markdown for an MDX page:
 * the leading `*` stripped, any code fence left out (the page's own example
 * shows the API) and each paragraph on one line, as the pages are written.
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
  const declarations = exportedDeclarations(source, name);

  if (Arr.isEmpty(declarations)) {
    return Result.err(
      'has no exported declaration in its file: check the name and file in reference-pages.mts, or write `export` on the declaration (an `export { name }` list is not read)',
    );
  }

  const bodies = Arr.generate(function* () {
    for (const { jsdoc } of declarations) {
      if (jsdoc !== undefined) {
        yield jsdoc;
      }
    }
  });

  // Overloads that carry JSDoc (an editor shows the one a call resolves to)
  // must say the same, since the page shows the first. One with none is
  // allowed: `filter` and `createDerived` document their first only.
  const distinct = new Set(bodies);

  if (distinct.size > 1) {
    return Result.err(
      'has overloads whose JSDoc differ: keep them the same, since the page shows the first and an editor the one a call resolves to',
    );
  }

  const body = bodies[0];

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

/**
 * The kinds of operator the exported declarations of `name` return, in the
 * order written: a function's overload signatures when it has them (the
 * implementation's union only repeats them), its one signature otherwise, or
 * the return type of the function a `const` holds, through parentheses, `as`,
 * `satisfies`, `<T>` and `!` around it. Every member of a union return type
 * counts; a type alias is not followed.
 */
export const extractOperatorKinds = (
  source: string,
  name: string,
): readonly OperatorKind[] => {
  const nodes = exportedDeclarations(source, name).map(({ node }) => node);

  const functions = nodes.filter(ts.isFunctionDeclaration);

  const overloads = functions.filter(({ body }) => body === undefined);

  const held = nodes.flatMap((node) => {
    if (!ts.isVariableDeclaration(node) || node.initializer === undefined) {
      return [];
    }

    const initializer = skipExpressionWrappers(node.initializer);

    return ts.isArrowFunction(initializer) ||
      ts.isFunctionExpression(initializer)
      ? [initializer]
      : [];
  });

  return Arr.uniq(
    [...(Arr.isNonEmpty(overloads) ? overloads : functions), ...held].flatMap(
      ({ type }) => (type === undefined ? [] : operatorKindsOf(type)),
    ),
  );
};

/**
 * What `pipe` gives, for the kinds an export's overloads return: the kind's
 * sentence for one; for several, one item per kind, after the condition the
 * page gives for it, and the kind with none last, as what holds otherwise.
 * `checkOperatorKindConditions` has refused conditions that do not fit.
 */
export const operatorKindText = (
  lang: 'en' | 'ja',
  sentences: ReadonlyRecord<OperatorKind, string>,
  kinds: NonEmptyTuple<OperatorKind>,
  conditions: OperatorKindConditions | undefined,
): string => {
  if (conditions === undefined || Arr.isFixedLengthArray(1, kinds)) {
    return sentences[kinds[0]];
  }

  const otherwise = lang === 'en' ? 'Otherwise' : 'それ以外は';

  // The kinds with a condition first, in the order written; the one without
  // last, as what holds otherwise.
  const ordered = kinds.toSorted(
    (a, b) =>
      Number(conditions[a] === undefined) - Number(conditions[b] === undefined),
  );

  return ordered
    .map((kind) => {
      const condition = conditions[kind]?.[lang] ?? otherwise;

      const sentence = sentences[kind];

      // In English the sentence follows the condition after a comma, so its
      // first letter is lowered (see `operatorKindSentences`).
      return lang === 'en'
        ? `- ${condition}, ${sentence.slice(0, 1).toLowerCase()}${sentence.slice(1)}`
        : `- ${condition}、${sentence}`;
    })
    .join('\n');
};

/**
 * Why a page's `operatorKindConditions` do not fit the kinds its exports return:
 * they are given for several kinds only, each for a kind returned, and for all
 * of them but the one that holds otherwise.
 */
export const checkOperatorKindConditions = (
  slug: string,
  kinds: readonly OperatorKind[],
  conditions: OperatorKindConditions | undefined,
): readonly string[] => {
  const named =
    conditions === undefined ? ([] as const) : Object.keys(conditions);

  if (Arr.isMaxLengthArray(1, kinds)) {
    return Arr.isEmpty(named)
      ? []
      : [
          `${slug} has operatorKindConditions in reference-pages.mts, but what it documents returns ${Arr.isEmpty(kinds) ? 'no operator' : 'one kind of operator'}: remove them.`,
        ];
  }

  const strays = named.filter((kind) => kinds.every((k) => k !== kind));

  const missing = kinds.filter((kind) => conditions?.[kind] === undefined);

  const operators = kinds
    .map((kind) => `${kind}InitialValueOperator`)
    .join(', ');

  return [
    ...(Arr.isNonEmpty(strays)
      ? [
          `${slug} gives operatorKindConditions for ${strays.join(', ')}, which it does not return: remove them.`,
        ]
      : []),
    ...(Arr.isEmpty(missing)
      ? [
          `${slug} gives operatorKindConditions for every kind it returns (${operators}): leave out the one that holds otherwise.`,
        ]
      : missing.length > 1
        ? [
            `${slug} documents overloads that return ${operators}: give operatorKindConditions in reference-pages.mts for each but the one that holds otherwise.`,
          ]
        : []),
  ];
};

/** Per kind of operator, the condition under which it holds, in each language. */
export type OperatorKindConditions = Partial<
  ReadonlyRecord<OperatorKind, Readonly<{ en: string; ja: string }>>
>;

export type OperatorKind = 'Drop' | 'Keep' | 'Provide';

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

/**
 * The declarations of `name` that `source` exports, in the order written, each
 * with its JSDoc as TypeScript attaches it: a function's every signature, a
 * `const`, a class. The JSDoc and the operator kinds are both read from these,
 * so that they come from the same declarations. The file is parsed for each
 * call: a page reads a few small files, so caching the tree would buy nothing.
 */
const exportedDeclarations = (
  source: string,
  name: string,
): readonly Readonly<{
  node: ts.ClassDeclaration | ts.FunctionDeclaration | ts.VariableDeclaration;
  jsdoc: string | undefined;
}>[] => {
  const file = ts.createSourceFile(
    'source.mts',
    source,
    ts.ScriptTarget.Latest,
    // `getJSDocCommentsAndTags` walks up from a `const` to its statement.
    true,
  );

  const nodes = file.statements.flatMap(
    (
      statement,
    ): readonly (
      ts.ClassDeclaration | ts.FunctionDeclaration | ts.VariableDeclaration
    )[] => {
      const exported =
        ts.canHaveModifiers(statement) &&
        (ts.getModifiers(statement) ?? []).some(
          ({ kind }) => kind === ts.SyntaxKind.ExportKeyword,
        );

      return !exported
        ? []
        : ts.isFunctionDeclaration(statement) ||
            ts.isClassDeclaration(statement)
          ? statement.name?.text === name
            ? [statement]
            : []
          : ts.isVariableStatement(statement)
            ? statement.declarationList.declarations.filter(
                (declaration) =>
                  ts.isIdentifier(declaration.name) &&
                  declaration.name.text === name,
              )
            : [];
    },
  );

  return nodes.map((node) => {
    // The last JSDoc before it, even with a `//` comment between; of a `const`
    // that declares several, the first one's only. Its text between `/**` and
    // `*/`.
    const jsdoc = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1);

    return {
      node,
      jsdoc:
        jsdoc === undefined
          ? undefined
          : source.slice(jsdoc.getStart(file) + 3, jsdoc.end - 2),
    };
  });
};

/** The kinds of operator a return type names: itself, or each union member. */
const operatorKindsOf = (
  type: DeepReadonly<ts.TypeNode>,
): readonly OperatorKind[] => {
  if (ts.isUnionTypeNode(type)) {
    return type.types.flatMap(operatorKindsOf);
  }

  if (!ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) {
    return [];
  }

  const kind = /^(Keep|Drop|Provide)InitialValueOperator$/u.exec(
    type.typeName.text,
  )?.[1];

  return kind === 'Keep' || kind === 'Drop' || kind === 'Provide' ? [kind] : [];
};
