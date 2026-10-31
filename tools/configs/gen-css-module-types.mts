import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { preprocessCSS, resolveConfig, type ResolvedConfig } from 'vite';

/**
 * Writes, beside every `*.module.css` under `srcDir`, the declaration
 * TypeScript reads for it (`*.module.d.css.ts`, see `declarationPathOf`), and
 * deletes a declaration whose stylesheet is gone. Each name the stylesheet
 * exports becomes a named `string` export, so a class the stylesheet does not
 * define is a type error rather than `undefined` at run time. Vite's own
 * `*.module.css` typing is an index signature, which `noUncheckedIndexedAccess`
 * turns into `string | undefined` and which accepts any name.
 *
 * The names are the ones Vite's own CSS Modules pass reports (`preprocessCSS`),
 * so `:global(…)`, `@keyframes` and the rest of the syntax are read exactly as
 * the app's build reads them. Every stylesheet is read before anything is
 * written, and a declaration is written only when it changes, already in the
 * layout Prettier gives it. A declaration without the generated header is never
 * overwritten (that is an error) nor deleted.
 *
 * Components import a stylesheet as `import * as styles from
 * './x.module.css'`, so that a class name never shadows a local binding. A
 * package that uses CSS Modules sets `allowArbitraryExtensions` in its
 * `tsconfig.json`, and its `scripts/cmd/gen-css-module-types.mts` is the call
 * site and nothing else.
 */
export const genCssModuleTypes = async ({
  srcDir,
  viteConfigFile,
}: Readonly<{
  srcDir: string;
  /** The app's Vite config; see `resolveCssModulesConfig`. */
  viteConfigFile: string;
}>): Promise<Result<undefined, string>> => {
  try {
    const found = await Array.fromAsync(
      fs.glob('**/*.module.{css,d.css.ts}', {
        cwd: srcDir,
        exclude: (file) => file.includes('node_modules'),
      }),
      (file) => path.resolve(srcDir, file),
    );

    const stylesheets = found.filter((p) => p.endsWith('.module.css'));

    const declarations = new Set(stylesheets.map(declarationPathOf));

    const stale = found.filter(
      (p) => p.endsWith('.module.d.css.ts') && !declarations.has(p),
    );

    // Resolved only when needed, so that deleting a stale declaration does not
    // depend on the app's config.
    const config = Arr.isNonEmpty(stylesheets)
      ? await resolveCssModulesConfig(viteConfigFile)
      : undefined;

    const results =
      config === undefined
        ? ([] as const)
        : await Promise.all(
            stylesheets.map(async (stylesheet) => {
              // eslint-disable-next-line security/detect-non-literal-fs-filename -- found by the glob under srcDir
              const source = await fs.readFile(stylesheet, 'utf8');

              const moduleExports = await cssModuleExports(
                source,
                stylesheet,
                config,
              );

              const file = declarationPathOf(stylesheet);

              const current = await readIfExists(file);

              return {
                file,
                declaration:
                  current === undefined || current.startsWith(generatedHeader)
                    ? cssModuleDeclaration(
                        displayPath(srcDir, stylesheet),
                        moduleExports,
                      )
                    : Result.err(
                        `❌ ${displayPath(srcDir, file)}: written by hand; delete it for gen:css-module-types to write it`,
                      ),
              } as const;
            }),
          );

    const failed = results.filter(({ declaration }) =>
      Result.isErr(declaration),
    );

    if (Arr.isNonEmpty(failed)) {
      return Result.err(
        failed.map(({ declaration }) => declaration.value).join('\n'),
      );
    }

    // Stale declarations go first, and each is read again before writing:
    // on a case-insensitive file system a stylesheet renamed only in case reads
    // its new declaration through the old name, which is stale, and the
    // declaration has to be written afresh under the new one.
    for (const file of stale) {
      const content = await readIfExists(file);

      // A declaration written by hand is left alone.
      if (content?.startsWith(generatedHeader) === true) {
        await fs.rm(file);
      }
    }

    for (const { file, declaration } of results) {
      if ((await readIfExists(file)) !== declaration.value) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- the declaration beside a stylesheet found under srcDir
        await fs.writeFile(file, declaration.value);
      }
    }
  } catch (error) {
    return Result.err(unknownToString(error));
  }

  return Result.ok(undefined);
};

/**
 * Where TypeScript looks for the types of `./x.module.css` under
 * `allowArbitraryExtensions`: `x.module.d.css.ts`. It reads no `.d.css.mts`,
 * which is why this one declaration file is `.ts` in a repository of `.mts`.
 */
export const declarationPathOf = (stylesheet: string): string =>
  stylesheet.replace(/\.css$/u, '.d.css.ts');

/**
 * The app's Vite config, `configFile`, to read CSS Modules with: its `root` and
 * the `postcss.config.*` found from there included. It is refused if it sets
 * `css.modules`, `css.transformer` or `css.postcss`, because the declarations
 * and the Vitest config (`vite-config.mts`) both assume Vite's default CSS
 * Modules options, and Vitest, run from the package root, reads only such a
 * `postcss.config.*` of the app's.
 */
export const resolveCssModulesConfig = async (
  configFile: string,
): Promise<ResolvedConfig> => {
  const config = await resolveConfig(
    { configFile, logLevel: 'silent' },
    'build',
  );

  const { modules, transformer, postcss } = config.css;

  if (
    modules !== undefined ||
    transformer !== 'postcss' ||
    postcss !== undefined
  ) {
    throw new Error(
      `❌ ${configFile}: sets css.modules, css.transformer or css.postcss, which the generated declarations and the Vitest config do not follow`,
    );
  }

  return config;
};

/**
 * What a stylesheet exports, name to value, as Vite's CSS Modules pass reports
 * it for the file at `filePath` under `config` (see `resolveCssModulesConfig`).
 */
export const cssModuleExports = async (
  source: string,
  filePath: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- Vite's own type, handed to `preprocessCSS` untouched
  config: ResolvedConfig,
): Promise<ReadonlyRecord<string, string>> => {
  const { modules } = await preprocessCSS(source, filePath, config);

  return modules ?? {};
};

/**
 * The declaration of what a stylesheet exports, named `fileName` in its header
 * and its errors.
 *
 * Every export must be the stylesheet's own scoped class (or keyframes),
 * `_<name>_…` under the default options `resolveCssModulesConfig` holds the app
 * to. That refuses `@value` and `:export`, which export CSS values, and
 * `composes`, which makes a value several class names that a key of
 * synstate-dom's `class` object cannot be, wherever they come from,
 * `@import`ed files included.
 *
 * A name must be a camelCase identifier, which is how the rest of the code
 * names things, and not a reserved word, which `export declare const` cannot
 * declare (Vite exports one through an alias, but leaves out `default`).
 */
export const cssModuleDeclaration = (
  fileName: string,
  moduleExports: ReadonlyRecord<string, string>,
): Result<string, string> => {
  const notOwnClass = Object.entries(moduleExports)
    .filter(
      ([name, value]) => !value.startsWith(`_${name}_`) || /\s/u.test(value),
    )
    .map(([name]) => `'${name}'`);

  if (Arr.isNonEmpty(notOwnClass)) {
    return Result.err(
      `❌ ${fileName}: composes, @value and :export are not supported, as used by ${notOwnClass.join(', ')}`,
    );
  }

  const sorted = Object.keys(moduleExports).toSorted();

  const invalid = sorted.filter(
    (name) => !/^[a-z][a-zA-Z0-9]*$/u.test(name) || reservedWords.has(name),
  );

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(
      `❌ ${fileName}: names must be camelCase identifiers that are not reserved words: ${invalid.map((name) => `'${name}'`).join(', ')}`,
    );
  }

  if (Arr.isEmpty(sorted)) {
    return Result.err(
      `❌ ${fileName}: exports no name; a stylesheet without one is not a module`,
    );
  }

  // A blank line between the exports, as `padding-line-between-statements`
  // wants them, so that `fix:lint` leaves the generated file as it is.
  const lines = Arr.toUnshifted(
    `${generatedHeader} from ${fileName}; edits here are overwritten.`,
  )(sorted.map((name) => `export declare const ${name}: string;`));

  return Result.ok(`${lines.join('\n\n')}\n`);
};

const generatedHeader = '// Generated by `gen:css-module-types`';

/** The words `export declare const …` cannot take as a name. */
const reservedWords: ReadonlySet<string> = new Set<string>([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

/** `file` relative to `srcDir` with `/`, the same on every platform. */
const displayPath = (srcDir: string, file: string): string =>
  path.relative(srcDir, file).replaceAll(path.sep, '/');

/** The file's content, or `undefined` if it does not exist. */
const readIfExists = async (file: string): Promise<string | undefined> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a declaration path under srcDir
  fs.readFile(file, 'utf8').catch((error: unknown) => {
    if (isRecord(error) && error['code'] === 'ENOENT') {
      return undefined;
    }

    throw error;
  });
