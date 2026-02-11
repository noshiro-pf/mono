# Local Project-Specific Agent Instructions

This file contains project-specific coding guidelines and conventions that supplement the shared instructions in `common/agents/AGENTS.md`.

## Validation Error Handling

### Centralized Error Message Logic

All validation error messages must be centralized in `src/utils/validation-error.mts` to ensure consistency and maintainability.

#### Guidelines:

1. **Define Error Details Types**: Add new error detail types to `ValidationErrorDetails` in `src/utils/validation-error.mts`
2. **Implement Message Logic**: Add corresponding message generation logic in the `createDetailsMessage` function
3. **Use Structured Details**: Always use the `details` field in `ValidationError` rather than custom error messages

#### Example:

**❌ Don't do this:**
```typescript
// Creating custom error messages inline
const validate = (a: unknown) => {
  if (!isValid(a)) {
    return Result.err([
      createPrimitiveValidationError({
        actualValue: a,
        expectedType: 'MyType',
        typeName: 'MyType',
        details: { kind: 'custom', message: `Custom error for ${a}` },
      }),
    ]);
  }
  return Result.ok(a);
};
```

**✅ Do this instead:**

1. First, add to `ValidationErrorDetails`:
```typescript
// In src/utils/validation-error.mts
export type ValidationErrorDetails = Readonly<
  | {
      kind: 'template-literal';
      pattern?: string;
    }
  | // ... other types
>;
```

2. Then, add message logic:
```typescript
// In createDetailsMessage function
case 'template-literal':
  return error.details.pattern !== undefined
    ? `expected <${error.expectedType}> matching pattern "${error.details.pattern}" but <${actualTypeStr}> type value${actualValueStr} was passed.`
    : `expected <${error.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`;
```

3. Finally, use in your validator:
```typescript
// In your type implementation
const validate = (a: unknown) => {
  if (!is(a)) {
    return Result.err([
      createPrimitiveValidationError({
        actualValue: a,
        expectedType: typeName,
        typeName,
        details: { kind: 'template-literal', pattern: options?.pattern },
      }),
    ]);
  }
  return Result.ok(a);
};
```

#### Benefits:

- **Consistency**: All error messages follow the same format
- **Maintainability**: Update error messages in one place
- **Testability**: Easier to test error message generation
- **Type Safety**: TypeScript ensures all error kinds are handled
- **i18n Ready**: Centralized messages make internationalization easier

#### When to Use `kind: 'custom'`:

The `custom` kind should only be used when:
- The error is truly one-off and doesn't fit any existing pattern
- Adding a new structured type would be overkill
- You're prototyping and plan to refactor later

In most cases, prefer adding a new structured error type to `ValidationErrorDetails`.
