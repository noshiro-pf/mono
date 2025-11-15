import { ifThen } from './if-then.mjs';

describe(ifThen, () => {
  test('should implement logical implication truth table', () => {
    // True antecedent, true consequent -> true
    expect(ifThen(true, true)).toBe(true);

    // True antecedent, false consequent -> false
    expect(ifThen(true, false)).toBe(false);

    // False antecedent, true consequent -> true (vacuously true)
    expect(ifThen(false, true)).toBe(true);

    // False antecedent, false consequent -> true (vacuously true)
    expect(ifThen(false, false)).toBe(true);
  });

  test('should work for validation logic', () => {
    const validateField = (value: string, isRequired: boolean): boolean => {
      const hasValue = value.trim().length > 0;

      return ifThen(isRequired, hasValue);
    };

    expect(validateField('hello', true)).toBe(true); // required and has value

    expect(validateField('', true)).toBe(false); // required but no value

    expect(validateField('', false)).toBe(true); // not required, so valid

    expect(validateField('hello', false)).toBe(true); // not required, has value
  });

  test('should work for access control logic', () => {
    const checkPermission = (
      isAdmin: boolean,
      hasPermission: boolean,
    ): boolean =>
      // If admin, then must have permission
      ifThen(isAdmin, hasPermission);

    expect(checkPermission(true, true)).toBe(true); // admin with permission

    expect(checkPermission(true, false)).toBe(false); // admin without permission

    expect(checkPermission(false, true)).toBe(true); // non-admin with permission

    expect(checkPermission(false, false)).toBe(true); // non-admin without permission
  });

  test('should work for contract validation', () => {
    const validateSubscription = (
      isPremium: boolean,
      hasAllFeatures: boolean,
    ): boolean =>
      // If premium, then all premium features must be enabled
      ifThen(isPremium, hasAllFeatures);

    expect(validateSubscription(true, true)).toBe(true); // premium with all features

    expect(validateSubscription(true, false)).toBe(false); // premium without all features

    expect(validateSubscription(false, true)).toBe(true); // non-premium with features

    expect(validateSubscription(false, false)).toBe(true); // non-premium without features
  });

  test('should work in chaining scenarios', () => {
    const validateChain = (a: boolean, b: boolean, c: boolean): boolean =>
      ifThen(a, b) && ifThen(b, c);

    expect(validateChain(true, true, true)).toBe(true); // valid chain

    expect(validateChain(true, false, true)).toBe(false); // breaks at first implication

    expect(validateChain(false, false, false)).toBe(true); // vacuously true chain

    expect(validateChain(true, true, false)).toBe(false); // breaks at second implication
  });

  test('should work with negation patterns', () => {
    const checkExpiredLogic = (isExpired: boolean, isValid: boolean): boolean =>
      // "If not expired then valid" is equivalent to "expired OR valid"
      ifThen(!isExpired, isValid);

    expect(checkExpiredLogic(false, true)).toBe(true); // not expired and valid

    expect(checkExpiredLogic(false, false)).toBe(false); // not expired but invalid

    expect(checkExpiredLogic(true, true)).toBe(true); // expired but valid (vacuous)

    expect(checkExpiredLogic(true, false)).toBe(true); // expired and invalid (vacuous)
  });
});
