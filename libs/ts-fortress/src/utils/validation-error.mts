import { isString, pipe, unknownToString } from 'ts-data-forge';

export type ValidationErrorDetails = Readonly<
  | {
      kind: 'custom';
      message: string;
    }
  | {
      kind: 'enum';
      values: readonly unknown[];
    }
  | {
      kind: 'integer-range';
      start: number;
      endExclusive: number;
    }
  | {
      kind: 'tuple-length';
      expectedLength: number;
      actualLength: number;
    }
  | {
      kind: 'array-length';
      expectedLength: number;
      actualLength: number;
    }
  | {
      kind: 'array-min-length';
      minLength: number;
      actualLength: number;
    }
  | {
      kind: 'non-empty-array';
    }
  | {
      kind: 'missing-key';
      key: string;
    }
  | {
      kind: 'excess-key';
      key: string;
    }
  | {
      kind: 'intersection';
      typeNames: readonly string[];
    }
  | {
      kind: 'union';
      typeNames: readonly string[];
    }
  | {
      kind: 'record-entry';
      entry: 'key' | 'value';
      expectedType: string;
    }
  | {
      kind: 'map-entry';
      entry: 'key' | 'value';
      expectedType: string;
    }
  | {
      kind: 'set-element';
      expectedType: string;
    }
  | {
      kind: 'brand';
      description: string;
    }
>;

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
  /** Optional structured information used to construct a descriptive message */
  details?: ValidationErrorDetails | undefined;
}>;

/**
 * Converts a validation error to a human-readable string message
 */
export const validationErrorToMessage = (
  error: ValidationError,
  maxLengthToPrintActualValue: number = 20,
): string => {
  const pathStr = error.path.length > 0 ? ` at ${error.path.join('.')}` : '';

  const detailsMessage = createDetailsMessage(error);

  if (detailsMessage !== undefined) {
    return `${detailsMessage}${pathStr}`;
  }

  const actualTypeStr = typeof error.actualValue;

  const actualValueStr: string = isString(error.actualValue)
    ? error.actualValue.length <= maxLengthToPrintActualValue
      ? ` "${error.actualValue}"`
      : ''
    : pipe(unknownToString(error.actualValue)).map((s) =>
        s.length <= maxLengthToPrintActualValue ? ` \`${s}\`` : '',
      ).value;

  return `Expected <${error.expectedType}>${pathStr}, got <${actualTypeStr}> type value${actualValueStr}.`;
};

const createDetailsMessage = (error: ValidationError): string | undefined => {
  switch (error.details?.kind) {
    case undefined:
      return undefined;
    case 'custom':
      return error.details.message;
    case 'enum':
      return `The value is expected to be one of the elements contained in { ${error.details.values
        .map((value) => String(value))
        .join(', ')} }`;
    case 'integer-range':
      return `The value is expected to be an integer between ${error.details.start} and ${error.details.endExclusive - 1}`;
    case 'tuple-length':
      return `The length of tuple is expected to be ${error.details.expectedLength}, but it is actually ${error.details.actualLength}`;
    case 'array-length':
      return `Expected array of length ${error.details.expectedLength}, got length ${error.details.actualLength}`;
    case 'array-min-length':
      return `Expected array of length ${error.details.minLength} or more, got length ${error.details.actualLength}`;
    case 'non-empty-array':
      return 'Expected non-empty array, got empty array';
    case 'missing-key':
      return `Missing required key "${error.details.key}"`;
    case 'excess-key':
      return `Excess property "${error.details.key}" is not allowed`;
    case 'intersection':
      return `The type of value is expected to match all types of { ${error.details.typeNames.join(', ')} }`;
    case 'union':
      return `The type of value is expected to be one of the elements contained in { ${error.details.typeNames.join(', ')} }`;
    case 'record-entry':
      return error.details.entry === 'key'
        ? `The key of the record is expected to be <${error.details.expectedType}>`
        : `The value of the record is expected to be <${error.details.expectedType}>`;
    case 'map-entry': {
      const base =
        error.details.entry === 'key'
          ? `The key of the Map is expected to be <${error.details.expectedType}>`
          : `The value of the Map is expected to be <${error.details.expectedType}>`;
      return `${base}, but got <${typeof error.actualValue}> type value \`${unknownToString(error.actualValue)}\``;
    }
    case 'set-element':
      return `The element of the Set is expected to be <${error.details.expectedType}>, but got <${typeof error.actualValue}> type value \`${unknownToString(error.actualValue)}\``;
    case 'brand':
      return `The value must satisfy the constraint corresponding to the brand keys: <${error.details.description}>`;
  }
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
  details,
}: Readonly<{
  actualValue: unknown;
  expectedType: string;
  typeName: string;
  details: ValidationErrorDetails | undefined;
}>): ValidationError => ({
  path: [],
  actualValue,
  expectedType,
  typeName,
  details,
});
