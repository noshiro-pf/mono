/**
 * Represents a validation error with structured information
 */
export type ValidationError = Readonly<{
  /** The path to the field that failed validation (e.g., 'user.address.street') */
  path: readonly string[];
  /** The actual value that failed validation */
  actualValue: unknown;
  /** The expected type or constraint */
  expectedType: string;
  /** Additional context about the validation failure */
  message: string | undefined;
  /** The name of the type that was being validated */
  typeName: string;
}>;

export type ValidationErrorWithMessage = MergeIntersection<
  StrictOmit<ValidationError, 'message'> & Readonly<{ message: string }>
>;

/**
 * Converts a validation error to a human-readable string message
 */
export const validationErrorToMessage = (error: ValidationError): string => {
  const pathStr = error.path.length > 0 ? ` at ${error.path.join('.')}` : '';
  const actualTypeStr = typeof error.actualValue;

  if (error.message !== undefined) {
    return `${error.message}${pathStr}`;
  }

  return `Expected ${error.expectedType}${pathStr}, got ${actualTypeStr}`;
};

/**
 * Converts an array of validation errors to an array of string messages
 * (for backward compatibility)
 */
export const validationErrorsToMessages = (
  errors: readonly ValidationError[],
): readonly string[] => errors.map(validationErrorToMessage);

/**
 * Prepends a path segment to all validation errors
 */
export const prependPathToValidationErrors = (
  errors: readonly ValidationError[],
  pathSegment: string,
): readonly ValidationError[] =>
  errors.map((error) => ({
    ...error,
    path: [pathSegment, ...error.path],
  }));

/**
 * Prepends an array index to all validation errors
 */
export const prependIndexToValidationErrors = (
  errors: readonly ValidationError[],
  index: number,
): readonly ValidationError[] =>
  prependPathToValidationErrors(errors, index.toString());

/**
 * Creates a basic validation error for primitive type validation
 */
export const createPrimitiveValidationError = ({
  actualValue,
  expectedType,
  typeName,
}: Readonly<{
  actualValue: unknown;
  expectedType: string;
  typeName: string;
}>): ValidationError => ({
  path: [],
  actualValue,
  expectedType,
  typeName,
  message: undefined,
});
