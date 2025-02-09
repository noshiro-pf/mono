import { type Linter } from 'eslint';

export type RuleSeverityWithDefaultOption = Linter.Severity;

/**
 * A simple wrapper function to make the existence of an option setting explicit
 * in the config statement. This function casts `Linter.RuleSeverity` type value
 * to `RuleSeverityWithDefaultOption` type.
 */
export const withDefaultOption = (
  severity: 'warn' | 'error',
): RuleSeverityWithDefaultOption => {
  switch (severity) {
    case 'warn':
      return 1;
    case 'error':
      return 2;
  }
};
