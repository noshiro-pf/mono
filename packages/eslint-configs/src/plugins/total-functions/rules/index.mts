import { type Plugin } from '../../../types/index.mjs';
import { noEnums } from './no-enums.mjs';
import { noHiddenTypeAssertions } from './no-hidden-type-assertions.mjs';
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

export const rules = {
  'require-strict-mode': requireStrictMode,
  'no-unsafe-type-assertion': noUnsafeTypeAssertion,
  'no-unsafe-readonly-mutable-assignment': noUnsafeReadonlyMutableAssignment,
  'no-unsafe-mutable-readonly-assignment': noUnsafeMutableReadonlyAssignment,
  'no-enums': noEnums,
  'no-partial-url-constructor': noPartialUrlConstructor,
  'no-partial-division': noPartialDivision,
  'no-partial-string-normalize': noPartialStringNormalize,
  'no-premature-fp-ts-effects': noPrematureFpTsEffects,
  'no-nested-fp-ts-effects': noNestedFpTsEffects,
  'no-partial-array-reduce': noPartialArrayReduce,
  'no-hidden-type-assertions': noHiddenTypeAssertions,
} as const satisfies Plugin['rules'];
