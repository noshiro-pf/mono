import {
  isTypeAnyType,
  isTypeFlagSet,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import { type TSESTree } from '@typescript-eslint/utils';
import {
  getDefaultOverrides,
  getTypeImmutability,
  Immutability,
} from 'is-immutable-type';
import { type Type, type TypeChecker, TypeFlags } from 'typescript';
import { assignableTypePairs, createRule, isLiteral } from './common.mjs';
import { createNoUnsafeAssignmentRule } from './unsafe-assignment-rule.mjs';

/** An ESLint rule to ban unsafe assignment from mutable to readonly types. */

export const noUnsafeMutableReadonlyAssignment = createRule({
  name: 'no-unsafe-mutable-readonly-assignment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans unsafe assignment from mutable to readonly types.',
    },
    messages: {
      errorStringGeneric:
        'Unsafe "{{ sourceImmutability }}" to "{{ destinationImmutability }}" assignment. Source: "{{ sourceType }}", destination: "{{ destinationType }}"',
    },
    schema: [],
  },
  create: createNoUnsafeAssignmentRule(
    (
      checker: TypeChecker,
      rawDestinationType: Type,
      rawSourceType: Type,
      sourceNode: TSESTree.Expression | undefined,
    ) => {
      if (isLiteral(sourceNode)) {
        return 'safe';
      }

      const typePairs = assignableTypePairs(
        rawDestinationType,
        rawSourceType,
        checker,
      );

      // TODO support config
      const overrides = getDefaultOverrides();

      const allSafe = typePairs.every(({ sourceType, destinationType }) => {
        if (sourceType === destinationType) {
          // safe
          return true;
        }

        if (isTypeAnyType(sourceType) || isTypeAnyType(destinationType)) {
          // safe
          return true;
        }

        if (
          isTypeUnknownType(sourceType) ||
          isTypeUnknownType(destinationType)
        ) {
          // safe
          return true;
        }

        if (isTypeFlagSet(destinationType, TypeFlags.VoidLike)) {
          // safe
          return true;
        }

        const destinationImmutability = getTypeImmutability(
          checker,
          destinationType,
          overrides,
        );
        const sourceImmutability = getTypeImmutability(
          checker,
          sourceType,
          overrides,
        );

        const isUnsafe =
          (destinationImmutability === Immutability.Immutable ||
            destinationImmutability === Immutability.ReadonlyDeep) &&
          (sourceImmutability === Immutability.ReadonlyShallow ||
            sourceImmutability === Immutability.Mutable);

        return !isUnsafe;
      });

      return allSafe ? 'safe' : 'unsafe';
    },
  ),
  defaultOptions: [],
} as const);
