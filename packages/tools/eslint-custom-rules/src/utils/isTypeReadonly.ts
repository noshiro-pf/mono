/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import {
  intersectionTypeParts,
  isIntersectionType,
  isObjectType,
  isPropertyReadonlyInType,
  isUnionOrIntersectionType,
  isUnionType,
  unionTypeParts,
} from 'tsutils';
import ts from 'typescript';
import { nullThrows, NullThrowsReasons } from './nullThrows';
import { getTypeOfPropertyOfType } from './propertyTypes';

const enum Readonlyness {
  /** the type cannot be handled by the function */
  UnknownType = 1,
  /** the type is mutable */
  Mutable = 2,
  /** the type is readonly */
  Readonly = 3,
}

export interface ReadonlynessOptions {
  readonly treatMethodsAsReadonly?: boolean;
}

export const readonlynessOptionsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    treatMethodsAsReadonly: {
      type: 'boolean',
    },
  },
};

export const readonlynessOptionsDefaults: ReadonlynessOptions = {
  treatMethodsAsReadonly: false,
};

const checkTypeArguments = (
  checker: ts.TypeChecker,
  seenTypes: Set<ts.Type>,
  typeReference: ts.TypeReference
): Readonlyness => {
  const typeArguments = checker.getTypeArguments(typeReference);
  // this shouldn't happen in reality as:
  // - tuples require at least 1 type argument
  // - ReadonlyArray requires at least 1 type argument
  /* istanbul ignore if */ if (typeArguments.length === 0) {
    return Readonlyness.Readonly;
  }

  // validate the element types are also readonly
  if (
    typeArguments
      .filter((t) => !seenTypes.has(t))
      .some(
        (typeArg) =>
          isTypeReadonlyRecurser(checker, typeArg, seenTypes) ===
          Readonlyness.Mutable
      )
  ) {
    return Readonlyness.Mutable;
  }
  return Readonlyness.Readonly;
};

const isTypeReadonlyArrayOrTuple = (
  checker: ts.TypeChecker,
  type: ts.Type,
  seenTypes: Set<ts.Type>
): Readonlyness => {
  if (checker.isArrayType(type)) {
    const symbol = nullThrows(
      type.getSymbol(),
      NullThrowsReasons.MissingToken('symbol', 'array type')
    );
    const escapedName = symbol.getEscapedName();
    if (escapedName === 'Array') {
      return Readonlyness.Mutable;
    }

    return checkTypeArguments(checker, seenTypes, type);
  }

  if (checker.isTupleType(type)) {
    if (!type.target.readonly) {
      return Readonlyness.Mutable;
    }

    return checkTypeArguments(checker, seenTypes, type);
  }

  return Readonlyness.UnknownType;
};

const isTypeReadonlyObject = (
  checker: ts.TypeChecker,
  type: ts.Type,
  seenTypes: Set<ts.Type>
): Readonlyness => {
  const checkIndexSignature = (kind: ts.IndexKind): Readonlyness => {
    const indexInfo = checker.getIndexInfoOfType(type, kind);
    if (indexInfo !== undefined) {
      return indexInfo.isReadonly
        ? Readonlyness.Readonly
        : Readonlyness.Mutable;
    }

    return Readonlyness.UnknownType;
  };

  const properties = type.getProperties();
  if (properties.length > 0) {
    // ensure the properties are marked as readonly
    for (const property of properties) {
      // console.log(checker.getTypeOfPropertyOfType(type, property.getName()));
      // memo: isPropertyReadonlyInType sometimes fails
      if (!isPropertyReadonlyInType(type, property.getEscapedName(), checker)) {
        return Readonlyness.Mutable;
      }
    }
    // all properties were readonly
    // now ensure that all of the values are readonly also.
    // do this after checking property readonly-ness as a perf optimization,
    // as we might be able to bail out early due to a mutable property before
    // doing this deep, potentially expensive check.
    for (const property of properties) {
      const propertyType = getTypeOfPropertyOfType(checker, type, property);
      if (propertyType === undefined) {
        console.error(
          `Expected to find a property "${property.name}" for the type.`
        );
        continue;
      }
      // handle recursive types.
      // we only need this simple check, because a mutable recursive type will break via the above prop readonly check
      if (seenTypes.has(propertyType)) {
        continue;
      }
      if (
        isTypeReadonlyRecurser(checker, propertyType, seenTypes) ===
        Readonlyness.Mutable
      ) {
        return Readonlyness.Mutable;
      }
    }
  }

  const isStringIndexSigReadonly = checkIndexSignature(ts.IndexKind.String);
  if (isStringIndexSigReadonly === Readonlyness.Mutable) {
    return isStringIndexSigReadonly;
  }

  const isNumberIndexSigReadonly = checkIndexSignature(ts.IndexKind.Number);
  if (isNumberIndexSigReadonly === Readonlyness.Mutable) {
    return isNumberIndexSigReadonly;
  }

  return Readonlyness.Readonly;
};

// a helper function to ensure the seenTypes map is always passed down, except by the external caller
const isTypeReadonlyRecurser = (
  checker: ts.TypeChecker,
  type: ts.Type,
  seenTypes: Set<ts.Type>
): Readonlyness.Readonly | Readonlyness.Mutable => {
  if (type === undefined || type === null) {
    throw new Error("type shouldn't be nullable");
  }
  seenTypes.add(type);

  if (isUnionType(type)) {
    // all types in the union must be readonly
    return unionTypeParts(type)
      .filter((t) => !seenTypes.has(t))
      .every((t) => isTypeReadonlyRecurser(checker, t, seenTypes))
      ? Readonlyness.Readonly
      : Readonlyness.Mutable;
  }

  if (isIntersectionType(type)) {
    // all types in the union must be readonly
    return intersectionTypeParts(type)
      .filter((t) => !seenTypes.has(t))
      .every((t) => isTypeReadonlyRecurser(checker, t, seenTypes))
      ? Readonlyness.Readonly
      : Readonlyness.Mutable;
  }

  // all non-object, non-intersection types are readonly.
  // this should only be primitive types
  if (!isObjectType(type) && !isUnionOrIntersectionType(type)) {
    return Readonlyness.Readonly;
  }

  // pure function types are readonly
  if (
    type.getCallSignatures().length > 0 &&
    type.getProperties().length === 0
  ) {
    return Readonlyness.Readonly;
  }

  // Array
  const isReadonlyArray = isTypeReadonlyArrayOrTuple(checker, type, seenTypes);
  if (isReadonlyArray !== Readonlyness.UnknownType) {
    return isReadonlyArray;
  }

  // Set & Map
  const escapedName = type.getSymbol()?.getEscapedName();
  switch (escapedName) {
    case 'Set':
    case 'Map':
      return Readonlyness.Mutable;

    case 'ReadonlySet':
    case 'ReadonlyMap': {
      if (!('target' in type)) {
        throw new Error('');
      }
      const isTypeArgumentsReadonly = checkTypeArguments(
        checker,
        seenTypes,
        type
      );
      if (isTypeArgumentsReadonly !== Readonlyness.UnknownType) {
        return isTypeArgumentsReadonly;
      }
      break;
    }
    default:
      break;
  }

  // Object
  const isReadonlyObject = isTypeReadonlyObject(checker, type, seenTypes);
  /* istanbul ignore else */ if (
    isReadonlyObject !== Readonlyness.UnknownType
  ) {
    return isReadonlyObject;
  }

  throw new Error('Unhandled type');
  // return Readonlyness.Mutable;
};

/**
 * Checks if the given type is readonly
 */
export const isTypeReadonly = (
  checker: ts.TypeChecker,
  type: ts.Type
): boolean =>
  isTypeReadonlyRecurser(checker, type, new Set()) === Readonlyness.Readonly;
