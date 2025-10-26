import { type ESLintPlugin } from '../../../types/index.mjs';
import { noEnums } from './no-enums.mjs';
import { noHiddenTypeAssertions } from './no-hidden-type-assertions.mjs';
import { noNestedFpTsEffects } from './no-nested-fp-ts-effects.mjs';
import { noPartialArrayReduce } from './no-partial-array-reduce.mjs';
import { noPartialDivision } from './no-partial-division.mjs';
import { noPartialStringNormalize } from './no-partial-string-normalize.mjs';
import { noPartialUrlConstructor } from './no-partial-url-constructor.mjs';
import { noPrematureFpTsEffects } from './no-premature-fp-ts-effects.mjs';
import { noUnsafeEnumAssignment } from './no-unsafe-enum-assignment.mjs';
import { noUnsafeMutableReadonlyAssignment } from './no-unsafe-mutable-readonly-assignment.mjs';
import { noUnsafeOptionalPropertyAssignment } from './no-unsafe-optional-property-assignment.mjs';
import { noUnsafeReadonlyMutableAssignment } from './no-unsafe-readonly-mutable-assignment.mjs';
import { noUnsafeTypeAssertion } from './no-unsafe-type-assertion.mjs';
import { requireStrictMode } from './require-strict-mode.mjs';

export const totalFunctionsRules = {
  'no-enums': noEnums,
  'no-hidden-type-assertions': noHiddenTypeAssertions,
  'no-nested-fp-ts-effects': noNestedFpTsEffects,
  'no-partial-array-reduce': noPartialArrayReduce,
  'no-partial-division': noPartialDivision,
  'no-partial-string-normalize': noPartialStringNormalize,
  'no-partial-url-constructor': noPartialUrlConstructor,
  'no-premature-fp-ts-effects': noPrematureFpTsEffects,
  'no-unsafe-enum-assignment': noUnsafeEnumAssignment,
  'no-unsafe-mutable-readonly-assignment': noUnsafeMutableReadonlyAssignment,
  'no-unsafe-optional-property-assignment': noUnsafeOptionalPropertyAssignment,
  'no-unsafe-readonly-mutable-assignment': noUnsafeReadonlyMutableAssignment,
  'no-unsafe-type-assertion': noUnsafeTypeAssertion,
  'require-strict-mode': requireStrictMode,
} as const satisfies ESLintPlugin['rules'];
