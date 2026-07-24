import { Arr, isString, match, pipe, unknownToString } from 'ts-data-forge';

export type ValidationErrorDetails = Readonly<
  | {
      kind: 'custom';
      message: string;
    }
  | {
      kind: 'template-literal';
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
      kind: 'array-max-length';
      maxLength: number;
      actualLength: number;
    }
  | {
      kind: 'array-range-length';
      minLength: number;
      maxLength: number;
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
  | {
      kind: 'string-constraint';
      violation: StringConstraintViolation;
    }
  | {
      kind: 'numeric-constraint';
      numericType: 'bigint' | 'number';
      violation: NumericConstraintViolation;
    }
>;

/**
 * Describes which `string` constraint (see the `string` codec) a value failed,
 * together with the constraint's configured value. `value` doubles as the
 * value shown in the constructor-time "defaultValue ... does not satisfy the
 * constraint ..." message, so it mirrors the raw constraint input (the flag
 * constraints carry `true`, `regex` carries its `source`).
 */
export type StringConstraintViolation = Readonly<
  | {
      constraint: 'nonempty' | 'lowercase' | 'uppercase';
      value: true;
    }
  | {
      constraint: 'minLength' | 'maxLength';
      value: number;
    }
  | {
      constraint: 'startsWith' | 'endsWith' | 'includes';
      value: string;
    }
  | {
      constraint: 'regex';
      value: string;
    }
>;

/**
 * Describes which numeric constraint (see the `number` / `bigint` codecs) a
 * value failed. Range bounds are stringified so a single type can describe both
 * `number` and `bigint` violations; `value` doubles as the value shown in the
 * constructor-time "defaultValue ... does not satisfy the constraint ..."
 * message.
 */
export type NumericConstraintViolation = Readonly<
  | {
      constraint:
        | 'finite'
        | 'int'
        | 'safeInteger'
        | 'nonZero'
        | 'negative'
        | 'nonNegative'
        | 'positive'
        | 'nonPositive';
      value: true;
    }
  | {
      constraint:
        'gt' | 'gte' | 'min' | 'lt' | 'lte' | 'max' | 'multipleOf' | 'step';
      value: string;
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

    case 'template-literal':
      return `expected <${error.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`;

    case 'integer-range':
      return `expected an integer between ${error.details.start} and ${error.details.endExclusive - 1} but${actualValueStr} was passed.`;

    case 'tuple-length':
      return `expected tuple of length ${error.details.expectedLength} but length ${error.details.actualLength} was passed.`;

    case 'array-length':
      return `expected array of length ${error.details.expectedLength} but length ${error.details.actualLength} was passed.`;

    case 'array-min-length':
      return `expected array of length ${error.details.minLength} or more but length ${error.details.actualLength} was passed.`;

    case 'array-max-length':
      return `expected array of length ${error.details.maxLength} or less but length ${error.details.actualLength} was passed.`;

    case 'array-range-length':
      return `expected array of length between ${error.details.minLength} and ${error.details.maxLength} but length ${error.details.actualLength} was passed.`;

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
        .map(String)
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

    case 'string-constraint':
      return stringConstraintToMessage(
        error.details.violation,
        error.actualValue,
        actualValueStr,
      );

    case 'numeric-constraint':
      return numericConstraintToMessage(
        error.details.numericType,
        error.details.violation,
        actualValueStr,
      );
  }
};

const stringConstraintToMessage = (
  violation: StringConstraintViolation,
  actualValue: unknown,
  actualValueStr: string,
): string => {
  const actualLength = isString(actualValue) ? actualValue.length : 0;

  switch (violation.constraint) {
    case 'nonempty':
      return 'expected a non-empty string but an empty string was passed.';

    case 'minLength':
      return `expected a string of length ${violation.value} or more but a string of length ${actualLength}${actualValueStr} was passed.`;

    case 'maxLength':
      return `expected a string of length ${violation.value} or less but a string of length ${actualLength}${actualValueStr} was passed.`;

    case 'startsWith':
      return `expected a string starting with "${violation.value}" but${actualValueStr} was passed.`;

    case 'endsWith':
      return `expected a string ending with "${violation.value}" but${actualValueStr} was passed.`;

    case 'includes':
      return `expected a string containing "${violation.value}" but${actualValueStr} was passed.`;

    case 'uppercase':
      return `expected an uppercase string but${actualValueStr} was passed.`;

    case 'lowercase':
      return `expected a lowercase string but${actualValueStr} was passed.`;

    case 'regex':
      return `expected a string matching /${violation.value}/ but${actualValueStr} was passed.`;
  }
};

const numericConstraintToMessage = (
  numericType: 'bigint' | 'number',
  violation: NumericConstraintViolation,
  actualValueStr: string,
): string => {
  switch (violation.constraint) {
    case 'finite':
      return `expected a finite number but${actualValueStr} was passed.`;

    case 'int':
      return `expected an integer but${actualValueStr} was passed.`;

    case 'safeInteger':
      return `expected a safe integer but${actualValueStr} was passed.`;

    case 'nonZero':
      return `expected a non-zero ${numericType} but${actualValueStr} was passed.`;

    case 'negative':
      return `expected a negative ${numericType} but${actualValueStr} was passed.`;

    case 'nonNegative':
      return `expected a non-negative ${numericType} but${actualValueStr} was passed.`;

    case 'positive':
      return `expected a positive ${numericType} but${actualValueStr} was passed.`;

    case 'nonPositive':
      return `expected a non-positive ${numericType} but${actualValueStr} was passed.`;

    case 'gt':
      return `expected a ${numericType} greater than ${violation.value} but${actualValueStr} was passed.`;

    case 'gte':
    case 'min':
      return `expected a ${numericType} greater than or equal to ${violation.value} but${actualValueStr} was passed.`;

    case 'lt':
      return `expected a ${numericType} less than ${violation.value} but${actualValueStr} was passed.`;

    case 'lte':
    case 'max':
      return `expected a ${numericType} less than or equal to ${violation.value} but${actualValueStr} was passed.`;

    case 'multipleOf':
    case 'step':
      return `expected a ${numericType} to be a multiple of ${violation.value} but${actualValueStr} was passed.`;
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
    path: Arr.toUnshifted(pathSegment)(error.path),
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
