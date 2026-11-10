// This repository's `tools/configs/oxlint-rules.mts` reads this module, and
// Node.js loads that file without a build, so it imports nothing.

/** What every gated entry says: the API, when Node.js has it, its rules. */
export type NodeVersionGated = Readonly<{
  /** How the message names it. */
  name: string;
  /**
   * The first Node.js major that has it, or `undefined` while no release does.
   */
  nodeMajor: number | undefined;
  /** What to write instead, as a sentence. */
  instead: string;
  /**
   * The rules whose fix or suggestions write it. Each is off while the entry
   * exists (`src/configs/typescript.test.mts` asserts so), and goes back on
   * when the entry is deleted.
   */
  rules: readonly string[];
}>;

/**
 * A gated API: a static member of a global (`Error.isError`), or a method
 * (`Uint8Array#toBase64`, with no `object`).
 */
export type NodeVersionGatedApi = NodeVersionGated &
  Readonly<{
    /** The global the API is a static member of; `undefined` for a method. */
    object: string | undefined;
    property: string;
  }>;

/** A gated API that is a static member of a global: one with an `object`. */
export type NodeVersionGatedStaticApi = NodeVersionGatedApi &
  Readonly<{ object: string }>;

/**
 * The `no-restricted-properties`, `no-restricted-globals` and
 * `no-restricted-syntax` options for the gated entries a runtime of `nodeMajor`
 * lacks, every entry when `nodeMajor` is `undefined`: what this package's floor
 * lacks. `eslintConfigForNodeJs` takes it, for files that run only on a known
 * Node.js, such as a repository's own scripts.
 */
export const nodeVersionGateAt = (
  nodeMajor: number | undefined,
): Readonly<{
  properties: readonly Readonly<{
    object?: string;
    property: string;
    message: string;
  }>[];
  globals: readonly Readonly<{ name: string; message: string }>[];
  syntax: readonly Readonly<{ selector: string; message: string }>[];
}> => {
  const lacks = (entry: NodeVersionGated): boolean =>
    nodeMajor === undefined ||
    entry.nodeMajor === undefined ||
    entry.nodeMajor > nodeMajor;

  const apis = nodeVersionGatedApis.filter(lacks);

  return {
    properties: apis.map((api) =>
      isStaticApi(api)
        ? {
            object: api.object,
            property: api.property,
            message: messageOf(api),
          }
        : { property: api.property, message: messageOf(api) },
    ),
    globals: nodeVersionGatedGlobals.filter(lacks).map((global) => ({
      name: global.name,
      message: messageOf(global),
    })),
    syntax: [
      ...nodeVersionGatedSyntax.filter(lacks).map((syntax) => ({
        selector: syntax.selector,
        message: messageOf(syntax),
      })),
      // The static APIs reached through the global object, as in
      // `globalThis.Error.isError`, which `no-restricted-properties` does not
      // match.
      ...apis.filter(isStaticApi).map((api) => ({
        selector: [
          'MemberExpression[computed=false]',
          "[object.type='MemberExpression'][object.computed=false]",
          "[object.object.type='Identifier']",
          '[object.object.name=/^(?:globalThis|global|self|window)$/]',
          `[object.property.name='${api.object}']`,
          `[property.name='${api.property}']`,
        ].join(''),
        message: messageOf(api),
      })),
    ],
  };
};

// `messageOf` and `isStaticApi` are declared before what calls them as the
// module loads: `nodeVersionGatedStaticApis`, and `floorGate` and anything else
// that runs `nodeVersionGateAt` then.
const messageOf = ({ name, nodeMajor, instead }: NodeVersionGated): string =>
  nodeMajor === undefined
    ? (`'${name}' is in no Node.js release yet. ${instead}` as const)
    : (`'${name}' needs Node.js ${nodeMajor.toString()}, and this config supports older ones. ${instead}` as const);

const isStaticApi = (
  api: NodeVersionGatedApi,
): api is NodeVersionGatedStaticApi => api.object !== undefined;

/**
 * Built-in APIs that not every Node.js in this package's `engines.node` has.
 * A call on an older one throws `TypeError: … is not a function` only when the
 * line runs; the type checker and a newer toolchain see nothing wrong.
 *
 * `no-restricted-properties` reports each one
 * ({@link nodeVersionRestrictedProperties}), and `no-restricted-syntax` the
 * `globalThis.`-qualified form of a static one
 * ({@link nodeVersionRestrictedSyntax}). The rules whose fix writes one are
 * off; each entry names them in `rules`. A global
 * ({@link nodeVersionGatedGlobals}) and a syntax
 * ({@link nodeVersionGatedSyntax}) are tables of their own.
 *
 * `src/configs/typescript.test.mts` fails once the `engines.node` floor reaches
 * an entry's `nodeMajor`: delete the entry then, and turn its rules back on.
 *
 * The gate is this package's floor, not a consumer's: one that runs only on a
 * newer Node.js, or only in a browser, replaces the options of the rules. Every
 * consumer in this repository that is not held to the floor is a script or a
 * test run on the repository's own Node.js, which disables a line with a
 * reason.
 */
export const nodeVersionGatedApis: readonly NodeVersionGatedApi[] = [
  {
    // `useErrorIsError` of `unicorn/no-instanceof-builtins` writes it too: an
    // option rather than a rule, left at its default, which is off.
    name: 'Error.isError',
    object: 'Error',
    property: 'isError',
    nodeMajor: 24,
    instead:
      'Use `isError` from https://www.npmjs.com/package/@sindresorhus/is instead.',
    rules: ['unicorn/prefer-error-is-error'],
  },
  {
    name: 'Promise.try',
    object: 'Promise',
    property: 'try',
    nodeMajor: 23,
    instead: 'Call an async function instead, as in `(async () => f())()`.',
    rules: ['unicorn/prefer-promise-try'],
  },
  {
    name: 'RegExp.escape',
    object: 'RegExp',
    property: 'escape',
    nodeMajor: 24,
    instead:
      'Escape the syntax characters by hand, or use https://www.npmjs.com/package/escape-string-regexp.',
    rules: ['unicorn/prefer-regexp-escape'],
  },
  {
    name: 'Uint8Array.fromBase64',
    object: 'Uint8Array',
    property: 'fromBase64',
    nodeMajor: 25,
    instead:
      "Use `Buffer.from(text, 'base64')` instead, or `atob` in a browser.",
    rules: ['unicorn/prefer-uint8array-base64'],
  },
  {
    name: 'Uint8Array#toBase64',
    object: undefined,
    property: 'toBase64',
    nodeMajor: 25,
    instead: "Use `buffer.toString('base64')` instead, or `btoa` in a browser.",
    rules: ['unicorn/prefer-uint8array-base64'],
  },
  {
    name: 'Uint8Array#setFromBase64',
    object: undefined,
    property: 'setFromBase64',
    nodeMajor: 25,
    instead:
      "Decode with `Buffer.from(text, 'base64')` and copy it in with `set` instead.",
    rules: ['unicorn/prefer-uint8array-base64'],
  },
  {
    name: 'Uint8Array.fromHex',
    object: 'Uint8Array',
    property: 'fromHex',
    nodeMajor: 25,
    instead: "Use `Buffer.from(text, 'hex')` instead.",
    rules: ['unicorn/prefer-uint8array-hex'],
  },
  {
    name: 'Uint8Array#toHex',
    object: undefined,
    property: 'toHex',
    nodeMajor: 25,
    instead: "Use `buffer.toString('hex')` instead.",
    rules: ['unicorn/prefer-uint8array-hex'],
  },
  {
    name: 'Uint8Array#setFromHex',
    object: undefined,
    property: 'setFromHex',
    nodeMajor: 25,
    instead:
      "Decode with `Buffer.from(text, 'hex')` and copy it in with `set` instead.",
    rules: ['unicorn/prefer-uint8array-hex'],
  },
  {
    // What `unicorn/prefer-get-or-insert-computed` starts from
    name: 'Map#getOrInsert',
    object: undefined,
    property: 'getOrInsert',
    nodeMajor: 26,
    instead: 'Use `has`, `get` and `set` instead.',
    rules: ['unicorn/prefer-get-or-insert-computed'],
  },
  {
    name: 'Map#getOrInsertComputed',
    object: undefined,
    property: 'getOrInsertComputed',
    nodeMajor: 26,
    instead: 'Use `has`, `get` and `set` instead.',
    rules: ['unicorn/prefer-get-or-insert-computed'],
  },
  {
    name: 'Iterator.concat',
    object: 'Iterator',
    property: 'concat',
    nodeMajor: 26,
    instead: 'Spread the iterables into one array instead.',
    rules: ['unicorn/prefer-iterator-concat'],
  },
  {
    name: 'Iterator.zip',
    object: 'Iterator',
    property: 'zip',
    nodeMajor: undefined,
    instead: 'Index the arrays together instead, as `Arr.zip` does.',
    rules: ['unicorn/prefer-iterator-zip'],
  },
] as const;

/**
 * Built-in globals that not every Node.js in this package's `engines.node`
 * has, which `no-restricted-globals` reports ({@link
 * nodeVersionRestrictedGlobals}). As {@link nodeVersionGatedApis}.
 */
export const nodeVersionGatedGlobals: readonly NodeVersionGated[] = [
  {
    name: 'Temporal',
    nodeMajor: 26,
    instead:
      'Use `Date` instead, reading and writing only its ISO form, which ECMAScript defines exactly.',
    rules: ['unicorn/prefer-temporal', 'unicorn/prefer-temporal-conversion'],
  },
] as const;

/**
 * Syntax that not every Node.js in this package's `engines.node` parses, which
 * `no-restricted-syntax` reports ({@link nodeVersionRestrictedSyntax}). As
 * {@link nodeVersionGatedApis}.
 */
export const nodeVersionGatedSyntax: readonly (NodeVersionGated &
  Readonly<{ selector: string }>)[] = [
  {
    name: '`using` declarations',
    selector:
      "VariableDeclaration[kind='using'], VariableDeclaration[kind='await using']",
    nodeMajor: 24,
    instead: 'Release the resource in a `finally` block instead.',
    rules: ['unicorn/prefer-dispose'],
  },
] as const;

/** The entries of {@link nodeVersionGatedApis} that are static members. */
export const nodeVersionGatedStaticApis: readonly NodeVersionGatedStaticApi[] =
  nodeVersionGatedApis.filter(isStaticApi);

const floorGate = nodeVersionGateAt(undefined);

/** The `no-restricted-properties` options for {@link nodeVersionGatedApis}. */
export const nodeVersionRestrictedProperties = floorGate.properties;

/** The `no-restricted-globals` options for {@link nodeVersionGatedGlobals}. */
export const nodeVersionRestrictedGlobals = floorGate.globals;

/**
 * The `no-restricted-syntax` options for {@link nodeVersionGatedSyntax}, and
 * for the static APIs of {@link nodeVersionGatedApis} reached through the
 * global object.
 */
export const nodeVersionRestrictedSyntax = floorGate.syntax;
