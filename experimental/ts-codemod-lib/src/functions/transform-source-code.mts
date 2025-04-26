import {
  Arr,
  castMutable,
  IMap,
  pipe,
  range,
  toUint32,
  Tpl,
} from '@noshiro/ts-utils';
import { diff as myersDiff } from 'fast-myers-diff';
import * as ts from 'typescript';
import {
  decodeEmptyLines,
  defaultFormatter,
  encodeEmptyLines,
} from '../utils/index.mjs';

type TransformSourceCodeOptions = DeepReadonly<{
  /**
   * @default `".ts"`
   *
   * @example '.ts', '.tsx', '.mts', '.cts', '.d.ts', '.d.mts', '.d.cts'
   */
  ext?: string;

  tsconfig?: {
    /** @default `"tsconfig.json"` */
    name?: string;

    /** @default `process.cwd()` */
    searchPath?: string;
  };

  /** @default `false` */
  debug?: boolean;

  /**
   * @default (code: string) => prettier.format(code, { parser: 'typescript' })
   */
  formatter?: (code: string) => Promise<string>;
}>;

const fillDefaultOptions = (
  options?: TransformSourceCodeOptions,
): DeepRequired<TransformSourceCodeOptions> =>
  ({
    ext: options?.ext ?? '.ts',
    tsconfig: {
      name: options?.tsconfig?.name ?? 'tsconfig.json',
      searchPath: options?.tsconfig?.searchPath ?? process.cwd(),
    },
    debug: options?.debug ?? false,
    formatter: options?.formatter ?? defaultFormatter,
  }) as const;

export const transformSourceCode = async (
  sourceCode: string,
  transformers: readonly ts.TransformerFactory<ts.SourceFile>[],
  options?: TransformSourceCodeOptions,
): Promise<string> =>
  transformSourceCodeWithFilledOptions(
    sourceCode,
    transformers,
    fillDefaultOptions(options),
  );

const transformSourceCodeWithFilledOptions = async (
  sourceCode: string,
  transformers: readonly ts.TransformerFactory<ts.SourceFile>[],
  options: DeepRequired<TransformSourceCodeOptions>,
): Promise<string> => {
  const sourceFileName = `source${options.ext}`;

  const sourceCodeFormatted = await options.formatter(sourceCode);

  const originalSourceCodeEncoded = encodeEmptyLines(sourceCodeFormatted);

  const prog = ts.createProgram({
    options: getCompilerOptions(options),
    rootNames: [sourceFileName],
  });

  const originalSourceAst = createSourceFile(
    sourceFileName,
    originalSourceCodeEncoded,
  );

  checkSyntaxErrors(prog, originalSourceAst);

  const { missingComments, allOriginalNewlines } =
    await getTokensDiffBeforeAndAfterReprint(
      originalSourceCodeEncoded,
      originalSourceAst,
      sourceFileName,
      options,
    );

  const transformedAst = pipe(
    ts.transform(
      originalSourceAst,
      castMutable(transformers),
      prog.getCompilerOptions(),
    ),
  ).chain(
    (transformationResult) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      transformationResult.transformed[0]!,
  ).value;

  // Map from original position to transformed node
  const originalPosToTransformedNode =
    getOriginalPosToTransformedNode(transformedAst);

  // // Debugging: Check the content of the map
  // console.debug('--- Original Pos to Transformed Node Map ---');
  // for (const [pos, node] of originalPosToTransformedNode.entries()) {
  //   console.debug(
  //     `Original Pos: ${pos} -> Transformed Node Kind: ${ts.SyntaxKind[node.kind]}`,
  //   );
  // }
  // console.debug();

  attachDetachedComments(
    originalSourceAst,
    originalPosToTransformedNode,
    missingComments,
    allOriginalNewlines,
  );

  return decodeEmptyLines(printer.printFile(transformedAst));
};

const getCompilerOptions = (
  options: DeepRequired<TransformSourceCodeOptions>,
): ts.CompilerOptions => {
  // Read project settings from tsconfig.json
  const configPath = ts.findConfigFile(
    /* searchPath */ options.tsconfig.searchPath,
    /* fileExists */ (fileName) => ts.sys.fileExists(fileName),
    /* configName */ options.tsconfig.name,
  );

  if (configPath === undefined) {
    throw new Error('Could not find a valid "tsconfig.json".');
  }

  if (options.debug) {
    console.log('tsconfig path:', configPath);
  }

  const {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config,
  }: Readonly<{
    config?: unknown;
  }> = ts.readConfigFile(configPath, (path) => ts.sys.readFile(path));

  const { options: compilerOptions } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    process.cwd(),
  );

  if (options.debug) {
    console.log('compilerOptions:', compilerOptions);
  }

  return compilerOptions;
};

const checkSyntaxErrors = (
  prog: ts.Program,
  originalSourceAst: DeepReadonly<ts.SourceFile>,
): void => {
  const syntacticDiagnostics = prog.getSyntacticDiagnostics(originalSourceAst);

  if (syntacticDiagnostics.length > 0) {
    for (const diagnostic of syntacticDiagnostics) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start,
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      );
      console.error(
        `  Syntax Error at ${line + 1}:${character + 1}: ${message}`,
      );
    }
    throw new Error('There is a syntax error in the source');
  }
};

type CommentInfo = Readonly<{
  kind:
    | ts.SyntaxKind.SingleLineCommentTrivia
    | ts.SyntaxKind.MultiLineCommentTrivia;
  text: string;
  tokenStart: number;
  tokenEnd: number;
  hasTrailingNewLine?: boolean; // e.g., for SingleLineComment
}>;

const getAstAfterReprinted = async (
  sourceFile: DeepReadonly<ts.SourceFile>,
  formatter: (code: string) => Promise<string>,
): Promise<string> => {
  const reprinted = printer.printFile(sourceFile);

  const formatted = await formatter(reprinted);

  console.debug('reprinted:');
  console.debug(formatted);
  console.debug();

  return formatted;
};

const getTokensDiffBeforeAndAfterReprint = async (
  originalSourceCodeEncoded: string,
  originalSourceAst: DeepReadonly<ts.SourceFile>,
  sourceFileName: string,
  options: DeepRequired<TransformSourceCodeOptions>,
): Promise<
  Readonly<{
    missingComments: readonly CommentInfo[];
    allOriginalNewlines: readonly Uint32[];
  }>
> => {
  const reprintedSourceCode = await getAstAfterReprinted(
    originalSourceAst,
    options.formatter,
  );

  const tokensOriginal = Array.from(
    createIterableScanner(sourceFileName, originalSourceCodeEncoded),
  );

  const tokensReprinted = Array.from(
    createIterableScanner(sourceFileName, reprintedSourceCode),
  );

  if (options.debug) {
    for (const { kindStr, tokenStart, tokenEnd, text } of tokensOriginal) {
      console.debug(
        `[Original] [${kindStr}] [${tokenStart}-${tokenEnd}] ${text}`,
      );
    }
    for (const { kindStr, tokenStart, tokenEnd, text } of tokensReprinted) {
      console.debug(
        `[Reprinted] [${kindStr}] [${tokenStart}-${tokenEnd}] ${text}`,
      );
    }
  }

  const diff = myersDiff(tokensOriginal, tokensReprinted, (i, j) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tokenContentEq(tokensOriginal[i]!, tokensReprinted[j]!),
  );

  const mut_missingComments: CommentInfo[] = [];

  console.debug('--- Tokens Diff between Original and Reprinted ---');
  for (const vec4 of diff) {
    const [sx, ex, sy, ey] = Tpl.map(vec4, toUint32);

    if (sx < ex && sy < ey) {
      // 単純なコメントの欠落ではないタイプの差分が生じたとき

      // tokensOriginal[sx:ex] と tokensReprinted[sy:ey] の text 差分を調べる

      const substrTokenOriginal = mergeTokenInfo(tokensOriginal, sx, ex);

      const substrTokenReprinted = mergeTokenInfo(tokensReprinted, sx, ex);

      console.debug(`-[Original (substr)] "${substrTokenOriginal.text}"`);
      console.debug(`-[Reprinted (substr)] "${substrTokenReprinted.text}"`);

      const substrOriginalLines = substrTokenOriginal.text.split('\n');
      const substrReprintedLines = substrTokenReprinted.text.split('\n');

      const linesDiff = myersDiff(substrOriginalLines, substrReprintedLines);

      for (const v4 of linesDiff) {
        const [s0, e0, s1, e1] = Tpl.map(v4, toUint32);

        for (const i of range(s0, e0)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const line = substrOriginalLines[i]!;

          console.debug(`-[Original (line)] "${line}"`);
          {
            const trimmed = line.trim();

            const tokenStart =
              substrTokenOriginal.text.indexOf(trimmed) +
              substrTokenOriginal.tokenStart;

            if (trimmed.startsWith('//')) {
              mut_missingComments.push({
                kind: ts.SyntaxKind.SingleLineCommentTrivia,
                text: trimmed,
                tokenStart,
                tokenEnd: tokenStart + trimmed.length,
                hasTrailingNewLine: true,
              });
            }

            // TODO: Add a case for multiline comments
          }
        }

        for (const j of range(s1, e1)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const line = substrReprintedLines[j]!;

          console.debug(`-[Reprinted (line)] "${line}"`);
        }
      }
    } else {
      for (const i of range(sx, ex)) {
        const { kind, kindStr, text, tokenStart, tokenEnd } =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          tokensOriginal[i]!;

        console.debug(`- [${kindStr}] [${tokenStart}-${tokenEnd}] ${text}`);

        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (kind) {
          case ts.SyntaxKind.SingleLineCommentTrivia:
          case ts.SyntaxKind.MultiLineCommentTrivia: {
            mut_missingComments.push({
              kind,
              text,
              tokenStart,
              tokenEnd,
              hasTrailingNewLine: text
                .slice(toUint32(tokenStart), toUint32(tokenEnd))
                .includes('\n'),
            });

            break;
          }

          default:
            break;
        }
      }
    }
  }

  if (options.debug) {
    console.debug('--- Missing Comments ---');
    for (const c of mut_missingComments) {
      console.debug(
        `${syntaxKindToString(c.kind)} [${c.tokenStart}-${c.tokenEnd}]: "${c.text}"`,
      );
    }
    console.debug();
  }

  const allOriginalNewlines: readonly Uint32[] = tokensOriginal
    .filter((t) => t.kind === ts.SyntaxKind.NewLineTrivia)
    .map((t) => t.tokenStart);

  console.debug('--- Original Newlines ---');
  for (const c of allOriginalNewlines) {
    console.debug(c);
  }
  console.debug();

  return {
    missingComments: mut_missingComments,
    allOriginalNewlines,
  } as const;
};

const getOriginalPosToTransformedNode = (
  transformedAst: DeepReadonly<ts.SourceFile>,
): IMap<number, ts.Node> => {
  // Map from original position to transformed node
  // (Uses information from setOriginalNode)
  // eslint-disable-next-line no-restricted-globals
  const originalPosToTransformedNode = new Map<number, ts.Node>([] as const);

  const buildNodeMap = (node: ts.Node): void => {
    const original = ts.getOriginalNode(node) as ts.Node | undefined;

    if (original !== undefined) {
      // Use the start position of the original node as the key (consider other info for robustness)
      originalPosToTransformedNode.set(original.pos, node);
    }
    ts.forEachChild(node, buildNodeMap);
  };

  buildNodeMap(transformedAst);

  return IMap.new(originalPosToTransformedNode);
};

/**
 * Attaches detached comments (comments not attached to a node by default) to transformed nodes.
 * Tries to maintain the original position including newlines as much as possible,
 * but if determination is difficult, it defaults to finding the node immediately following the comment and attaching to it.
 */
const attachDetachedComments = (
  originalSourceFile: DeepReadonly<ts.SourceFile>,
  originalPosToTransformedNode: IMap<number, ts.Node>,
  detachedComments: readonly CommentInfo[],
  originalNewlines: readonly number[],
): void => {
  // Iterate through original comments and attach them as SyntheticComments to transformed nodes
  for (const comment of detachedComments) {
    console.debug(
      `Searching for position of comment "${comment.text}" [${comment.tokenStart}-${comment.tokenEnd}]`,
    );
    console.debug();

    // Find nodes immediately preceding and following the comment
    const originalPrecedingNode = findPrecedingNode(
      originalSourceFile,
      comment,
    );

    const originalFollowingNode = findFollowingNode(
      originalSourceFile,
      comment,
    );

    if (originalPrecedingNode !== undefined) {
      console.debug(
        `  Original preceding node: ${originalPrecedingNode.getText(originalSourceFile)} [${ts.SyntaxKind[originalPrecedingNode.kind]}] [${originalPrecedingNode.getStart(originalSourceFile)}-${originalPrecedingNode.getEnd()}]`,
      );
      console.debug();
    }

    if (originalFollowingNode !== undefined) {
      console.debug(
        `  Original following node: ${originalFollowingNode.getText(originalSourceFile)} [${ts.SyntaxKind[originalFollowingNode.kind]}] [${originalFollowingNode.getStart(originalSourceFile)}-${originalFollowingNode.getEnd()}]`,
      );
      console.debug();
    }

    const nodeToAttach = determineNodeToAttach(
      comment,
      originalPrecedingNode,
      originalFollowingNode,
      originalNewlines,
    );

    if (nodeToAttach === undefined) {
      console.warn(
        `Could not find any node preceding/following comment at ${comment.tokenStart}. Comment might be lost.`,
      );
      // TODO: Handle comments at the end of the file, etc.
      continue;
    }

    // Find the corresponding transformed node
    const transformedNode = originalPosToTransformedNode.get(
      nodeToAttach.node.pos,
    );

    if (transformedNode === undefined) {
      console.warn(
        `Could not find transformed node corresponding to original node at pos ${nodeToAttach.node.pos}. Comment at ${comment.tokenStart} might be lost.`,
        // TODO: Fallback strategy (e.g., find the preceding node and attach to its end)
      );
      continue;
    }

    switch (nodeToAttach.relation) {
      case 'following':
        // Create and attach synthetic comment (newline depends on original comment)
        ts.addSyntheticLeadingComment(
          transformedNode, // Attach to the node that originally followed the comment
          comment.kind,
          comment.text.startsWith('//')
            ? comment.text.slice(2) // Remove comment marker '//'
            : comment.text.slice(2, -2), // Remove comment markers '/*' and '*/'
          comment.kind === ts.SyntaxKind.SingleLineCommentTrivia ||
            comment.hasTrailingNewLine === true ||
            comment.text.endsWith('\n'), // TODO: Need to improve newline determination
        );
        break;

      case 'preceding':
        // Create and attach synthetic comment (newline depends on original comment)
        ts.addSyntheticTrailingComment(
          transformedNode, // Attach to the node that originally preceded the comment
          comment.kind,
          comment.text.startsWith('//')
            ? comment.text.slice(2) // Remove comment marker '//'
            : comment.text.slice(2, -2), // Remove comment markers '/*' and '*/'
          comment.kind === ts.SyntaxKind.SingleLineCommentTrivia ||
            comment.hasTrailingNewLine === true ||
            comment.text.endsWith('\n'), // TODO: Need to improve newline determination
        );
        break;
    }

    // console.log(`   -> Attaching as ${nodeToAttach.relation === 'following' ? 'LEADING' : 'TRAILING'} to transformed node kind ${ts.SyntaxKind[transformedNode.kind]}`);
  }
};

const findPrecedingNode = (
  originalSourceFile: DeepReadonly<ts.SourceFile>,
  comment: CommentInfo,
): ts.Node | undefined => {
  let mut_originalPrecedingNode = undefined as ts.Node | undefined;
  let mut_minDiff: number = Number.POSITIVE_INFINITY;

  const findOriginalPreceding = (node: ts.Node): void => {
    const nodeStart = node.getStart(originalSourceFile);
    const nodeEnd = node.getEnd();

    console.debug(
      `    [${ts.SyntaxKind[node.kind]}] [${nodeStart}-${nodeEnd}]`,
    );
    console.debug(
      node
        .getFullText(originalSourceFile)
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n'),
    );
    console.debug();

    if (nodeEnd <= comment.tokenStart) {
      // Node ends before the comment starts
      const diff = comment.tokenStart - nodeEnd;
      if (diff <= mut_minDiff) {
        // NOTE: Including '=' in the condition prioritizes descendant nodes.
        // Attaching comments to descendant nodes tends to place them closer to the expected position during printing.
        // Therefore, if multiple nodes end at the same position, prefer the one visited later (likely a descendant).
        mut_minDiff = diff;
        mut_originalPrecedingNode = node;
      }
    }

    ts.forEachChild(node, findOriginalPreceding);
  };

  findOriginalPreceding(originalSourceFile);

  return mut_originalPrecedingNode;
};

const findFollowingNode = (
  originalSourceFile: DeepReadonly<ts.SourceFile>,
  comment: CommentInfo,
): ts.Node | undefined => {
  let mut_originalFollowingNode = undefined as ts.Node | undefined;
  let mut_minDiff: number = Number.POSITIVE_INFINITY;

  const findOriginalFollowing = (node: ts.Node): void => {
    const nodeStart = node.getStart(originalSourceFile);
    const nodeEnd = node.getEnd();

    console.debug(
      `    [${ts.SyntaxKind[node.kind]}] [${nodeStart}-${nodeEnd}]`,
    );
    console.debug(
      node
        .getFullText(originalSourceFile)
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n'),
    );
    console.debug();

    if (nodeStart >= comment.tokenEnd) {
      // Node starts after the comment ends
      const diff = nodeStart - comment.tokenEnd;
      if (diff <= mut_minDiff) {
        // NOTE: Including '=' in the condition prioritizes descendant nodes
        // for the same reason as in findPrecedingNode.
        mut_minDiff = diff;
        mut_originalFollowingNode = node;
      }
    }

    ts.forEachChild(node, findOriginalFollowing);
  };

  findOriginalFollowing(originalSourceFile);

  return mut_originalFollowingNode;
};

/**
 * Determines whether to attach the comment to the preceding or following node.
 *
 * Example:
 *
 * const f = (
 *   arg: number, // line-comment
 * ): number[] => [];
 *
 * positions:
 * `arg: number`     : [14-25]
 * `// line-comment` : [28-43]
 * `number[]`        : [46-54]
 * newlines          : [11, 43]
 *
 * Preceding node: `arg: number` Number of newlines between = 0 -> Choose preceding (attach as trailing)
 * Following node: `number[]`     Number of newlines between = 1 -> Do not choose following
 */
const determineNodeToAttach = (
  comment: CommentInfo,
  originalPrecedingNode: ts.Node | undefined,
  originalFollowingNode: ts.Node | undefined,
  originalNewlines: readonly number[],
):
  | Readonly<{
      node: ts.Node;
      relation: 'preceding' | 'following'; // 'preceding' means attach as trailing, 'following' means attach as leading
    }>
  | undefined => {
  if (originalPrecedingNode === undefined) {
    if (originalFollowingNode === undefined) {
      // Cannot determine attachment point
      return undefined;
    } else {
      // Only following node exists, attach as leading comment to it
      return {
        node: originalFollowingNode,
        relation: 'following',
      } as const;
    }
  } else {
    if (originalFollowingNode === undefined) {
      // Only preceding node exists, attach as trailing comment to it
      return {
        node: originalPrecedingNode,
        relation: 'preceding',
      } as const;
    } else {
      // Both preceding and following nodes exist.
      // Decide based on the number of newlines between the comment and each node.
      // Fewer newlines usually indicates a closer relationship.

      // TODO: Optimize newline counting using binary search since originalNewlines is sorted.
      const numNewlinesBetweenPrecedingNodeAndComment = Arr.count(
        originalNewlines,
        (pos) =>
          // Use < for tokenStart
          originalPrecedingNode.getEnd() <= pos && pos < comment.tokenStart,
      );

      // TODO: Optimize newline counting using binary search since originalNewlines is sorted.
      const numNewlinesBetweenCommentAndFollowingNode = Arr.count(
        originalNewlines,
        (pos) =>
          // Use < for node start
          comment.tokenEnd <= pos && pos < originalFollowingNode.getStart(),
      );

      console.debug('  Num new lines');
      console.debug(`  preceding=${numNewlinesBetweenPrecedingNodeAndComment}`);
      console.debug(`  following=${numNewlinesBetweenCommentAndFollowingNode}`);
      console.debug();

      // Prefer the node with fewer intervening newlines.
      // If counts are equal, default to attaching as a trailing comment to the preceding node.
      // This is because in many cases that should be supported here, it is considered appropriate
      // to attach the comment to the immediately preceding node, since if the original comment had been
      // attached to the beginning of the immediately following node, it would likely
      // not have been a detached comment.
      return numNewlinesBetweenPrecedingNodeAndComment <= // Use <= to prefer preceding if equal
        numNewlinesBetweenCommentAndFollowingNode
        ? ({
            node: originalPrecedingNode, // Attach as trailing comment
            relation: 'preceding',
          } as const)
        : ({
            node: originalFollowingNode, // Attach as leading comment
            relation: 'following',
          } as const);
    }
  }
};

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
  omitTrailingSemicolon: false,
});

const syntaxKindToString = (
  kind:
    | ts.SyntaxKind.SingleLineCommentTrivia
    | ts.SyntaxKind.MultiLineCommentTrivia
    | ts.SyntaxKind.NewLineTrivia,
): string =>
  kind === ts.SyntaxKind.NewLineTrivia
    ? 'NewLineTrivia'
    : kind === ts.SyntaxKind.SingleLineCommentTrivia
      ? 'SingleLineCommentTrivia'
      : 'MultiLineCommentTrivia';

const createSourceFile = (
  sourceFileName: string,
  sourceCode: string,
): ts.SourceFile =>
  ts.createSourceFile(
    sourceFileName,
    sourceCode,
    ts.ScriptTarget.Latest, // Target ECMAScript version
    true, // setParentNodes: true - Maintain parent-child relationships between nodes
    ts.ScriptKind.Deferred, // Use Deferred for potentially large files or when unsure
  );

type TokenInfo = Readonly<{
  kind: ts.SyntaxKind;
  kindStr: string;
  tokenStart: Uint32;
  tokenEnd: Uint32;
  text: string;
}>;

const tokenContentEq = (a: TokenInfo, b: TokenInfo): boolean =>
  a.kind === b.kind && a.text === b.text;

const mergeTokenInfo = (
  tokensOriginal: readonly TokenInfo[],
  start: Uint32,
  end: Uint32,
): Pick<TokenInfo, 'text' | 'tokenStart' | 'tokenEnd'> => ({
  text: tokensOriginal
    .slice(start, end)
    .map((t) => t.text)
    .join(''),
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  tokenStart: tokensOriginal[start]!.tokenStart,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  tokenEnd: tokensOriginal[end - 1]!.tokenEnd,
});

const createIterableScanner = (
  sourceFileName: string,
  sourceCode: string,
): Generator<TokenInfo, void, unknown> => {
  const languageVariant = sourceFileName.endsWith('.tsx')
    ? ts.LanguageVariant.JSX
    : ts.LanguageVariant.Standard;

  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    /* skipTrivia */ false,
    languageVariant,
  );

  scanner.setText(sourceCode);

  return scannerToGenerator(scanner, sourceCode);
};

function* scannerToGenerator(
  scanner: ts.Scanner,
  sourceCode: string,
): Generator<TokenInfo, void, unknown> {
  let mut_token = scanner.scan();

  while (mut_token !== ts.SyntaxKind.EndOfFileToken) {
    const tokenStart = toUint32(scanner.getTokenStart());
    const tokenEnd = toUint32(scanner.getTokenEnd());
    const kind = mut_token;
    const kindStr = ts.SyntaxKind[mut_token];
    const text = sourceCode.slice(tokenStart, tokenEnd);

    yield { kind, kindStr, tokenStart, tokenEnd, text };

    mut_token = scanner.scan();
  }
}
