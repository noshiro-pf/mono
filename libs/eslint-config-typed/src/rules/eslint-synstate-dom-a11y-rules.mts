import { Arr } from 'ts-data-forge';
import type { EslintSynstateDomA11yRules } from '../types/index.mjs';
import { eslintJsxA11yRules } from './eslint-jsx-a11y-rules.mjs';

/**
 * `eslintJsxA11yRules` under `synstate-dom-a11y/`, the jsx-a11y rules that read
 * synstate-dom's `constant(x)` as `x`.
 */
export const eslintSynstateDomA11yRules: EslintSynstateDomA11yRules =
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- each `jsx-a11y/` key renamed, its entry kept, which is what the type maps
  Object.fromEntries(
    Arr.generate(function* () {
      for (const [name, entry] of Object.entries(eslintJsxA11yRules)) {
        // Every key has the prefix today; a key without it would be sliced into
        // a wrong name, so it is left out, as the type leaves it out.
        if (name.startsWith('jsx-a11y/')) {
          yield [
            `synstate-dom-a11y/${name.slice('jsx-a11y/'.length)}`,
            entry,
          ] as const;
        }
      }
    }),
  ) as EslintSynstateDomA11yRules;
