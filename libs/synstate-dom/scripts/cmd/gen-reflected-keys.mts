import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { formatFiles, Result } from 'ts-repo-utils';
import * as ts from 'typescript';
import { propertyNames } from '../../src/internal/dom-tables.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const outputPath = path.resolve(
  workspaceRootPath,
  'test/browser/reflected-keys.generated.mts',
);

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
 * admits as attributes: what `ReflectedProps` lets through, less the keys
 * written as properties (`propertyNames`). The browser test
 * `reflected-keys.test.tsx` binds each one and reads the property back. A
 * TypeScript update that changes the keys leaves the tree dirty after `ws:gen`,
 * and the generated file's first line names this command.
 *
 * It fails on any diagnostic, of the config or of the program: a type that does
 * not resolve, or an option that is not applied (`libReplacement`), would
 * quietly write the keys of another library.
 */
const genReflectedKeys = async (): Promise<void> => {
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

  const base = ts.createCompilerHost(parsed.options);

  const host: ts.CompilerHost = {
    ...base,
    getSourceFile: (fileName, languageVersion, ...args) =>
      path.resolve(fileName) === probePath
        ? ts.createSourceFile(fileName, probeSource, languageVersion)
        : base.getSourceFile(fileName, languageVersion, ...args),
    fileExists: (fileName) =>
      path.resolve(fileName) === probePath || base.fileExists(fileName),
  } as const;

  const program = ts.createProgram({
    // The probe that fails to compile unless the strict standard library is in
    // effect, as `libReplacement` asks.
    rootNames: [
      probePath,
      path.resolve(workspaceRootPath, 'test/strict-lib-active.mts'),
    ],
    options: parsed.options,
    host,
    configFileParsingDiagnostics: parsed.errors,
  });

  // The config's diagnostics among them.
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (Arr.isNonEmpty(diagnostics)) {
    throw new Error(
      ts.formatDiagnostics(diagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => workspaceRootPath,
        getNewLine: () => '\n',
      }),
    );
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

  const keysByTag = checker.getPropertiesOfType(probeType).map((tag) => {
    const keys = checker
      .getPropertiesOfType(checker.getTypeOfSymbol(tag))
      .map((p) => p.name)
      .filter((key) => !properties.has(key))
      .toSorted();

    return [tag.name, keys] as const;
  });

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

await genReflectedKeys();
