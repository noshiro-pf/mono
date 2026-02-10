/* eslint-disable import-x/unambiguous, vitest/expect-expect, @typescript-eslint/prefer-readonly-parameter-types */
// embed-sample-code-ignore-above
// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
/**
 * Processes user data.
 * @param {object} user - The user object.
 * @param {string[]} user.roles - User roles.
 * @returns {object} Processed data.
 */
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
const processUser = (_user: {
  name: string;
  roles: string[];
}): {
  success: boolean;
} => ({ success: true });

// After applying convertToReadonlyTransformer
/**
 * Processes user data.
 * @param {object} user - The user object. // JSDoc type is not changed
 * @param {readonly string[]} user.roles - User roles. // JSDoc type is not changed
 * @returns {object} Processed data. // JSDoc type is not changed
 */
const processUser2 = (
  _user: Readonly<{
    name: string;
    roles: readonly string[];
  }>,
): Readonly<{ success: boolean }> => ({ success: true }) as const;

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('jsdoc-example', () => {
    /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
    processUser satisfies (_user: { name: string; roles: string[] }) => {
      success: boolean;
    };

    processUser2 satisfies (
      _user: Readonly<{ name: string; roles: readonly string[] }>,
    ) => Readonly<{ success: boolean }>;
  });
}
