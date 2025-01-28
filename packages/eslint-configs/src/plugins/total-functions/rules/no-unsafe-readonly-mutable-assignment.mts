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
import { type Program, type Type, TypeFlags } from 'typescript';
import { assignableTypePairs, createRule, isLiteral } from './common.mjs';
import { createNoUnsafeAssignmentRule } from './unsafe-assignment-rule.mjs';

/** An ESLint rule to ban unsafe assignment from readonly to mutable types. */

export const noUnsafeReadonlyMutableAssignment = createRule({
  name: 'no-unsafe-readonly-mutable-assignment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans unsafe assignment from readonly to mutable types.',
    },
    messages: {
      errorStringGeneric:
        'Unsafe "{{ sourceImmutability }}" to "{{ destinationImmutability }}" assignment. Source: "{{ sourceType }}", destination: "{{ destinationType }}"',
    },
    schema: [],
  },
  create: createNoUnsafeAssignmentRule(
    (
      program: Program,
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
        program.getTypeChecker(),
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
          program,
          destinationType,
          overrides,
        );
        const sourceImmutability = getTypeImmutability(
          program,
          sourceType,
          overrides,
        );

        const isUnsafe =
          (destinationImmutability === Immutability.ReadonlyShallow ||
            destinationImmutability === Immutability.Mutable) &&
          (sourceImmutability === Immutability.Immutable ||
            sourceImmutability === Immutability.ReadonlyDeep);

        return !isUnsafe;
      });

      return allSafe ? 'safe' : 'unsafe';
    },
  ),
  defaultOptions: [],
} as const);
