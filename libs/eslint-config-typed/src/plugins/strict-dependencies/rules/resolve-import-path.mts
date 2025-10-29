import * as path from 'node:path';
import { Arr, isNonEmptyString, mapNullable } from 'ts-data-forge';
import * as ts from 'typescript';

// Forked from https://github.com/knowledge-work/eslint-plugin-strict-dependencies/blob/v1.3.27/strict-dependencies/resolveImportPath.js

/**
 * import文のrootからのパスを求める
 */
export const resolveImportPath = (
  importPath: string,
  relativeFilePath: string | undefined,
  pathIndexMap: ReadonlyRecord<string, number>,
): string => {
  // Maps importAlias to OriginalPath
  const mut_importAliasMap: Record<string, string> = {};

  let mut_importPath = importPath;

  // Load tsconfig option
  try {
    const tsconfigOptions = readTsConfig(process.cwd());

    // If tsconfig file found
    if (tsconfigOptions?.paths !== undefined) {
      for (const [key, value] of Object.entries(tsconfigOptions.paths)) {
        const matchedKey: string | undefined = Object.keys(pathIndexMap).find(
          (k) => k === key,
        );
        // MEMO: pathIndexMapの指定がない場合 or 指定されているindexにアクセスしても値が得られない場合は[0]固定
        const pathIndex =
          matchedKey !== undefined ? pathIndexMap[matchedKey] : 0;

        if (Arr.isNonEmpty(value)) {
          const pathValue: string =
            mapNullable(pathIndex, (i) => value[i]) ?? value[0];

          mut_importAliasMap[key] =
            tsconfigOptions.baseUrl !== undefined
              ? path.join(tsconfigOptions.baseUrl, pathValue)
              : pathValue;
        }
      }
    }
  } catch {
    // DO NOTHING
  }

  if (
    isNonEmptyString(relativeFilePath) &&
    (mut_importPath.startsWith('./') || mut_importPath.startsWith('../'))
  ) {
    mut_importPath = path.join(path.dirname(relativeFilePath), mut_importPath);
  }

  const absolutePath = Object.keys(mut_importAliasMap).reduce(
    // FIXME: use glob module instead of replace('*')
    (resolvedImportPath, key) =>
      resolvedImportPath.replace(
        key.replace('*', ''),
        mut_importAliasMap[key]?.replace('*', '') ?? '',
      ),
    mut_importPath,
  );

  return path.normalize(absolutePath);
};

const readTsConfig = (tsconfigPath: string): ts.CompilerOptions | undefined => {
  // プロジェクトルート探索: tsconfigPath がディレクトリならその中を探す
  const basePath = ts.sys.directoryExists(tsconfigPath)
    ? tsconfigPath
    : path.dirname(tsconfigPath);
  const found = ts.findConfigFile(
    basePath,
    (filePath) => ts.sys.fileExists(filePath),
    ts.sys.directoryExists(tsconfigPath)
      ? 'tsconfig.json'
      : path.basename(tsconfigPath),
  );

  if (found === undefined) {
    // tsconfig not found under: ${tsconfigPath}
    return undefined;
  }

  // ここで実際にパース（extends も解決）
  const result = ts.getParsedCommandLineOfConfigFile(
    found,
    /*optionsToExtend*/ {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (d) => {
        // 解析不能な診断を投げる
        const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
        throw new Error(`Invalid tsconfig: ${msg}`);
      },
      getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
      readDirectory: (rootDir, extensions, excludes, includes, depth) =>
        ts.sys.readDirectory(rootDir, extensions, excludes, includes, depth),
      fileExists: (filePath) => ts.sys.fileExists(filePath),
      readFile: (filePath) => ts.sys.readFile(filePath),
      useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    },
  );

  if (result === undefined) {
    // 'Failed to parse tsconfig.'
    return undefined;
  }

  return result.options; // 正規化済みの compilerOptions
};
