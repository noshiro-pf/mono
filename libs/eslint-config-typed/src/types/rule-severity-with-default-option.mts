/**
 * A simple wrapper function to make the existence of an option setting explicit
 * in the config statement. This function casts `Linter.RuleSeverity` type value
 * to `Linter.Severity` type.
 */
export const withDefaultOption = (severity: 'warn' | 'error'): 1 | 2 => {
  switch (severity) {
    case 'warn':
      return 1;
    case 'error':
      return 2;
  }
};
