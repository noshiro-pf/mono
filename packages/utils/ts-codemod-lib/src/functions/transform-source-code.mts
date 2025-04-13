import { castMutable, pipe } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  decodeEmptyLines,
  encodeEmptyLines,
  printNode,
} from '../utils/index.mjs';

type TransformSourceCodeOptions = DeepReadonly<{
  /** @default `".ts"`
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
}>;

const fillDefaultPptions = (
  options?: TransformSourceCodeOptions,
): DeepRequired<TransformSourceCodeOptions> =>
  ({
    ext: options?.ext ?? '.ts',
    tsconfig: {
      name: options?.tsconfig?.name ?? 'tsconfig.json',
      searchPath: options?.tsconfig?.searchPath ?? process.cwd(),
    },
    debug: options?.debug ?? false,
  }) as const;

export const transformSourceCode = (
  sourceCode: string,
  transformers: readonly ts.TransformerFactory<ts.SourceFile>[],
  options?: TransformSourceCodeOptions,
): string =>
  transformSourceCodeWithFilledOptions(
    sourceCode,
    transformers,
    fillDefaultPptions(options),
  );

const transformSourceCodeWithFilledOptions = (
  sourceCode: string,
  transformers: readonly ts.TransformerFactory<ts.SourceFile>[],
  options: DeepRequired<TransformSourceCodeOptions>,
): string => {
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

  const sourceFileName = `source${options.ext}`;

  const sourceCodeEncoded = encodeEmptyLines(sourceCode);

  const prog = ts.createProgram({
    options: compilerOptions,
    rootNames: [sourceFileName],
  });

  const sourceAst = ts.createSourceFile(
    sourceFileName,
    sourceCodeEncoded,
    ts.ScriptTarget.ESNext, // Target ECMAScript version
    true, // setParentNodes: true - Maintain parent-child relationships between nodes
    ts.ScriptKind.Deferred,
  );

  {
    const syntacticDiagnostics = prog.getSyntacticDiagnostics(sourceAst);

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
  }

  const transformedAst = pipe(
    ts.transform(
      sourceAst,
      castMutable(transformers),
      prog.getCompilerOptions(),
    ),
  ).chain(
    (transformationResult) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      transformationResult.transformed[0]!,
  ).value;

  attachSyntheticComments(transformedAst, transformedAst);

  return decodeEmptyLines(printer.printFile(transformedAst));
};

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
});

const preserveComments = <T extends ts.Node>(
  newNode: T,
  originalNode: ts.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: ts.SourceFile,
): T => {
  // const leadingComments = ts
  //   .getLeadingCommentRanges(sourceFile.text, originalNode.pos)
  //   ?.map(
  //     (range) =>
  //       ({
  //         kind:
  //           sourceFile.text.slice(
  //             toUint32(range.pos + 2),
  //             toUint32(range.pos + 3),
  //           ) === '*'
  //             ? ts.SyntaxKind.MultiLineCommentTrivia
  //             : ts.SyntaxKind.SingleLineCommentTrivia,
  //         text: sourceFile.text.slice(
  //           toUint32(range.pos + 2),
  //           toUint32(range.end),
  //         ), // コメントマーカー(/* //)を除く
  //         pos: -1, // 合成コメントでは pos/end は -1
  //         end: -1,
  //         hasTrailingNewLine: range.hasTrailingNewLine ?? false,
  //       }) satisfies ts.SynthesizedComment,
  //   );

  // Trailing comments も同様に取得・作成

  // if (trailingComments) {
  //     newNode = ts.setSyntheticTrailingComments(newNode, trailingComments);
  // }

  console.debug({
    originalNode: printNode(originalNode),
    newNode: printNode(newNode),
    leadingComments: ts.getLeadingCommentRanges(
      sourceFile.text,
      originalNode.pos,
    ),
    trailingComments: ts.getTrailingCommentRanges(
      sourceFile.text,
      originalNode.pos,
    ),
  });

  return newNode;
  // return leadingComments === undefined
  //   ? newNode
  //   : ts.setSyntheticLeadingComments(newNode, castMutable(leadingComments));
};

const attachSyntheticComments = (
  node: ts.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: ts.SourceFile,
): void => {
  ts.forEachChild(node, (child) => {
    attachSyntheticComments(child, sourceFile);
  }); // 再帰的に走査
  preserveComments(node, node, sourceFile); // 自分自身にコメントを合成コメントとして再設定
};
