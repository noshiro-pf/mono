import globals from 'globals';
import { Arr } from 'ts-data-forge';
import {
  nodeVersionGateAt,
  restrictedGlobals,
  restrictedGlobalsWithoutNodeVersionGate,
  restrictedSyntaxWithoutNodeVersionGate,
} from '../rules/index.mjs';
import {
  defineKnownRules,
  type EslintRules,
  type EslintRulesOption,
  type FlatConfig,
} from '../types/index.mjs';

/**
 * The Node.js globals and rules for `files`.
 *
 * `nodeMajor` is for files that run only on a known Node.js, newer than this
 * package's `engines.node` floor — a repository's own scripts, say. The APIs,
 * globals and syntax that the floor lacks and that runtime has are then
 * allowed (`nodeVersionGateAt`); without it, every one the floor lacks is
 * reported. With it, the preset sets the options of `no-restricted-globals`,
 * `no-restricted-properties` and `no-restricted-syntax` for `files`, replacing
 * any set before it there, as a flat config does.
 */
export const eslintConfigForNodeJs = (
  files?: readonly string[],
  options?: Readonly<{ nodeMajor?: number }>,
): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        ...globals.node,
      },
    },
    rules: defineKnownRules({
      ...(options?.nodeMajor === undefined
        ? {
            'no-restricted-globals':
              Arr.toUnshifted('error')(restrictedGlobals),
          }
        : runtimeGate(options.nodeMajor)),
      'no-alert': 'off',
      'no-implicit-globals': 'off',
      'no-script-url': 'off',

      'unicorn/no-document-cookie': 'off',
      'unicorn/no-invalid-fetch-options': 'off',
      'unicorn/no-invalid-remove-event-listener': 'off',
      'unicorn/prefer-blob-reading-methods': 'off',
      'unicorn/prefer-classlist-toggle': 'off',
      'unicorn/prefer-dom-node-append': 'off',
      'unicorn/dom-node-dataset': 'off',
      'unicorn/prefer-dom-node-remove': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
      'unicorn/prefer-event-target': 'off',
      'unicorn/prefer-keyboard-event-key': 'off',
      'unicorn/prefer-modern-dom-apis': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/require-post-message-target-origin': 'off',
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/better-dom-traversing': 'off',
      'unicorn/no-blob-to-file': 'off',
      'unicorn/no-canvas-to-image': 'off',
      'unicorn/no-incorrect-query-selector': 'off',
      'unicorn/no-invalid-file-input-accept': 'off',
      'unicorn/no-late-current-target-access': 'off',
      'unicorn/no-unsafe-dom-html': 'off',
      'unicorn/prefer-add-event-listener-options': 'off',
      'unicorn/prefer-dom-node-html-methods': 'off',
      'unicorn/prefer-location-assign': 'off',
      'unicorn/prefer-path2d': 'off',
      'unicorn/prefer-scoped-selector': 'off',
      'unicorn/prefer-response-static-json': 'off',
      'unicorn/require-css-escape': 'off',
      'unicorn/require-passive-events': 'off',
    }),
  }) as const;

/** The three rules' options for a runtime of `nodeMajor`. */
const runtimeGate = (
  nodeMajor: number,
): Readonly<{
  'no-restricted-globals': EslintRules['no-restricted-globals'];
  'no-restricted-properties': EslintRules['no-restricted-properties'];
  'no-restricted-syntax': EslintRules['no-restricted-syntax'];
}> => {
  const gate = nodeVersionGateAt(nodeMajor);

  const globalsOption: EslintRulesOption['no-restricted-globals'] = [
    ...restrictedGlobalsWithoutNodeVersionGate,
    ...gate.globals,
  ] as const;

  const propertiesOption: EslintRulesOption['no-restricted-properties'] =
    gate.properties;

  const syntaxOption: EslintRulesOption['no-restricted-syntax'] = [
    ...restrictedSyntaxWithoutNodeVersionGate,
    ...gate.syntax,
  ] as const;

  return {
    'no-restricted-globals': Arr.toUnshifted('error')(globalsOption),
    'no-restricted-properties': Arr.toUnshifted('error')(propertiesOption),
    'no-restricted-syntax': Arr.toUnshifted('error')(syntaxOption),
  };
};
