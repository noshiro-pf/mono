import { Arr, isString, match, pipe, unknownToString } from 'ts-data-forge';

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
  const pathPrefix = Arr.isNonEmpty(error.path)
    ? (`Error at ${error.path.join('.')}: ` as const)
    : 'Error: ';

  const detailsMessage = createDetailsMessage(
    error,
    maxLengthToPrintActualValue,
  );

  if (detailsMessage !== undefined) {
    return `${pathPrefix}${detailsMessage}`;
  }

  const actualTypeStr = typeof error.actualValue;

  const actualValueStr: string = isString(error.actualValue)
    ? error.actualValue.length <= maxLengthToPrintActualValue
      ? (` "${error.actualValue}"` as const)
      : ''
    : pipe(unknownToString(error.actualValue)).map((s) =>
        s.length <= maxLengthToPrintActualValue ? ` \`${s}\`` : '',
      ).value;

  return `${pathPrefix}expected <${error.expectedType}> type but <${actualTypeStr}> type value${actualValueStr} was passed.`;
};

const createDetailsMessage = (
  error: ValidationError,
  maxLengthToPrintActualValue: number,
): string | undefined => {
  const actualTypeStr = typeof error.actualValue;

  const actualValueStr: string = isString(error.actualValue)
    ? error.actualValue.length <= maxLengthToPrintActualValue
      ? (` "${error.actualValue}"` as const)
      : ''
    : pipe(unknownToString(error.actualValue)).map((s) =>
        s.length <= maxLengthToPrintActualValue ? ` \`${s}\`` : '',
      ).value;

  switch (error.details?.kind) {
    case undefined:
      return undefined;

    case 'custom':
      return error.details.message;

    case 'integer-range':
      return `expected an integer between ${error.details.start} and ${error.details.endExclusive - 1} but${actualValueStr} was passed.`;

    case 'tuple-length':
      return `expected tuple of length ${error.details.expectedLength} but length ${error.details.actualLength} was passed.`;

    case 'array-length':
      return `expected array of length ${error.details.expectedLength} but length ${error.details.actualLength} was passed.`;

    case 'array-min-length':
      return `expected array of length ${error.details.minLength} or more but length ${error.details.actualLength} was passed.`;

    case 'non-empty-array':
      return 'expected non-empty array but empty array was passed.';

    case 'missing-key':
      return `missing required key "${error.details.key}".`;

    case 'excess-key':
      return `excess property "${error.details.key}" is not allowed.`;

    case 'intersection':
      return `expected value to match all types of <${error.details.typeNames.join('>, <')}> but <${actualTypeStr}> type value${actualValueStr} was passed.`;

    case 'enum':
      return `expected one of { ${error.details.values
        .map((value) => String(value))
        .join(', ')} } but${actualValueStr} was passed.`;

    case 'union':
      return `expected one of <${error.details.typeNames.join('>, <')}> but <${actualTypeStr}> type value${actualValueStr} was passed.`;

    case 'record-entry':
      return match(error.details.entry, {
        key: `expected record key type to be <${error.details.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`,
        value: `expected record value type to be <${error.details.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`,
      });

    case 'map-entry':
      return match(error.details.entry, {
        key: `expected Map key type to be <${error.details.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`,
        value: `expected Map value type to be <${error.details.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`,
      });

    case 'set-element':
      return `expected Set element type to be <${error.details.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`;

    case 'brand':
      return `expected value to satisfy constraint: ${error.details.description}.`;
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
}>): ValidationError =>
  ({
    path: [],
    actualValue,
    expectedType,
    typeName,
    details,
  }) as const;
