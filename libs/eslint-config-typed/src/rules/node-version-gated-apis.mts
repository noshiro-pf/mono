// This repository's `tools/configs/oxlint-rules.mts` reads this module, and
// Node.js loads that file without a build, so it imports nothing.

type NodeVersionGatedApi = Readonly<{
  /** How the message names it. */
  name: string;
  /** The global the API is a static member of; `undefined` for a method. */
  object: string | undefined;
  property: string;
  /** The first Node.js major that has it. */
  nodeMajor: number;
  /** What to write instead, as a sentence. */
  instead: string;
}>;

type StaticApi = NodeVersionGatedApi & Readonly<{ object: string }>;

// Declared before the tables, which call it as the module loads.
const messageOf = ({ name, nodeMajor, instead }: NodeVersionGatedApi): string =>
  `'${name}' needs Node.js ${nodeMajor.toString()}, and this config supports older ones. ${instead}` as const;

/**
 * Built-in APIs that not every Node.js in this package's `engines.node` has.
 * A call on an older one throws `TypeError: … is not a function` only when the
 * line runs; the type checker and a newer toolchain see nothing wrong.
 *
 * `no-restricted-properties` reports each one ({@link
 * nodeVersionRestrictedProperties}), and `no-restricted-syntax` the
 * `globalThis.`-qualified form of a static one ({@link
 * nodeVersionRestrictedSyntax}). The unicorn rules whose fix writes one are
 * off; each entry names its rule.
 *
 * `src/configs/typescript.test.mts` fails once the `engines.node` floor reaches
 * an entry's `nodeMajor`: delete the entry then, and turn its rule back on.
 */
export const nodeVersionGatedApis: readonly NodeVersionGatedApi[] = [
  {
    // `unicorn/prefer-error-is-error`, and `useErrorIsError` of
    // `unicorn/no-instanceof-builtins`
    name: 'Error.isError',
    object: 'Error',
    property: 'isError',
    nodeMajor: 24,
    instead:
      'Use `isError` from https://www.npmjs.com/package/@sindresorhus/is instead.',
  },
  {
    // `unicorn/prefer-promise-try`
    name: 'Promise.try',
    object: 'Promise',
    property: 'try',
    nodeMajor: 23,
    instead: 'Call an async function instead, as in `(async () => f())()`.',
  },
  {
    // `unicorn/prefer-regexp-escape`
    name: 'RegExp.escape',
    object: 'RegExp',
    property: 'escape',
    nodeMajor: 24,
    instead:
      'Escape the syntax characters by hand, or use https://www.npmjs.com/package/escape-string-regexp.',
  },
  {
    // `unicorn/prefer-uint8array-base64`
    name: 'Uint8Array.fromBase64',
    object: 'Uint8Array',
    property: 'fromBase64',
    nodeMajor: 25,
    instead:
      "Use `Buffer.from(text, 'base64')` instead, or `atob` in a browser.",
  },
  {
    // `unicorn/prefer-uint8array-base64`
    name: 'Uint8Array#toBase64',
    object: undefined,
    property: 'toBase64',
    nodeMajor: 25,
    instead: "Use `buffer.toString('base64')` instead, or `btoa` in a browser.",
  },
  {
    // What `unicorn/prefer-get-or-insert-computed` starts from
    name: 'Map#getOrInsert',
    object: undefined,
    property: 'getOrInsert',
    nodeMajor: 26,
    instead: 'Use `has`, `get` and `set` instead.',
  },
  {
    // `unicorn/prefer-get-or-insert-computed`
    name: 'Map#getOrInsertComputed',
    object: undefined,
    property: 'getOrInsertComputed',
    nodeMajor: 26,
    instead: 'Use `has`, `get` and `set` instead.',
  },
] as const;

/** The entries of {@link nodeVersionGatedApis} that are static members. */
export const nodeVersionGatedStaticApis: readonly StaticApi[] =
  nodeVersionGatedApis.filter(
    (api): api is StaticApi => api.object !== undefined,
  );

/** The `no-restricted-properties` options for {@link nodeVersionGatedApis}. */
export const nodeVersionRestrictedProperties: readonly Readonly<{
  object?: string;
  property: string;
  message: string;
}>[] = nodeVersionGatedApis.map((api) =>
  api.object === undefined
    ? { property: api.property, message: messageOf(api) }
    : { object: api.object, property: api.property, message: messageOf(api) },
);

/**
 * The `no-restricted-syntax` options for the static APIs of
 * {@link nodeVersionGatedApis} reached through the global object, as in
 * `globalThis.Error.isError`, which `no-restricted-properties` does not match.
 */
export const nodeVersionRestrictedSyntax: readonly Readonly<{
  selector: string;
  message: string;
}>[] = nodeVersionGatedStaticApis.map((api) => ({
  selector: [
    'MemberExpression[computed=false]',
    "[object.type='MemberExpression'][object.computed=false]",
    "[object.object.type='Identifier']",
    '[object.object.name=/^(?:globalThis|global|self|window)$/]',
    `[object.property.name='${api.object}']`,
    `[property.name='${api.property}']`,
  ].join(''),
  message: messageOf(api),
}));
