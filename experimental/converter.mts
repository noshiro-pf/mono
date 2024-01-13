/* eslint-disable import/no-named-as-default-member */

import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import ts from 'typescript';
import { toThisDir } from '../scripts/path-utils.mjs';

const thisDir = toThisDir(import.meta.url);

const main = async (targetFilePath: string): Promise<void> => {
  const program = ts.createProgram([targetFilePath], {});
  const compilerOptions = program.getCompilerOptions();

  const sourceFile = program.getSourceFile(targetFilePath);

  if (sourceFile === undefined) return;

  const removeImport =
    <T extends ts.Node>(context: Readonly<ts.TransformationContext>) =>
    (rootNode: T): ts.Node => {
      const visit = (node: ts.Node): ts.Node => {
        const newNode = ts.visitEachChild(node, visit, context);

        if (ts.isImportDeclaration(newNode)) {
          const moduleName = newNode.moduleSpecifier.getText(sourceFile);

          const { resolvedModule } = ts.resolveModuleName(
            moduleName,
            sourceFile.fileName,
            compilerOptions,
            ts.sys,
          );

          console.log({
            moduleName,
            fileName: sourceFile.fileName,
            resolvedModule,
          });

          // return newNode;
          // console.log({ newNode });
        }
        // const importDecl: ts.ImportDeclaration = newNode;
        // if (importDecl.moduleSpecifier.getText() === 'assert') {
        //   return undefined;
        // }

        return newNode;
      };
      return ts.visitNode(rootNode, visit);
    };

  // const sourceFile = ts.createSourceFile('', src, ts.ScriptTarget.ES2015);

  const result = ts.transform(sourceFile, [removeImport]);
  result.dispose();

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });
  const o = result.transformed[0];

  if (o !== undefined) {
    await promisify(fs.writeFile)(
      path.resolve(thisDir, 'out.mts'),
      printer.printFile(o.getSourceFile()),
      {
        encoding: 'utf8',
      },
    );
  }
};

main(path.resolve(thisDir, 'sample.mts')).catch(console.error);

// https://github.com/anthonynichols/typescript-transform-extensions/blob/master/src/main.ts#L62
