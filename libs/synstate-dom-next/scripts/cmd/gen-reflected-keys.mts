import dedent from 'dedent';
import * as fs_ from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { formatFiles, Result } from 'ts-repo-utils';
import * as ts from 'typescript';
import { propertyNames } from '../../src/bind/dom-tables.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const outputPath = path.resolve(
  workspaceRootPath,
  'test/browser/ported/reflected-keys.generated.mts',
);

/** Where the harness of each TypeScript version keeps its official libraries. */
const strictLibPath = path.resolve(workspaceRootPath, '../../strict-lib');

/** A file the program is given that is not on disk. */
const probePath = path.resolve(
  workspaceRootPath,
  'scripts/reflected-keys-probe.mts',
);

/**
 * What a run on an official library checks besides the probe: the props types
 * (`src/jsx/`) and the files they take types from. The rest of `src/` is
 * implementation, which, compiled against an older library, reports what a
 * consumer never compiles (iterating a `Map` before 5.6's iterator types) and
 * says nothing of the keys.
 */
const propsDir = path.resolve(workspaceRootPath, 'src/jsx') + path.sep;

const propsDependencies = ['src/constant.mts', 'src/bind/dom-tables.mts'].map(
  (file) => path.resolve(workspaceRootPath, file),
);

// The props each tag admits as attributes or properties: its props type less
// the props every element has and the event handlers.
const probeSource = dedent`
  import type {
    CommonElementProps,
    EventProps,
    GeneratedIntrinsicElements,
  } from '../src/jsx/element-props.mjs';

  export type Probe = Readonly<{
    [K in keyof HTMLElementTagNameMap]: Omit<
      GeneratedIntrinsicElements[K],
      | keyof CommonElementProps<HTMLElementTagNameMap[K]>
      | keyof EventProps<HTMLElementTagNameMap[K], HTMLElementEventMap>
    >;
  }>;
`;

/**
 * Writes, for each tag of `HTMLElementTagNameMap`, the keys its props type
 * admits as attributes: what `ReflectedProps` lets through, less the keys
 * written as properties (`propertyNames`). The browser test
 * `ported/reflected-keys.test.tsx` binds each one and reads the property back.
 * A TypeScript update that changes the keys leaves the tree dirty after
 * `ws:gen`, and the generated file's first line names this command.
 *
 * The props are mapped types over `HTMLElementTagNameMap`, so a consumer's
 * compiler evaluates them against the consumer's own `lib.dom.d.ts` (#3449).
 * The keys are therefore the union of those the repository's strict library
 * gives and those the official `lib.dom.d.ts` of every TypeScript version
 * `strict-lib/` has a harness for gives (`temp/copied/`, tracked).
 *
 * It fails on any diagnostic of the repository's own program, the config's
 * included: a type that does not resolve, or an option that is not applied
 * (`libReplacement`), would quietly write the keys of another library.
 */
const genReflectedKeys = async (): Promise<void> => {
  const versions = libVersions();

  if (!Arr.isNonEmpty(versions)) {
    throw new Error(
      `no strict-lib/v*/temp/copied/lib.dom.d.ts in ${strictLibPath}`,
    );
  }

  const keysByTag = unionOfKeys(
    Arr.toUnshifted(keysUnder(undefined))(
      versions.map((version) =>
        keysUnder(path.resolve(strictLibPath, `v${version}`, 'temp/copied')),
      ),
    ),
  );

  const [first, ...rest] = keysByTag.map(([, keys]) => keys);

  const common = (first ?? []).filter((key) =>
    rest.every((keys) => keys.includes(key)),
  );

  const commonSet = new Set(common);

  const byTag = Object.fromEntries(
    keysByTag.map(([tag, keys]) => [
      tag,
      keys.filter((key) => !commonSet.has(key)),
    ]),
  );

  const source = dedent`
    // Written by \`pnpm run gen:reflected-keys\` from the props types; do not edit.
    // \`ws:gen\` rewrites it after a TypeScript update that changes them.
    // cspell:disable -- property names as lib.dom.d.ts spells them

    // The union of the keys under the repository's strict library and under the
    // official lib.dom.d.ts of every TypeScript version strict-lib/ has a harness
    // for.

    /** The keys the props of every HTML element admit as attributes. */
    export const commonReflectedKeys = ${JSON.stringify(common)} as const;

    /**
     * The keys the props of each HTML element admit as attributes beyond
     * \`commonReflectedKeys\`.
     */
    export const reflectedKeysByTag = ${JSON.stringify(byTag)} as const;
  `;

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path in this package
  await fs.writeFile(outputPath, source);

  // Laid out as Prettier would, or every run leaves the tree dirty.
  if (Result.isErr(await formatFiles([outputPath], { silent: true }))) {
    throw new Error(`failed to format ${outputPath}`);
  }
};

type KeysByTag = readonly (readonly [string, readonly string[]])[];

/** The package's config. */
const parseConfig = (): ts.ParsedCommandLine => {
  const configPath = path.resolve(workspaceRootPath, 'tsconfig.json');

  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, undefined, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      );
    },
  });

  if (parsed === undefined) {
    throw new Error(`cannot read ${configPath}`);
  }

  return parsed;
};

/**
 * The diagnostics that fail a run on an official library: those of the config
 * and the options, of the probe and of the props types (`propsDir`,
 * `propsDependencies`), and the global ones last, which the checker reports as
 * it meets them. A dependency missing from the program fails it too.
 */
const checkedDiagnostics = (program: ts.Program): readonly ts.Diagnostic[] => {
  const checked = program.getSourceFiles().filter((file) => {
    const fileName = path.resolve(file.fileName);

    return (
      fileName === probePath ||
      fileName.startsWith(propsDir) ||
      propsDependencies.includes(fileName)
    );
  });

  const checkedNames = new Set(
    checked.map((file) => path.resolve(file.fileName)),
  );

  const missing = propsDependencies.filter((file) => !checkedNames.has(file));

  if (Arr.isNonEmpty(missing)) {
    throw new Error(`not in the program: ${missing.join(', ')}`);
  }

  return [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...checked.flatMap((file) => [
      ...program.getSyntacticDiagnostics(file),
      ...program.getSemanticDiagnostics(file),
    ]),
    ...program.getGlobalDiagnostics(),
  ];
};

/**
 * The keys each tag's props admit as attributes, under the package's config.
 *
 * With `libDir` undefined, that is the repository's own program, the strict
 * library included; any diagnostic fails it.
 *
 * With `libDir`, the official libraries in it are read instead, with the strict
 * library's replacement turned off. The compiler is still the repository's: the
 * mapped types evaluate the same, and an older compiler could not read the
 * newer syntax of the sources. Only the diagnostics `checkedDiagnostics` lists
 * fail it then. The libraries are ESNext and DOM, as the package's config names
 * today, written out so that a library the config adds later, which an older
 * harness may lack, does not reach these runs.
 */
const keysUnder = (libDir: string | undefined): KeysByTag => {
  const parsed = parseConfig();

  const options: ts.CompilerOptions =
    libDir === undefined
      ? parsed.options
      : ({
          ...parsed.options,
          libReplacement: false,
          lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
        } as const);

  const base = ts.createCompilerHost(options);

  const host: ts.CompilerHost = {
    ...base,
    getSourceFile: (fileName, languageVersion, ...args) =>
      path.resolve(fileName) === probePath
        ? ts.createSourceFile(fileName, probeSource, languageVersion)
        : base.getSourceFile(fileName, languageVersion, ...args),
    fileExists: (fileName) =>
      path.resolve(fileName) === probePath || base.fileExists(fileName),
    ...(libDir === undefined
      ? {}
      : {
          getDefaultLibLocation: () => libDir,
          getDefaultLibFileName: () => path.resolve(libDir, 'lib.d.ts'),
        }),
  } as const;

  const program = ts.createProgram({
    // The probe that fails to compile unless the strict standard library is in
    // effect, as `libReplacement` asks.
    rootNames:
      libDir === undefined
        ? [
            probePath,
            path.resolve(workspaceRootPath, 'test/strict-lib-active.mts'),
          ]
        : [probePath],
    options,
    host,
    configFileParsingDiagnostics: parsed.errors,
  });

  // The config's diagnostics among them.
  const diagnostics =
    libDir === undefined
      ? ts.getPreEmitDiagnostics(program)
      : checkedDiagnostics(program);

  if (Arr.isNonEmpty(diagnostics)) {
    throw new Error(
      ts.formatDiagnostics(diagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => workspaceRootPath,
        getNewLine: () => '\n',
      }),
    );
  }

  if (libDir !== undefined) {
    const domFile = program
      .getSourceFiles()
      .find((file) => path.basename(file.fileName) === 'lib.dom.d.ts');

    if (
      domFile === undefined ||
      path.dirname(path.resolve(domFile.fileName)) !== libDir
    ) {
      throw new Error(`lib.dom.d.ts was not read from ${libDir}`);
    }
  }

  const checker = program.getTypeChecker();

  const probe = program.getSourceFile(probePath);

  const symbol =
    probe === undefined ? undefined : checker.getSymbolAtLocation(probe);

  const exported =
    symbol === undefined
      ? undefined
      : checker.getExportsOfModule(symbol).find((s) => s.name === 'Probe');

  if (exported === undefined) {
    throw new Error('the probe has no Probe type');
  }

  const probeType = checker.getDeclaredTypeOfSymbol(exported);

  const properties = new Set<string>(propertyNames);

  return checker.getPropertiesOfType(probeType).map((tag) => {
    const keys = checker
      .getPropertiesOfType(checker.getTypeOfSymbol(tag))
      .map((p) => p.name)
      .filter((key) => !properties.has(key))
      .toSorted();

    return [tag.name, keys] as const;
  });
};

/**
 * The TypeScript versions with a harness in `strict-lib/`, oldest first. A
 * directory not named `v<major>.<minor>` is not one.
 */
const libVersions = (): readonly string[] =>
  fs_
    .globSync('v*/temp/copied/lib.dom.d.ts', { cwd: strictLibPath })
    .map((file) => file.split(path.sep)[0]?.slice(1) ?? '')
    .filter((version) => /^\d+\.\d+$/u.test(version))
    .toSorted((a, b) => {
      const [aMajor = 0, aMinor = 0] = a.split('.').map(Number);

      const [bMajor = 0, bMinor = 0] = b.split('.').map(Number);

      return aMajor === bMajor ? aMinor - bMinor : aMajor - bMajor;
    });

/** For each tag, the keys any of `lists` has, sorted. */
const unionOfKeys = (lists: readonly KeysByTag[]): KeysByTag => {
  const mut_keys = new Map<string, Set<string>>();

  for (const list of lists) {
    for (const [tag, keys] of list) {
      const mut_set = mut_keys.get(tag) ?? new Set<string>();

      for (const key of keys) {
        mut_set.add(key);
      }

      mut_keys.set(tag, mut_set);
    }
  }

  return Array.from(
    mut_keys,
    ([tag, keys]) => [tag, Array.from(keys).toSorted()] as const,
  );
};

await genReflectedKeys();
