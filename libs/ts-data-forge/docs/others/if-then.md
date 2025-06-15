[**Documentation**](../README.md)

---

[Documentation](../README.md) / others/if-then

# others/if-then

## Functions

### ifThen()

> **ifThen**(`antecedent`, `consequent`): `boolean`

Defined in: [src/others/if-then.mts:97](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/others/if-then.mts#L97)

Implements the logical implication (if-then) operator.

Returns `true` if the antecedent is `false` or the consequent is `true`.
In logical terms: `antecedent → consequent` is equivalent to `¬antecedent ∨ consequent`.

**Truth table:**

- `true → true` = `true` (valid implication)
- `true → false` = `false` (invalid implication)
- `false → true` = `true` (vacuously true)
- `false → false` = `true` (vacuously true)

#### Parameters

##### antecedent

`boolean`

The condition (if part)

##### consequent

`boolean`

The result that should hold if the condition is true (then part)

#### Returns

`boolean`

`true` if the implication holds, `false` otherwise

#### Examples

```typescript
ifThen(true, true); // true  (if true then true = true)
ifThen(true, false); // false (if true then false = false)
ifThen(false, true); // true  (if false then true = true - vacuously true)
ifThen(false, false); // true  (if false then false = true - vacuously true)
```

```typescript
function validateField(value: string, isRequired: boolean): boolean {
    const hasValue = value.trim().length > 0;
    return ifThen(isRequired, hasValue);
}

validateField('hello', true); // true (required and has value)
validateField('', true); // false (required but no value)
validateField('', false); // true (not required, so valid)
validateField('hello', false); // true (not required, but has value is fine)
```

```typescript
function checkPermission(user: User, permission: string): boolean {
    const isAdmin = user.role === 'admin';
    const hasPermission = user.permissions.includes(permission);

    // Admin must have all permissions
    return ifThen(isAdmin, hasPermission);
}

const adminUser = { role: 'admin', permissions: ['read', 'write'] };
checkPermission(adminUser, 'delete'); // false (admin without delete permission = invalid)

const regularUser = { role: 'user', permissions: ['read'] };
checkPermission(regularUser, 'delete'); // true (non-admin without permission is valid)
```

```typescript
interface Subscription {
    isPremium: boolean;
    features: {
        advancedAnalytics: boolean;
        unlimitedStorage: boolean;
        prioritySupport: boolean;
    };
}

function validateSubscription(sub: Subscription): boolean {
    // If premium, then all premium features must be enabled
    return ifThen(
        sub.isPremium,
        sub.features.advancedAnalytics &&
            sub.features.unlimitedStorage &&
            sub.features.prioritySupport,
    );
}
```

```typescript
// "If A then B" AND "If B then C"
function validateChain(a: boolean, b: boolean, c: boolean): boolean {
    return ifThen(a, b) && ifThen(b, c);
}

validateChain(true, true, true); // true (valid chain)
validateChain(true, false, true); // false (breaks at first implication)
validateChain(false, false, false); // true (vacuously true chain)
```

```typescript
// "If not expired then valid" is equivalent to "expired OR valid"
const isExpired = Date.now() > expiryDate;
const isValid = checkValidity();
const result = ifThen(!isExpired, isValid);
// Same as: isExpired || isValid
```
