import * as path from 'node:path';
import {
  Arr,
  isNonEmptyString,
  isString,
  mapNullable,
  Obj,
} from 'ts-data-forge';
import type { MutableRecord, ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';

// Forked from https://github.com/knowledge-work/eslint-plugin-strict-dependencies/blob/v1.3.27/strict-dependencies/resolveImportPath.js

/**
 * import文のrootからのパスを求める
 *
 * `readCompilerOptions` は tsconfig の compilerOptions を返す関数で、既定では
 * カレントディレクトリの tsconfig.json を読む。テストが `typescript` を
 * モジュールごと差し替えずにすむよう引数にしている。返す `paths` の値は
 * カレントディレクトリからの相対パスとして扱う。
 */
export const resolveImportPath = (
  importPath: string,
  relativeFilePath: string | undefined,
  pathIndexMap: ReadonlyRecord<string, number>,
  readCompilerOptions: () => ts.CompilerOptions | undefined = () =>
    readTsConfig(process.cwd()),
): string => {
  // Maps importAlias to OriginalPath
  const mut_importAliasMap: MutableRecord<string, string> = {};

  let mut_importPath = importPath;

  // Load tsconfig option
  try {
    const tsconfigOptions = readCompilerOptions();

    // If tsconfig file found
    if (tsconfigOptions?.paths !== undefined) {
      for (const [key, value] of Object.entries(tsconfigOptions.paths)) {
        const matchedKey: string | undefined = Object.keys(pathIndexMap).find(
          (k) => k === key,
        );

        // MEMO: pathIndexMapの指定がない場合 or 指定されているindexにアクセスしても値が得られない場合は[0]固定
        const pathIndex =
          matchedKey !== undefined ? pathIndexMap[matchedKey] : 0;

        if (!Arr.isNonEmpty(value)) {
          continue;
        }

        mut_importAliasMap[key] =
          mapNullable(pathIndex, (i) => value[i]) ?? value[0];
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

/**
 * Reads the tsconfig.json found from `cwd` upward, with `paths` rewritten as
 * relative to `cwd`.
 */
export const readTsConfig = (cwd: string): ts.CompilerOptions | undefined => {
  const found = ts.findConfigFile(
    cwd,
    (filePath) => ts.sys.fileExists(filePath),
    'tsconfig.json',
  );

  if (found === undefined) {
    // tsconfig not found under: ${cwd}
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

  // undefined: 'Failed to parse tsconfig.'
  // result.options: 正規化済みの compilerOptions
  if (result?.options.paths === undefined) {
    return result?.options;
  }

  // `baseUrl` is not read: `paths` are relative to the tsconfig.json that
  // declares them, as `tsc` resolves them without `baseUrl`. That is
  // `pathsBasePath` (internal to TypeScript) when it is an `extends` base.
  const pathsBasePath = result.options['pathsBasePath'];

  const baseDir = isString(pathsBasePath) ? pathsBasePath : path.dirname(found);

  return {
    ...result.options,
    paths: Obj.map(result.options.paths, (values) =>
      values.map((value) => relativeTo(cwd, baseDir, value)),
    ),
  };
};

/** Rewrites `value`, relative to `baseDir`, as relative to `cwd`. */
const relativeTo = (cwd: string, baseDir: string, value: string): string => {
  const relative = path.relative(cwd, path.resolve(baseDir, value));

  const nonEmpty = relative === '' ? '.' : relative;

  // `path.resolve` drops a trailing slash, which an alias with one relies on.
  return value.endsWith('/') ? `${nonEmpty}/` : nonEmpty;
};
