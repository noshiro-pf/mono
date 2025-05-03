import { castMutable, pipe } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import { decodeEmptyLines, encodeEmptyLines } from '../utils/index.mjs';

export const astTransformerToStringTransformer =
  (
    transformers: readonly ts.TransformerFactory<ts.SourceFile>[],
    options?: DeepReadonly<{
      /** @default `"tsconfig.json"` */
      filename?: string;

      tsconfig?: {
        /** @default `"tsconfig.json"` */
        name: string;

        /** @default `process.cwd()` */
        searchPath: string;
      };

      /** @default `false` */
      debug?: boolean;
    }>,
  ) =>
  (source: string): string => {
    // Read project settings from tsconfig.json
    const configPath = ts.findConfigFile(
      /* searchPath */ options?.tsconfig?.searchPath ?? process.cwd(),
      /* fileExists */ (fileName) => ts.sys.fileExists(fileName),
      /* configName */ options?.tsconfig?.name ?? 'tsconfig.json',
    );

    if (configPath === undefined) {
      throw new Error('Could not find a valid "tsconfig.json".');
    }

    if (options?.debug === true) {
      console.log('tsconfig path:', configPath);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { config }: { config?: unknown } = ts.readConfigFile(
      configPath,
      (path) => ts.sys.readFile(path),
    );

    const { options: compilerOptions } = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      process.cwd(),
    );

    if (options?.debug === true) {
      console.log('compilerOptions:', options);
    }

    const sourceFileName = options?.filename ?? 'source.tsx';

    const sourceAst = ts.createSourceFile(
      sourceFileName,
      encodeEmptyLines(source),
      ts.ScriptTarget.ESNext, // Target ECMAScript version
      true, // setParentNodes: true - Maintain parent-child relationships between nodes
      ts.ScriptKind.Deferred,
    );

    {
      const program = ts.createProgram({
        options: compilerOptions,
        rootNames: [sourceFileName],
      });

      const syntacticDiagnostics = program.getSyntacticDiagnostics(sourceAst);

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
      ts.transform(sourceAst, castMutable(transformers)),
    ).chain(
      (transformationResult) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        transformationResult.transformed[0]!,
    ).value;

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    });

    return decodeEmptyLines(printer.printFile(transformedAst));
  };
