import { isString, pipe, unknownToString } from 'ts-data-forge';

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
  /** The name of the type that was being validated */
  typeName: string;

  /**
   * Additional context about the validation failure
   * @note This field is for internal implementation purposes and may be undefined.
   * Use `validationErrorToMessage` to stringify the error.
   * @internal
   */
  message: string | undefined;
}>;

export type ValidationErrorWithMessage = MergeIntersection<
  StrictOmit<ValidationError, 'message'> & Readonly<{ message: string }>
>;

/**
 * Converts a validation error to a human-readable string message
 */
export const validationErrorToMessage = (
  error: ValidationError,
  maxLengthToPrintActualValue: number = 20,
): string => {
  const pathStr = error.path.length > 0 ? ` at ${error.path.join('.')}` : '';
  const actualTypeStr = typeof error.actualValue;

  if (error.message !== undefined) {
    return `${error.message}${pathStr}`;
  }

  const actualValueStr: string = isString(error.actualValue)
    ? error.actualValue.length <= maxLengthToPrintActualValue
      ? ` "${error.actualValue}"`
      : ''
    : pipe(unknownToString(error.actualValue)).map((s) =>
        s.length <= maxLengthToPrintActualValue ? ` \`${s}\`` : '',
      ).value;

  return `Expected <${error.expectedType}>${pathStr}, got <${actualTypeStr}> type value${actualValueStr}.`;
};

/**
 * Converts an array of validation errors to an array of string messages
 * (for backward compatibility)
 */
export const validationErrorsToMessages = (
  errors: readonly ValidationError[],
  maxLengthToPrintActualValue: number = 20,
): readonly string[] =>
  errors.map((e) => validationErrorToMessage(e, maxLengthToPrintActualValue));

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
