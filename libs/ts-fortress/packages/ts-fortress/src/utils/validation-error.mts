import { isMap, isSet } from '@sindresorhus/is';
import { Arr, isString, match, pipe, unknownToString } from 'ts-data-forge';
import { toUnionString } from './to-union-string.mjs';

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
      kind: 'union-category-mismatch';
      memberCount: number;
      memberCategories: readonly string[];
    }
  | {
      kind: 'union-closest-member';
      memberCount: number;
      /** The member whose errors follow the message. */
      closestMemberTypeName: string;
      /**
       * Members that produced the same number of errors as
       * {@link ValidationErrorDetails.closestMemberTypeName} and are therefore
       * just as plausible. Empty when the closest member is unambiguous.
       */
      equallyCloseMemberTypeNames: readonly string[];
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

  const actualValue = describeActualValue(
    error.actualValue,
    maxLengthToPrintActualValue,
  );

  const detailsMessage = createDetailsMessage(error, actualValue);

  return `${pathPrefix}${
    detailsMessage ??
    `expected <${error.expectedType}> type but ${typedValueClause(actualValue)} was passed.`
  }`;
};

/**
 * Human-readable name for the runtime type of a value.
 *
 * `typeof` reports a bare `"object"` for `null` and for every non-primitive,
 * which makes an error message unable to distinguish a plain object from
 * `null` or from the basic containers, so those are named individually.
 */
export const runtimeTypeNameOf = (value: unknown): string =>
  value === null
    ? 'null'
    : Arr.isArray(value)
      ? 'array'
      : isMap(value)
        ? 'Map'
        : isSet(value)
          ? 'Set'
          : typeof value;

/** A value as it is rendered inside an error message. */
type ActualValueView = Readonly<{
  /** See {@link runtimeTypeNameOf}. */
  typeName: string;

  /**
   * The value itself (`"purple"`, `` `5` ``), or `''` when it is longer than
   * the configured maximum print length.
   */
  literal: string;

  /**
   * Replaces {@link literal} when the value is too long to print. Keeps the
   * message informative by describing the value's size instead of dropping it
   * entirely (e.g. `a string of length 50`).
   */
  summary: string;
}>;

const describeActualValue = (
  actualValue: unknown,
  maxLengthToPrintActualValue: number,
): ActualValueView =>
  ({
    typeName: runtimeTypeNameOf(actualValue),
    literal: isString(actualValue)
      ? actualValue.length <= maxLengthToPrintActualValue
        ? (`"${actualValue}"` as const)
        : ('' as const)
      : pipe(unknownToString(actualValue)).map((s) =>
          s.length <= maxLengthToPrintActualValue ? (`\`${s}\`` as const) : '',
        ).value,
    summary: summarizeActualValue(actualValue),
  }) as const;

const summarizeActualValue = (actualValue: unknown): string =>
  isString(actualValue)
    ? (`a string of length ${actualValue.length}` as const)
    : Arr.isArray(actualValue)
      ? (`an array of length ${actualValue.length}` as const)
      : isMap(actualValue)
        ? (`a Map of size ${actualValue.size}` as const)
        : isSet(actualValue)
          ? (`a Set of size ${actualValue.size}` as const)
          : (`a value of type <${runtimeTypeNameOf(actualValue)}>` as const);

/**
 * Renders the subject of the trailing `"... was passed."` clause, prefixed
 * with the value's runtime type (`<string> type value "purple"`).
 *
 * `unmatchedReason` is used only when the value is too long to print: for a
 * type that accepts several shapes (a union, an enum, an intersection),
 * naming the runtime type alone reads as if that type were acceptable, so the
 * reason why the value was rejected has to be spelled out instead.
 */
const typedValueClause = (
  actualValue: ActualValueView,
  unmatchedReason?: string,
): string =>
  actualValue.literal === ''
    ? withUnmatchedReason(actualValue.summary, unmatchedReason)
    : (`<${actualValue.typeName}> type value ${actualValue.literal}` as const);

/** Same as {@link typedValueClause}, but without the leading type name. */
const bareValueClause = (
  actualValue: ActualValueView,
  unmatchedReason?: string,
): string =>
  actualValue.literal === ''
    ? withUnmatchedReason(actualValue.summary, unmatchedReason)
    : actualValue.literal;

const withUnmatchedReason = (
  summary: string,
  unmatchedReason: string | undefined,
): string =>
  unmatchedReason === undefined
    ? summary
    : (`${summary} ${unmatchedReason}` as const);

/**
 * Maximum length of the ` | `-joined listing of union member type names that a
 * message may spell out. Beyond it a listing is more noise than help, so both
 * users of this bound summarize instead: `union` switches from listing every
 * member to reporting the closest one, and the closest-member message stops
 * naming the members that tie with it.
 */
export const UNION_MEMBER_LISTING_MAX_LENGTH = 60;

/**
 * Names the closest union member, plus the members that are just as close.
 *
 * The tie is a subset of members that were already too many to list, so the
 * bound is applied to the names this clause *adds* — the closest member is
 * named either way.
 */
const closestMemberClause = (
  closestMemberTypeName: string,
  equallyCloseMemberTypeNames: readonly string[],
): string => {
  if (!Arr.isNonEmpty(equallyCloseMemberTypeNames)) {
    return `the closest member type is <${closestMemberTypeName}>, which failed as follows:`;
  }

  if (
    toUnionString(equallyCloseMemberTypeNames).length >
    UNION_MEMBER_LISTING_MAX_LENGTH
  ) {
    return `${equallyCloseMemberTypeNames.length + 1} members are equally close; <${closestMemberTypeName}> failed as follows:`;
  }

  const allTypeNames = Arr.toUnshifted(closestMemberTypeName)(
    equallyCloseMemberTypeNames,
  );

  return `the closest member types are <${allTypeNames.join('>, <')}>; the first of them failed as follows:`;
};

const createDetailsMessage = (
  error: ValidationError,
  actualValue: ActualValueView,
): string | undefined => {
  switch (error.details?.kind) {
    case undefined:
      return undefined;

    case 'custom':
      return error.details.message;

    case 'template-literal':
      return `expected <${error.expectedType}> but ${typedValueClause(actualValue)} was passed.`;

    case 'integer-range':
      return `expected an integer between ${error.details.start} and ${error.details.endExclusive - 1} but ${bareValueClause(actualValue)} was passed.`;

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
      return `expected value to match all types of <${error.details.typeNames.join('>, <')}> but ${typedValueClause(actualValue, 'not matching all of them')} was passed.`;

    case 'enum':
      return `expected one of { ${error.details.values
        .map(String)
        .join(
          ', ',
        )} } but ${bareValueClause(actualValue, 'matching none of them')} was passed.`;

    case 'union':
      return `expected one of <${error.details.typeNames.join('>, <')}> but ${typedValueClause(actualValue, 'matching none of them')} was passed.`;

    case 'union-category-mismatch':
      return `the value did not match any of the ${error.details.memberCount} members of the union; expected a value of type <${error.details.memberCategories.join('> | <')}> but ${typedValueClause(actualValue)} was passed.`;

    case 'union-closest-member':
      return `the value did not match any of the ${error.details.memberCount} members of the union; ${closestMemberClause(
        error.details.closestMemberTypeName,
        error.details.equallyCloseMemberTypeNames,
      )}`;

    case 'record-entry':
      return match(error.details.entry, {
        key: `expected record key type to be <${error.details.expectedType}> but ${typedValueClause(actualValue)} was passed.`,
        value: `expected record value type to be <${error.details.expectedType}> but ${typedValueClause(actualValue)} was passed.`,
      });

    case 'map-entry':
      return match(error.details.entry, {
        key: `expected Map key type to be <${error.details.expectedType}> but ${typedValueClause(actualValue)} was passed.`,
        value: `expected Map value type to be <${error.details.expectedType}> but ${typedValueClause(actualValue)} was passed.`,
      });

    case 'set-element':
      return `expected Set element type to be <${error.details.expectedType}> but ${typedValueClause(actualValue)} was passed.`;

    case 'brand':
      return `expected value to satisfy constraint: ${error.details.description}.`;

    case 'string-constraint':
      return stringConstraintToMessage(
        error.details.violation,
        error.actualValue,
        actualValue,
      );

    case 'numeric-constraint':
      return numericConstraintToMessage(
        error.details.numericType,
        error.details.violation,
        actualValue,
      );
  }
};

const stringConstraintToMessage = (
  violation: StringConstraintViolation,
  rawActualValue: unknown,
  actualValue: ActualValueView,
): string => {
  const actualLength = isString(rawActualValue) ? rawActualValue.length : 0;

  // The length carries the constraint violation, so the value itself is only
  // appended when it is short enough to print.
  const lengthClause =
    actualValue.literal === ''
      ? (`a string of length ${actualLength}` as const)
      : (`a string of length ${actualLength} ${actualValue.literal}` as const);

  switch (violation.constraint) {
    case 'nonempty':
      return 'expected a non-empty string but an empty string was passed.';

    case 'minLength':
      return `expected a string of length ${violation.value} or more but ${lengthClause} was passed.`;

    case 'maxLength':
      return `expected a string of length ${violation.value} or less but ${lengthClause} was passed.`;

    case 'startsWith':
      return `expected a string starting with "${violation.value}" but ${bareValueClause(actualValue)} was passed.`;

    case 'endsWith':
      return `expected a string ending with "${violation.value}" but ${bareValueClause(actualValue)} was passed.`;

    case 'includes':
      return `expected a string containing "${violation.value}" but ${bareValueClause(actualValue)} was passed.`;

    case 'uppercase':
      return `expected an uppercase string but ${bareValueClause(actualValue)} was passed.`;

    case 'lowercase':
      return `expected a lowercase string but ${bareValueClause(actualValue)} was passed.`;

    case 'regex':
      return `expected a string matching /${violation.value}/ but ${bareValueClause(actualValue)} was passed.`;
  }
};

const numericConstraintToMessage = (
  numericType: 'bigint' | 'number',
  violation: NumericConstraintViolation,
  actualValue: ActualValueView,
): string => {
  switch (violation.constraint) {
    case 'finite':
      return `expected a finite number but ${bareValueClause(actualValue)} was passed.`;

    case 'int':
      return `expected an integer but ${bareValueClause(actualValue)} was passed.`;

    case 'safeInteger':
      return `expected a safe integer but ${bareValueClause(actualValue)} was passed.`;

    case 'nonZero':
      return `expected a non-zero ${numericType} but ${bareValueClause(actualValue)} was passed.`;

    case 'negative':
      return `expected a negative ${numericType} but ${bareValueClause(actualValue)} was passed.`;

    case 'nonNegative':
      return `expected a non-negative ${numericType} but ${bareValueClause(actualValue)} was passed.`;

    case 'positive':
      return `expected a positive ${numericType} but ${bareValueClause(actualValue)} was passed.`;

    case 'nonPositive':
      return `expected a non-positive ${numericType} but ${bareValueClause(actualValue)} was passed.`;

    case 'gt':
      return `expected a ${numericType} greater than ${violation.value} but ${bareValueClause(actualValue)} was passed.`;

    case 'gte':
    case 'min':
      return `expected a ${numericType} greater than or equal to ${violation.value} but ${bareValueClause(actualValue)} was passed.`;

    case 'lt':
      return `expected a ${numericType} less than ${violation.value} but ${bareValueClause(actualValue)} was passed.`;

    case 'lte':
    case 'max':
      return `expected a ${numericType} less than or equal to ${violation.value} but ${bareValueClause(actualValue)} was passed.`;

    case 'multipleOf':
    case 'step':
      return `expected a ${numericType} to be a multiple of ${violation.value} but ${bareValueClause(actualValue)} was passed.`;
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
