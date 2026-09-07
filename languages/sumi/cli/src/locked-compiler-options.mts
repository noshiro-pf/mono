import { type ReadonlyRecord } from 'ts-type-forge';

/**
 * The compilerOptions Sumi locks (docs/sumi/spec/compiler-options.md, D-40):
 * the entries whose value decides whether the same source is legal, what
 * the type check says, or how a module resolves. `sumi check` refuses to run
 * against a project whose effective options differ from these, because the
 * result would not be the language's result (D-7). Everything else —
 * `lib`, `types`, `target`, `jsxImportSource`, emit and project layout — is
 * the project's to choose.
 *
 * `tsconfig.base.json` (what projects `extends`) carries the same values; a
 * test keeps the two in sync.
 */
export const lockedCompilerOptions = {
  // ---- type-checking strictness ----
  strict: true,
  noUncheckedIndexedAccess: true,
  exactOptionalPropertyTypes: false,
  noImplicitReturns: true,
  noImplicitOverride: true,
  noFallthroughCasesInSwitch: true,
  noPropertyAccessFromIndexSignature: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  allowUnusedLabels: false,
  allowUnreachableCode: false,

  // ---- subset constraints ----
  erasableSyntaxOnly: true,
  verbatimModuleSyntax: true,
  isolatedModules: true,
  allowImportingTsExtensions: false,
  rewriteRelativeImportExtensions: false,
  experimentalDecorators: false,
  emitDecoratorMetadata: false,
  allowJs: false,
  checkJs: false,

  // ---- module resolution ----
  module: 'nodenext',
  moduleResolution: 'nodenext',
  moduleDetection: 'force',

  // ---- standard library ----
  libReplacement: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  useDefineForClassFields: true,
  jsx: 'react-jsx',
} as const satisfies ReadonlyRecord<string, boolean | string>;

export type LockedCompilerOptionName = keyof typeof lockedCompilerOptions;

/**
 * Locked to `false`, but an *absent* entry does not mean `false` for these:
 * TypeScript treats an unset `allowUnusedLabels` / `allowUnreachableCode` as
 * "report a suggestion", so they have to be written down. For every other
 * `false` entry, absence is TypeScript's own default and is accepted.
 */
export const lockedOptionsThatMustBeExplicit: ReadonlySet<string> = new Set([
  'allowUnusedLabels',
  'allowUnreachableCode',
]);

/**
 * The flags `strict: true` turns on, as of the TypeScript this package
 * depends on (D-34: the peer range is the single source of truth for which
 * TypeScript defines the language). `strict` is locked, so none of these may
 * be turned back off individually — an explicit `false` on any of them is a
 * violation, while absence is fine (it inherits from `strict`).
 */
export const strictFamilyOptionNames: ReadonlySet<string> = new Set([
  'alwaysStrict',
  'noImplicitAny',
  'noImplicitThis',
  'strictBindCallApply',
  'strictBuiltinIteratorReturn',
  'strictFunctionTypes',
  'strictNullChecks',
  'strictPropertyInitialization',
  'useUnknownInCatchVariables',
]);
