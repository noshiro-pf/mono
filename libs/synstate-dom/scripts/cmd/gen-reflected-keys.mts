import dedent from 'dedent';
import * as fs_ from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { formatFiles, Result } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { propertyNames } from '../../src/internal/dom-tables.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const outputPath = path.resolve(
  workspaceRootPath,
  'test/browser/reflected-keys.generated.mts',
);

/** Where the harness of each TypeScript version keeps its official libraries. */
const strictLibPath = path.resolve(workspaceRootPath, '../../strict-lib');

/** A file the program is given that is not on disk. */
const probePath = path.resolve(
  workspaceRootPath,
  'scripts/reflected-keys-probe.mts',
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
 * admits: what `ReflectedProps` lets through, as two lists, the keys written as
 * attributes and those written as properties (`propertyNames`). The browser
 * test `reflected-keys.test.tsx` binds each one and reads the property back. A
 * TypeScript update that changes the keys leaves the tree dirty after `ws:gen`,
 * and the generated file's first line names this command.
 *
 * It fails on an entry of `propertyNames` that no tag admits under any of those
 * libraries (#3448): one a `lib.dom.d.ts` drops or renames is still admitted
 * while an older one a consumer may compile against has it, and is dead once
 * none does.
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

  const notAdmitted = Arr.setDifference(
    propertyNames,
    keysByTag.flatMap(([, keys]) => keys),
  );

  if (Arr.isNonEmpty(notAdmitted)) {
    throw new Error(
      `no tag's props admit ${notAdmitted.join(', ')} of propertyNames (src/internal/dom-tables.mts): remove the entry if no lib.dom.d.ts has the property any more, or fix the props types (src/jsx/element-props.mts) if they dropped a key they should admit`,
    );
  }

  const properties = new Set<string>(propertyNames);

  const attributes = splitCommon(keysByTag, (key) => !properties.has(key));

  const written = splitCommon(keysByTag, (key) => properties.has(key));

  const source = dedent`
    // Written by \`pnpm run gen:reflected-keys\` from the props types; do not edit.
    // \`ws:gen\` rewrites it after a TypeScript update that changes them.
    // cspell:disable -- property names as lib.dom.d.ts spells them

    // The union of the keys under the repository's strict library and under the
    // official lib.dom.d.ts of TypeScript ${versions.join(', ')}.

    /** The keys the props of every HTML element admit as attributes. */
    export const commonReflectedKeys = ${JSON.stringify(attributes.common)} as const;

    /**
     * The keys the props of each HTML element admit as attributes beyond
     * \`commonReflectedKeys\`.
     */
    export const reflectedKeysByTag = ${JSON.stringify(attributes.byTag)} as const;

    /**
     * The keys the props of every HTML element admit that are written as properties
     * (\`propertyNames\`).
     */
    export const commonPropertyKeys = ${JSON.stringify(written.common)} as const;

    /**
     * The keys the props of each HTML element admit that are written as properties,
     * beyond \`commonPropertyKeys\`.
     */
    export const propertyKeysByTag = ${JSON.stringify(written.byTag)} as const;
  `;

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path in this package
  await fs.writeFile(outputPath, source);

  // Laid out as Prettier would, or every run leaves the tree dirty.
  if (Result.isErr(await formatFiles([outputPath], { silent: true }))) {
    throw new Error(`failed to format ${outputPath}`);
  }
};

type KeysByTag = readonly (readonly [string, readonly string[]])[];

/**
 * The keys each tag's props admit, under the package's config.
 *
 * With `libDir` undefined, that is the repository's own program, the strict
 * library included; any diagnostic fails it.
 *
 * With `libDir`, the official libraries in it are read instead, with the strict
 * library's replacement turned off. The compiler is still the repository's: the
 * mapped types evaluate the same, and an older compiler could not read the
 * newer syntax of the sources. Only the diagnostics of the props types and the
 * probe fail it then: compiled against an older library, the package's
 * implementation files report what a consumer never compiles (iterating a `Map`
 * before 5.6's iterator types), which says nothing of the keys.
 */
const keysUnder = (libDir: string | undefined): KeysByTag => {
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

  const propsDir = path.resolve(workspaceRootPath, 'src/jsx');

  // The config's diagnostics among them.
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter(
      (diagnostic) =>
        libDir === undefined ||
        diagnostic.file === undefined ||
        path.resolve(diagnostic.file.fileName) === probePath ||
        path.resolve(diagnostic.file.fileName).startsWith(propsDir),
    );

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

  return checker.getPropertiesOfType(probeType).map((tag) => {
    const keys = checker
      .getPropertiesOfType(checker.getTypeOfSymbol(tag))
      .map((p) => p.name)
      .toSorted();

    return [tag.name, keys] as const;
  });
};

/** The TypeScript versions with a harness in `strict-lib/`, oldest first. */
const libVersions = (): readonly string[] =>
  fs_
    .globSync('v*/temp/copied/lib.dom.d.ts', { cwd: strictLibPath })
    .map((file) => file.split(path.sep)[0]?.slice(1) ?? '')
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

/**
 * Of the keys `isIncluded` keeps, those every tag has, and for each tag those it
 * has beyond them.
 */
const splitCommon = (
  keysByTag: KeysByTag,
  isIncluded: (key: string) => boolean,
): Readonly<{
  common: readonly string[];
  byTag: ReadonlyRecord<string, readonly string[]>;
}> => {
  const included = keysByTag.map(
    ([tag, keys]) => [tag, keys.filter(isIncluded)] as const,
  );

  const [first, ...rest] = included.map(([, keys]) => keys);

  const common = (first ?? []).filter((key) =>
    rest.every((keys) => keys.includes(key)),
  );

  const commonSet = new Set(common);

  return {
    common,
    byTag: Object.fromEntries(
      included.map(([tag, keys]) => [
        tag,
        keys.filter((key) => !commonSet.has(key)),
      ]),
    ),
  };
};

await genReflectedKeys();
