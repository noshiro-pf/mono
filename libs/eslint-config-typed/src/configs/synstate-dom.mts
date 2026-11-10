import { eslintSynstateDomA11yRules } from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

/**
 * The configuration for components written with synstate-dom: the jsx-a11y
 * rules, which read JSX alone (#3408).
 *
 * The rules are jsx-a11y's under `synstate-dom-a11y/`, a second registration
 * that reads an attribute bound to synstate-dom's `constant(x)` as bound to `x`
 * (`withSynstateDomConstants`), so every rule of `eslintConfigForReact`'s set
 * applies as it does there; disable one by that name. The React rules and the
 * hooks rules do not: a synstate-dom component is called once and has no hooks.
 * Browser globals are left to `eslintConfigForBrowser`, which a package adds
 * where it wants them. Name files `eslintConfigForReact` or
 * `eslintConfigForPreact` does not: on a file both cover, `jsx-a11y/` reads
 * `constant(x)` as no value beside these rules, and reports every other finding
 * a second time.
 */
export const eslintConfigForSynstateDom = (
  files?: readonly string[],
): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // The plugin is registered by `eslintConfigForTypeScript`, as are those of
    // every other preset here.
    rules: defineKnownRules(eslintSynstateDomA11yRules),
  }) as const;
