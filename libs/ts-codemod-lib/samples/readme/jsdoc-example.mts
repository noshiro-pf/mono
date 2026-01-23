/* eslint-disable import-x/unambiguous, vitest/expect-expect, @typescript-eslint/prefer-readonly-parameter-types */
// embed-sample-code-ignore-above
// Before
/**
 * Processes user data.
 * @param {object} user - The user object.
 * @param {string[]} user.roles - User roles.
 * @returns {object} Processed data.
 */
const processUser = (_user: {
  name: string;
  roles: string[];
}): {
  success: boolean;
} => ({ success: true });

// After applying convertToReadonlyTypeTransformer
/**
 * Processes user data.
 * @param {object} user - The user object. // JSDoc type is not changed
 * @param {string[]} user.roles - User roles. // JSDoc type is not changed
 * @returns {object} Processed data. // JSDoc type is not changed
 */
const processUser2 = (
  _user: Readonly<{ name: string; roles: readonly string[] }>,
): Readonly<{ success: boolean }> => ({ success: true });

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('jsdoc-example', () => {
    processUser satisfies (_user: { name: string; roles: string[] }) => {
      success: boolean;
    };

    processUser2 satisfies (
      _user: Readonly<{ name: string; roles: readonly string[] }>,
    ) => Readonly<{ success: boolean }>;
  });
}
