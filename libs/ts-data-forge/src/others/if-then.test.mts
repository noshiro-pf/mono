import { ifThen } from './if-then.mjs';

describe(ifThen, () => {
  test('should implement logical implication truth table', () => {
    // True antecedent, true consequent -> true
    assert.isTrue(ifThen(true, true));

    // True antecedent, false consequent -> false
    assert.isFalse(ifThen(true, false));

    // False antecedent, true consequent -> true (vacuously true)
    assert.isTrue(ifThen(false, true));

    // False antecedent, false consequent -> true (vacuously true)
    assert.isTrue(ifThen(false, false));
  });

  test('should work for validation logic', () => {
    const validateField = (value: string, isRequired: boolean): boolean => {
      const hasValue = value.trim().length > 0;

      return ifThen(isRequired, hasValue);
    };

    assert.isTrue(validateField('hello', true)); // required and has value

    assert.isFalse(validateField('', true)); // required but no value

    assert.isTrue(validateField('', false)); // not required, so valid

    assert.isTrue(validateField('hello', false)); // not required, has value
  });

  test('should work for access control logic', () => {
    const checkPermission = (
      isAdmin: boolean,
      hasPermission: boolean,
    ): boolean =>
      // If admin, then must have permission
      ifThen(isAdmin, hasPermission);

    assert.isTrue(checkPermission(true, true)); // admin with permission

    assert.isFalse(checkPermission(true, false)); // admin without permission

    assert.isTrue(checkPermission(false, true)); // non-admin with permission

    assert.isTrue(checkPermission(false, false)); // non-admin without permission
  });

  test('should work for contract validation', () => {
    const validateSubscription = (
      isPremium: boolean,
      hasAllFeatures: boolean,
    ): boolean =>
      // If premium, then all premium features must be enabled
      ifThen(isPremium, hasAllFeatures);

    assert.isTrue(validateSubscription(true, true)); // premium with all features

    assert.isFalse(validateSubscription(true, false)); // premium without all features

    assert.isTrue(validateSubscription(false, true)); // non-premium with features

    assert.isTrue(validateSubscription(false, false)); // non-premium without features
  });

  test('should work in chaining scenarios', () => {
    const validateChain = (a: boolean, b: boolean, c: boolean): boolean =>
      ifThen(a, b) && ifThen(b, c);

    assert.isTrue(validateChain(true, true, true)); // valid chain

    assert.isFalse(validateChain(true, false, true)); // breaks at first implication

    assert.isTrue(validateChain(false, false, false)); // vacuously true chain

    assert.isFalse(validateChain(true, true, false)); // breaks at second implication
  });

  test('should work with negation patterns', () => {
    const checkExpiredLogic = (isExpired: boolean, isValid: boolean): boolean =>
      // "If not expired then valid" is equivalent to "expired OR valid"
      ifThen(!isExpired, isValid);

    assert.isTrue(checkExpiredLogic(false, true)); // not expired and valid

    assert.isFalse(checkExpiredLogic(false, false)); // not expired but invalid

    assert.isTrue(checkExpiredLogic(true, true)); // expired but valid (vacuous)

    assert.isTrue(checkExpiredLogic(true, false)); // expired and invalid (vacuous)
  });
});
