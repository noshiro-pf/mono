import { tsRestrictionsRules } from 'eslint-plugin-ts-restrictions';
import type { ESLintPlugin } from '../../../types/index.mjs';
// Shared with ts-restrictions' moved ids, and kept out of every barrel, which
// `src/index.mts` publishes.
// eslint-disable-next-line import-x/no-internal-modules
import { movedRule } from '../../ts-restrictions/rules/moved-rule.mjs';
import { noEnums } from './no-enums.mjs';
import { noNestedFpTsEffects } from './no-nested-fp-ts-effects.mjs';
import { noPartialArrayReduce } from './no-partial-array-reduce.mjs';
import { noPartialDivision } from './no-partial-division.mjs';
import { noPartialStringNormalize } from './no-partial-string-normalize.mjs';
import { noPartialUrlConstructor } from './no-partial-url-constructor.mjs';
import { noPrematureFpTsEffects } from './no-premature-fp-ts-effects.mjs';
import { noUnsafeMutableReadonlyAssignment } from './no-unsafe-mutable-readonly-assignment.mjs';
import { noUnsafeReadonlyMutableAssignment } from './no-unsafe-readonly-mutable-assignment.mjs';
import { noUnsafeTypeAssertion } from './no-unsafe-type-assertion.mjs';
import { requireStrictMode } from './require-strict-mode.mjs';

/**
 * The rules of `eslint-plugin-total-functions`. `no-hidden-type-assertions`,
 * which grew far past the original's, moved to `eslint-plugin-ts-restrictions`;
 * its old id stays here, deprecated, until the next major (`movedRule`).
 */
export const totalFunctionsRules = {
  'no-enums': noEnums,
  'no-hidden-type-assertions': movedRule(
    tsRestrictionsRules['no-hidden-type-assertions'],
    {
      packageName: 'eslint-plugin-ts-restrictions',
      ruleId: 'ts-restrictions/no-hidden-type-assertions',
      presetTurnsOn: false,
    },
  ),
  'no-nested-fp-ts-effects': noNestedFpTsEffects,
  'no-partial-array-reduce': noPartialArrayReduce,
  'no-partial-division': noPartialDivision,
  'no-partial-string-normalize': noPartialStringNormalize,
  'no-partial-url-constructor': noPartialUrlConstructor,
  'no-premature-fp-ts-effects': noPrematureFpTsEffects,
  'no-unsafe-mutable-readonly-assignment': noUnsafeMutableReadonlyAssignment,
  'no-unsafe-readonly-mutable-assignment': noUnsafeReadonlyMutableAssignment,
  'no-unsafe-type-assertion': noUnsafeTypeAssertion,
  'require-strict-mode': requireStrictMode,
} as const satisfies ESLintPlugin['rules'];
