import { type components } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

export const RepositoryRulesetConditions = t.strictRecord({
  ref_name: t.optional(
    t.strictRecord({
      /** @description Array of ref names or patterns to include. One of these patterns must match for the condition to pass. Also accepts `~DEFAULT_BRANCH` to include the default branch or `~ALL` to include all branches. */
      include: t.optional(t.array(t.string())),

      /** @description Array of ref names or patterns to exclude. The condition will not pass if any of these patterns match. */
      exclude: t.optional(t.array(t.string())),
    }),
  ),
});

expectType<
  t.TypeOf<typeof RepositoryRulesetConditions>,
  DeepReadonly<components['schemas']['repository-ruleset-conditions']>
>('=');
