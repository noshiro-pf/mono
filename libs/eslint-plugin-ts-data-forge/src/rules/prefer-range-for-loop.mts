import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getArgumentText,
  hasCommentWithin,
  isIdentifierNamed,
  outermostTypeWrapper,
  parenthesesDepth,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
  typeHoldsAtSomeLayer,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import { TS_TYPE_FORGE_BRAND_MARKER } from './constants.mjs';
import { tsDataForgeValueAt } from './import-binding.mjs';

type Options = readonly [];

type MessageIds =
  | 'useRangeForLoop'
  | 'suggestRangeForLoop'
  | 'suggestRangeForLoopNarrows'
  | 'noCastFitsRangeForLoop';

/**
 * Reports `for (let i = begin; i < end; ++i)` and rewrites it to
 * `for (const i of range(begin, end))`.
 *
 * `range` takes a `SafeInt` or a small integer literal, not a `number`, so the
 * rewrite is a fix only when the arguments it writes are each one of those, a
 * positive one for the step, and otherwise at most a suggestion: the author has
 * to choose a cast (`asSafeInt(n)` throws on a non-integer).
 */
export const preferRangeForLoop: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `for (let i = begin; i < end; ++i)` with `for (const i of range(begin, end))` from ts-data-forge.',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      useRangeForLoop:
        'Replace with `for (const {{varName}} of range({{args}}))` from ts-data-forge.',
      suggestRangeForLoop:
        'Replace with `for (const {{varName}} of range({{args}}))` from ts-data-forge, then cast what `range` does not accept: it takes a `SafeInt` or an integer literal from {{smallIntMin}} to {{smallIntMax}} (`asSafeInt` throws on anything else).{{stepNote}}',
      suggestRangeForLoopNarrows:
        'Replace with `for (const {{varName}} of range({{args}}))` from ts-data-forge, then check the body: `{{varName}}` becomes what `range` yields, a `SafeInt`, where it was a `number`, and {{narrowing}}.',
      noCastFitsRangeForLoop:
        '`for (const {{varName}} of range({{args}}))` from ts-data-forge cannot replace this loop: {{reasons}}.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    /**
     * Whether `wrapped`, an end or a step of `loop`, is the same value on every
     * iteration. The loop reads its end and its step on every iteration, and
     * `range` reads them once. Stable are:
     *
     * - a literal;
     * - for an end (`role`), `-x` or `+x` of a stable `x` typed a number. Not
     *   for a step: see the comment at the call;
     * - a variable typed a primitive at every layer of type wrappers (an object,
     *   an `any` or an `unknown` may be converted anew on every iteration), that
     *   this file writes nowhere but in a single declaration outside the loop
     *   (not only in the loop, since a function the loop calls could write it),
     *   and that nothing outside this file writes: not an imported `let` or
     *   `var`, an ambient `declare let`, nor a script's global.
     *
     * Anything else is taken for changing, whether it changes or not. A write
     * scope analysis does not see (a sloppy-mode `arguments[0] = …`, `with`,
     * `eval`) can still make a changing value look stable.
     */
    const isStableBound = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      wrapped: TSESTree.Node,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      loop: TSESTree.ForStatement,
      role: 'end' | 'step',
    ): boolean => {
      const node = skipTypeWrappers(wrapped);

      if (node.type === AST_NODE_TYPES.Literal) {
        return true;
      }

      if (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        (node.operator === '-' || node.operator === '+')
      ) {
        return (
          role === 'end' &&
          typeHoldsAtEveryLayer(sourceCode, node.argument, isNumberType) &&
          isStableBound(node.argument, loop, role)
        );
      }

      if (node.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      const variable = ASTUtils.findVariable(
        sourceCode.getScope(node),
        node.name,
      );

      if (variable === null || !Arr.isFixedLengthArray(1, variable.defs)) {
        return false;
      }

      const [def] = variable.defs;

      return (
        typeHoldsAtEveryLayer(sourceCode, wrapped, isPrimitiveType) &&
        variable.references.every(
          (reference) => !reference.isWrite() || reference.init === true,
        ) &&
        !isWrittenElsewhere(def, variable.scope.type, node) &&
        // A declaration that runs while the loop runs writes the variable anew.
        !(
          def.node.range[0] >= loop.range[0] &&
          def.node.range[1] <= loop.range[1]
        ) &&
        !(
          def.type === TSESLint.Scope.DefinitionType.Variable &&
          (def.parent.parent.type === AST_NODE_TYPES.ForOfStatement ||
            def.parent.parent.type === AST_NODE_TYPES.ForInStatement)
        )
      );
    };

    /**
     * Whether something outside this file may write the variable `def`
     * declares: an imported `let` or `var` (or an import the checker cannot
     * follow), an ambient `declare let` or `declare var`, or a global of a
     * script. `identifier` is a reference to it.
     */
    const isWrittenElsewhere = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      def: TSESLint.Scope.Definition,
      scopeType: string,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      identifier: TSESTree.Identifier,
    ): boolean => {
      if (def.type === TSESLint.Scope.DefinitionType.ImportBinding) {
        return importsMutableBinding(identifier);
      }

      if (def.type !== TSESLint.Scope.DefinitionType.Variable) {
        return false;
      }

      return (
        def.parent.kind !== 'const' &&
        (def.parent.declare || scopeType === 'global')
      );
    };

    /**
     * Whether the binding `identifier` imports is declared with `let` or `var`,
     * which the module declaring it may write; also when the checker cannot
     * tell.
     */
    const importsMutableBinding = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      identifier: TSESTree.Identifier,
    ): boolean => {
      const services = sourceCode.parserServices;

      if (
        services?.program === undefined ||
        services.program === null ||
        services.esTreeNodeToTSNodeMap === undefined
      ) {
        return true;
      }

      const checker = services.program.getTypeChecker();

      const symbol = checker.getSymbolAtLocation(
        services.esTreeNodeToTSNodeMap.get(identifier),
      );

      if (symbol === undefined) {
        return true;
      }

      const declarations =
        ((symbol.flags & ts.SymbolFlags.Alias) === 0
          ? symbol
          : checker.getAliasedSymbol(symbol)
        ).declarations ?? [];

      return (
        Arr.isEmpty(declarations) ||
        declarations.some(
          (declaration) =>
            ts.isVariableDeclaration(declaration) &&
            (ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const) === 0,
        )
      );
    };

    const mut_nodesToFix: {
      node: TSESTree.ForStatement;
      varName: string;
      begin: string;
      end: string;
      step?: string;

      /**
       * How the rewrite is offered: `'fix'`, `'suggestion'`, neither with the
       * reasons no cast is offered (`noCastFits`, for the message that says
       * why), or neither with the plain message (`undefined`).
       * `Program:exit` reports a `'fix'` or a `'suggestion'` with neither when
       * `tsDataForgeValueAt` gives no way to write ts-data-forge's `range` at
       * the loop.
       */
      rewrite:
        | 'fix'
        | 'suggestion'
        | Readonly<{ noCastFits: readonly string[] }>
        | undefined;

      /**
       * Whether the step is one whose type decides, so that the suggestion says
       * what the step has to be. It says so whether or not the step fits, as
       * what `range` requires rather than as a fault: a note that depended on
       * the step's fit had to tell a cast the author wrote from one still
       * needed, which each kind of wrapper made harder to get right.
       */
      hasTypedStep: boolean;

      /**
       * Why the body may not take the loop variable's new type, if it may not
       * (`narrowingOf`): the fix becomes a suggestion that says so.
       */
      narrowing: string | undefined;
    }[] = [];

    return {
      ForStatement: (node) => {
        // Check init: let i = begin
        if (
          node.init?.type !== AST_NODE_TYPES.VariableDeclaration ||
          node.init.kind !== 'let' ||
          !Arr.isFixedLengthTuple(1, node.init.declarations)
        ) {
          return;
        }

        const declaration = node.init.declarations[0];

        if (
          declaration.id.type !== AST_NODE_TYPES.Identifier ||
          declaration.init === null
        ) {
          return;
        }

        const varName = declaration.id.name;

        const beginExpr = declaration.init;

        // Check test: i < end. The loop variable and the step are read through
        // type wrappers: `(i satisfies number) < n` tests `i`, and
        // `i += 0 as number` still steps by 0.
        if (
          node.test?.type !== AST_NODE_TYPES.BinaryExpression ||
          node.test.operator !== '<'
        ) {
          return;
        }

        const testedVariable = skipTypeWrappers(node.test.left);

        if (
          testedVariable.type !== AST_NODE_TYPES.Identifier ||
          testedVariable.name !== varName
        ) {
          return;
        }

        const endExpr = node.test.right;

        // Check update: ++i, i++, i += 1, or i += step
        if (node.update === null) {
          return;
        }

        let mut_step: string | undefined;

        /**
         * The step, unless it is a literal that fits by its value. Its type
         * decides whether it fits, unless {@link mut_stepKnownUnfit}.
         */
        let mut_stepOperand: TSESTree.Expression | undefined;

        /** Whether the step is a literal known not to fit, by its value. */
        let mut_stepKnownUnfit = false;

        if (node.update.type === AST_NODE_TYPES.UpdateExpression) {
          // ++i or i++
          if (
            node.update.operator === '++' &&
            isIdentifierNamed(node.update.argument, varName)
          ) {
            mut_step = undefined; // step defaults to 1
          } else {
            return;
          }
        } else if (
          node.update.type === AST_NODE_TYPES.AssignmentExpression &&
          node.update.operator === '+=' &&
          // `i! += 1` and `(i as number) += 2` step `i` too.
          isIdentifierNamed(node.update.left, varName)
        ) {
          // i += step
          const stepExpr = skipTypeWrappers(node.update.right);

          const stepNum = signedLiteral(sourceCode, stepExpr)?.value;

          if (stepNum === undefined) {
            // `i += '1'` and `i += \`1\`` concatenate; no step of `range` does.
            // `-` applied to such a literal (`-'1'`, `-true`) is left alone too,
            // as it was before the rule read types: what `-` makes of it is not
            // worked out here.
            if (isLiteralLike(stepExpr)) {
              return;
            }

            // Variable step like i += step.
            mut_step = getArgumentText(sourceCode, node.update.right);

            mut_stepOperand = node.update.right;
          } else {
            // `i += -1` under `i < end` runs forever or not at all, and `range`
            // with a negative step runs while the value is above the end
            // instead: no rewrite keeps what the loop does. Only a positive
            // safe-integer literal step is taken.
            if (
              typeof stepNum !== 'number' ||
              !Number.isSafeInteger(stepNum) ||
              stepNum <= 0
            ) {
              return;
            }

            if (stepNum < SMALL_INT_END) {
              // The literal fits by its value, so the fix writes the number
              // itself, without its wrappers.
              mut_step = stepNum === 1 ? undefined : stepNum.toString();
            } else {
              // Too large to fit as a literal, so the rewrite is at most a
              // suggestion, which keeps the author's wrapper: it may be the cast
              // `range` needs (`600 as PositiveSafeInt`). The rule asks every
              // layer of a wrapper whether it fits, of a step as of a bound,
              // and the literal is a layer `range` does not take, so that is
              // not asked; whether a layer may defy a cast
              // (`600 as unknown as bigint`) still is, below.
              mut_step = getArgumentText(sourceCode, node.update.right);

              mut_stepOperand = node.update.right;

              mut_stepKnownUnfit = true;
            }
          }
        } else {
          return;
        }

        // `const i` would not take an assignment anywhere but the update.
        if (isAssignedOutsideUpdate(sourceCode, declaration, node.update)) {
          return;
        }

        // `range` takes safe integers only, and no cast makes these one.
        if (
          isNeverSafeIntLiteral(sourceCode, beginExpr) ||
          isNeverSafeIntLiteral(sourceCode, endExpr)
        ) {
          return;
        }

        const beginText = getArgumentText(sourceCode, beginExpr);

        const endText = getArgumentText(sourceCode, endExpr);

        const rewritable =
          // An end `-x` is stable when `x` is a stable number: `isStableBound`
          // reads its type, so that `-box` of an object end is not taken.
          //
          // A step `-k` stays refused however stable `k` is: `-k` of a
          // `PositiveSafeInt` is never positive, but its type is `number`, from
          // which `isNeverPositive` cannot tell that, so the loop would be
          // offered a cast that throws on every run.
          (signedLiteral(sourceCode, endExpr) !== undefined ||
            isStableBound(endExpr, node, 'end')) &&
          (node.update.type !== AST_NODE_TYPES.AssignmentExpression ||
            isStableBound(node.update.right, node, 'step')) &&
          // The rewrite replaces everything before the body.
          !hasCommentWithin(sourceCode, node, [
            [node.range[0], node.body.range[0]],
          ]);

        // Asked only of a loop that can be rewritten: the type checker is the
        // costly part.
        const unfitOperands: readonly TSESTree.Expression[] = rewritable
          ? [
              ...(boundFitsRange(sourceCode, beginExpr) ? [] : [beginExpr]),
              ...(boundFitsRange(sourceCode, endExpr) ? [] : [endExpr]),
              ...(mut_stepOperand !== undefined &&
              (mut_stepKnownUnfit ||
                !typeHoldsAtEveryLayer(
                  sourceCode,
                  mut_stepOperand,
                  fitsRangeStep,
                ))
                ? [mut_stepOperand]
                : []),
            ]
          : [];

        // A loop with an operand that may be, by its type, a value no cast
        // makes what `range` takes, or a step that is never positive, is still
        // reported, with neither a fix nor a suggestion and a message that says
        // why: the suggested call would never compile, or would not stop where
        // the loop does. Those types are asked only here, of the operands that
        // do not fit, in a loop that would otherwise be offered a suggestion,
        // which is rare enough that asking the checker again for them, rather
        // than keeping what the fit asked, costs little. Leaving such a loop
        // unreported, as a literal above is, would mean asking the type checker
        // of every loop that gets this far, the loops that cannot be rewritten
        // included; a literal is told apart by its value, at no cost. A step
        // typed `string` is no exception: TypeScript already rejects `i += s`
        // on the `number` that `let i = 0` declares. A step that may be
        // positive, such as a `number` or a `NonZeroSafeInt`, keeps its
        // suggestion, which says it has to be.
        const noCastFitsReasons: readonly string[] = unfitOperands.flatMap(
          (operand) => {
            const role =
              operand === beginExpr
                ? 'the begin'
                : operand === endExpr
                  ? 'the end'
                  : 'the step';

            // A literal step's value is known to be positive, whatever a cast
            // on it claims (`600 as -1`).
            return typeHoldsAtSomeLayer(sourceCode, operand, mayDefyCast)
              ? [
                  `${role} may be a bigint, a string or a number that is not a safe integer, which no cast makes a \`SafeInt\``,
                ]
              : operand === mut_stepOperand &&
                  !mut_stepKnownUnfit &&
                  typeHoldsAtSomeLayer(sourceCode, operand, isNeverPositive)
                ? [
                    'the step is never positive, so the loop runs forever or not at all',
                  ]
                : [];
          },
        );

        const rewrite: (typeof mut_nodesToFix)[number]['rewrite'] = !rewritable
          ? undefined
          : Arr.isEmpty(unfitOperands)
            ? 'fix'
            : Arr.isEmpty(noCastFitsReasons)
              ? 'suggestion'
              : { noCastFits: noCastFitsReasons };

        mut_nodesToFix.push({
          node,
          varName,
          begin: beginText,
          end: endText,
          step: mut_step,
          rewrite,
          hasTypedStep: mut_stepOperand !== undefined,
          narrowing: narrowingOf(sourceCode, declaration, node.body),
        });
      },
      'Program:exit': () => {
        const rangeAt = tsDataForgeValueAt(sourceCode, 'range');

        for (const entry of mut_nodesToFix) {
          const { node, varName, begin, end, step, rewrite } = entry;

          const rangeArgs =
            step === undefined
              ? `${begin}, ${end}`
              : `${begin}, ${end}, ${step}`;

          const data = { varName, args: rangeArgs } as const;

          if (typeof rewrite === 'object') {
            context.report({
              node: node.init ?? node,
              messageId: 'noCastFitsRangeForLoop',
              data: { ...data, reasons: rewrite.noCastFits.join('; ') },
            });

            continue;
          }

          const range = rewrite === undefined ? undefined : rangeAt(node);

          if (rewrite === undefined || range === undefined) {
            context.report({
              node: node.init ?? node,
              messageId: 'useRangeForLoop',
              data,
            });

            continue;
          }

          // The fix declares the loop variable as what `range` yields, a
          // `SafeUint` or a `SafeInt`, where the loop declared a `number`. Where
          // the body may widen it (`narrowingOf`) it is a suggestion; a use
          // that only the type checker can tell, such as passing it to a
          // parameter typed by a `let`, is not looked for.
          const fix: TSESLint.ReportFixFunction = (fixer) => {
            const bodyText = sourceCode.getText(node.body);

            const replacement = `for (const ${varName} of ${range.localName}(${rangeArgs})) ${bodyText}`;

            return [
              ...range.edits(fixer),
              fixer.replaceText(node, replacement),
            ];
          };

          if (rewrite === 'fix' && entry.narrowing !== undefined) {
            context.report({
              node: node.init ?? node,
              messageId: 'useRangeForLoop',
              data,
              suggest: [
                {
                  messageId: 'suggestRangeForLoopNarrows',
                  data: { ...data, narrowing: entry.narrowing },
                  fix,
                },
              ],
            });
          } else if (rewrite === 'fix') {
            context.report({
              node: node.init ?? node,
              messageId: 'useRangeForLoop',
              data,
              fix,
            });
          } else {
            context.report({
              node: node.init ?? node,
              messageId: 'useRangeForLoop',
              data,
              suggest: [
                {
                  messageId: 'suggestRangeForLoop',
                  data: {
                    ...data,
                    smallIntMin: -SMALL_INT_END,
                    smallIntMax: SMALL_INT_END - 1,
                    // The note on the body rides on `stepNote`, which is empty
                    // where neither applies.
                    stepNote: `${
                      entry.hasTypedStep
                        ? ' Its step has to be a positive one (`asPositiveSafeInt` throws on anything else): `range` takes no zero step, and with a negative one it runs while the value is above the end, where the loop runs while it is below.'
                        : ''
                    }${
                      entry.narrowing === undefined
                        ? ''
                        : ` Check the body too: \`${varName}\` becomes a \`SafeInt\` where it was a \`number\`, and ${entry.narrowing}.`
                    }`,
                  },
                  fix,
                },
              ],
            });
          }
        }
      },
    };
  },
} as const;

/*
 * What `range` accepts is restated below from the shape of its parameter types,
 * not read from its declaration with `isTypeAssignableTo`: the fix usually adds
 * the import, so the file has no `range` symbol to resolve, and reaching
 * ts-data-forge's declaration would take module resolution inside the rule.
 * The rule's tests compile every fix they expect against the real `range`
 * (`test/type-check-outputs.mts`), so the restatement cannot drift from it
 * unnoticed.
 */

/**
 * `range` takes the integer literals from `-SMALL_INT_END` up to, and not
 * including, `SMALL_INT_END` beside a `SafeInt`: the `MaxInt` its parameters
 * hand to ts-type-forge's `WithSmallInt`. The rule's tests, which compile their
 * outputs, fail when that width changes.
 */
const SMALL_INT_END = 512;

/** What `typeHoldsAtEveryLayer` asks of the type at each layer. */
type TypePredicate = Parameters<typeof typeHoldsAtEveryLayer>[2];

/**
 * The keys of ts-type-forge's number brand that make a type a `SafeInt`, and
 * what each has to say. A type that carries them all with these values, and
 * ts-type-forge's marker, is a `SafeInt` or one of its subtypes (`SafeUint`,
 * `Uint32`, `Int16`, …); `Int` lacks `SafeInt`, and `FiniteNumber` lacks `Int`
 * too.
 */
const SAFE_INT_BRAND = [
  ['NaNValue', 'false'],
  ['Finite', 'true'],
  ['Int', 'true'],
  ['SafeInt', 'true'],
] as const;

/**
 * {@link SAFE_INT_BRAND} for a `PositiveSafeInt`. `range`'s step is a
 * `NonZeroSafeInt`, but with a negative step `range` runs while the value is
 * above the end, where the loop runs while it is below: `range(10, 5, -1)`
 * yields 10 to 6, where the loop runs not at all. Only a positive step keeps
 * what the loop does.
 */
const POSITIVE_SAFE_INT_BRAND = [
  ...SAFE_INT_BRAND,
  ['>=0', 'true'],
  ['!=0', 'true'],
] as const;

/** The key of ts-type-forge's number brand that says a number is not positive. */
const NON_POSITIVE_BRAND = [['<=0', 'true']] as const;

const isSmallIntValue = (value: number): boolean =>
  Number.isSafeInteger(value) &&
  -SMALL_INT_END <= value &&
  value < SMALL_INT_END;

/**
 * Whether `type` is a `number` branded by ts-type-forge with every key of
 * `brand` at the value given. A brand on a number literal (`1000 & SafeInt`) is
 * not read: the literal's value decides, whatever the brand claims
 * (`-1 & PositiveSafeInt`), and is read where a literal is. So a constant from
 * `asSafeUint(1000)`, typed `SafeUint & 1000`, is suggested rather than fixed,
 * a cautious answer kept over telling a brand that agrees with its literal from
 * one that does not.
 *
 * eslint-rule-forge's `isNeverNaN` reads one key of the same brand; sharing a
 * reader would take a new export of that published package for these few lines,
 * which read several keys and the marker.
 */
const hasNumberBrand = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  brand: readonly (readonly [key: string, value: 'false' | 'true'])[],
): boolean =>
  type.isIntersection() &&
  type.types.some((member) => (member.flags & ts.TypeFlags.Number) !== 0) &&
  checker.getPropertyOfType(type, TS_TYPE_FORGE_BRAND_MARKER) !== undefined &&
  brand.every(([key, value]) => {
    const property = checker.getPropertyOfType(type, key);

    if (property === undefined) {
      return false;
    }

    const propertyType = checker.getTypeOfSymbol(property);

    return (
      (propertyType.flags & ts.TypeFlags.BooleanLiteral) !== 0 &&
      checker.typeToString(propertyType) === value
    );
  });

/**
 * A predicate for whether a value of a type is taken by a parameter of `range`
 * as the loop's own operand: a type that carries `brand`, or a number literal
 * whose value `fitsLiteral`, alone or in an intersection. A union fits when
 * each member does. Anything else does not, `any` and a type parameter
 * included: the rule then leaves the rewrite to the author.
 */
const fitsRangeParameter = (
  brand: readonly (readonly [key: string, value: 'false' | 'true'])[],
  fitsLiteral: (value: number) => boolean,
): TypePredicate => {
  const fits = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    type: ts.Type,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    checker: ts.TypeChecker,
  ): boolean =>
    type.isUnion()
      ? type.types.every((member) => fits(member, checker))
      : type.isIntersection()
        ? hasNumberBrand(type, checker, brand) ||
          // An intersection is a subset of each member: `2 & Tag` fits as `2`.
          type.types.some(
            (member) => member.isNumberLiteral() && fitsLiteral(member.value),
          )
        : type.isNumberLiteral() && fitsLiteral(type.value);

  return fits;
};

/** `range`'s `start` and `end`: a `SafeInt` or a small integer literal. */
const fitsRangeBound = fitsRangeParameter(SAFE_INT_BRAND, isSmallIntValue);

/** The loop's step: a `PositiveSafeInt` or a small positive integer literal. */
const fitsRangeStep = fitsRangeParameter(
  POSITIVE_SAFE_INT_BRAND,
  (value) => isSmallIntValue(value) && value > 0,
);

/**
 * `wrapped` read through type wrappers (`outer`), and, when that is `-` applied
 * to something, the `argument` of the `-` and what it reads as through type
 * wrappers (`operand`). Otherwise `operand` is `outer`.
 */
const readNegation = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Node,
): Readonly<{
  outer: TSESTree.Node;
  argument: TSESTree.Node | undefined;
  operand: TSESTree.Node;
}> => {
  const outer = skipTypeWrappers(wrapped);

  return outer.type === AST_NODE_TYPES.UnaryExpression && outer.operator === '-'
    ? {
        outer,
        argument: outer.argument,
        operand: skipTypeWrappers(outer.argument),
      }
    : { outer, argument: undefined, operand: outer };
};

/**
 * The number or bigint literal `node` is, or that `-` is applied to, read
 * through type wrappers around the `-` and inside it; `-(-5)` is not read.
 *
 * `bare` says the literal is written as its own type: with no type wrapper and
 * no parentheses inside the `-`. TypeScript gives `5` and `-5` their literal
 * types, but `-(5)`, `5 as number` and `-(5 as SafeInt)` are each a `number`,
 * which `range` does not take.
 */
const signedLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Node,
): Readonly<{ value: number | bigint; bare: boolean }> | undefined => {
  const { outer, argument, operand: literal } = readNegation(wrapped);

  if (
    literal.type !== AST_NODE_TYPES.Literal ||
    (typeof literal.value !== 'number' && typeof literal.value !== 'bigint')
  ) {
    return undefined;
  }

  return {
    value: argument === undefined ? literal.value : -literal.value,
    bare:
      outer === wrapped &&
      (argument === undefined ||
        (literal === argument && parenthesesDepth(sourceCode, literal) === 0)),
  };
};

/**
 * Whether `node`, a begin or an end, is accepted by `range`'s parameter. A bare
 * integer literal is its own type, so its value decides even without type
 * information; anything else is asked of the type checker at every layer of its
 * type wrappers, and fits nothing without type information.
 */
const boundFitsRange = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): boolean => {
  const literal = signedLiteral(sourceCode, node);

  return literal?.bare === true
    ? typeof literal.value === 'number' && isSmallIntValue(literal.value)
    : typeHoldsAtEveryLayer(sourceCode, node, fitsRangeBound);
};

/**
 * Whether `node` is a literal no cast makes a `SafeInt`: a bigint, or a number
 * that is not a safe integer, read through type wrappers, which do not change
 * the value.
 */
const isNeverSafeIntLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  const value = signedLiteral(sourceCode, node)?.value;

  return (
    value !== undefined &&
    (typeof value === 'bigint' || !Number.isSafeInteger(value))
  );
};

/**
 * Whether `node` is a literal or a template literal, or `-` applied to one,
 * read through type wrappers.
 */
const isLiteralLike = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Node,
): boolean => {
  const { operand } = readNegation(wrapped);

  return (
    operand.type === AST_NODE_TYPES.Literal ||
    operand.type === AST_NODE_TYPES.TemplateLiteral
  );
};

/**
 * Whether a value of `type` may be one that no cast makes a `SafeInt`: a
 * bigint, a string, or a number literal that is not a safe integer. A union or
 * an intersection may be when one of its members may be (`bigint & Brand`), and
 * a type parameter, an indexed access (`O['b']`) or another generic type when
 * its constraint may be.
 *
 * `Infinity` and `NaN` are typed `number`, as is every operand a cast is
 * suggested for, so they are not told apart; `asSafeInt` throws on them when
 * the author applies the suggestion.
 */
const mayDefyCast = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  // Before the generic types: a template literal type (`\`${number}\``) is one,
  // and its own constraint.
  if (
    (type.flags & (ts.TypeFlags.BigIntLike | ts.TypeFlags.StringLike)) !==
    0
  ) {
    return true;
  }

  if ((type.flags & ts.TypeFlags.Instantiable) !== 0) {
    const constraint = checker.getBaseConstraintOfType(type);

    return (
      constraint !== undefined &&
      constraint !== type &&
      mayDefyCast(constraint, checker)
    );
  }

  return type.isUnionOrIntersection()
    ? type.types.some((member) => mayDefyCast(member, checker))
    : type.isNumberLiteral() && !Number.isSafeInteger(type.value);
};

/**
 * Whether no value of `type` is positive: a number literal that is not, a
 * number branded by ts-type-forge as `<=0` (`NonPositiveSafeInt`,
 * `NegativeSafeInt`, …), an intersection with one of those, a union of those,
 * or a generic type constrained to one. A union with one member that may be
 * positive (`1 | -1`) may be positive, as a `NonZeroSafeInt` may.
 */
const isNeverPositive = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  if ((type.flags & ts.TypeFlags.Instantiable) !== 0) {
    const constraint = checker.getBaseConstraintOfType(type);

    return (
      constraint !== undefined &&
      constraint !== type &&
      isNeverPositive(constraint, checker)
    );
  }

  if (type.isUnion()) {
    return type.types.every((member) => isNeverPositive(member, checker));
  }

  // An intersection is a subset of each member: `-1 & Tag` is never positive.
  if (type.isIntersection()) {
    return (
      hasNumberBrand(type, checker, NON_POSITIVE_BRAND) ||
      type.types.some((member) => isNeverPositive(member, checker))
    );
  }

  return type.isNumberLiteral() && type.value <= 0;
};

const isWithin = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  container: TSESTree.Node,
): boolean =>
  container.range[0] <= node.range[0] && node.range[1] <= container.range[1];

/** Whether `identifier`, under any type wrapper, is what an update or an assignment writes. */
const isWriteTarget = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  identifier: TSESTree.Node,
): boolean => {
  const target = outermostTypeWrapper(identifier);

  const { parent } = target;

  return (
    (parent?.type === AST_NODE_TYPES.UpdateExpression &&
      parent.argument === target) ||
    (parent?.type === AST_NODE_TYPES.AssignmentExpression &&
      parent.left === target)
  );
};

/**
 * Whether the loop variable declared by `declaration` is written anywhere but
 * its initializer and the loop's `update`: by the scope manager's write
 * references, and by a reference under any wrapper (`satisfies`, stacked `as`,
 * `!`) that is the target of an update or an assignment, which the scope
 * manager does not count as a write and `const i` would throw on.
 */
const isAssignedOutsideUpdate = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  declaration: TSESTree.VariableDeclarator,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  update: TSESTree.Expression,
): boolean =>
  sourceCode
    .getDeclaredVariables(declaration)
    .flatMap((variable) => variable.references)
    .some(
      (reference) =>
        reference.init !== true &&
        !isWithin(reference.identifier, update) &&
        (reference.isWrite() || isWriteTarget(reference.identifier)),
    );

/**
 * Why the body of a loop may not take its variable's new type, `SafeInt` or
 * `SafeUint` where it was a `number`, if a use read off the syntax says so:
 * the loop declared it `let i: number`, whose annotation the rewrite drops, or
 * the body binds it, under any type wrapper, to a `let` with no annotation,
 * which takes the new type and may be widened later (`acc += 0.5`).
 */
const narrowingOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  declaration: TSESTree.VariableDeclarator,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  body: TSESTree.Statement,
): string | undefined => {
  if (
    declaration.id.type === AST_NODE_TYPES.Identifier &&
    declaration.id.typeAnnotation !== undefined
  ) {
    return 'its type annotation is dropped';
  }

  for (const reference of sourceCode
    .getDeclaredVariables(declaration)
    .flatMap((variable) => variable.references)) {
    if (!isWithin(reference.identifier, body)) {
      continue;
    }

    const value = outermostTypeWrapper(reference.identifier);

    const { parent } = value;

    if (
      parent?.type === AST_NODE_TYPES.VariableDeclarator &&
      parent.init === value &&
      parent.parent.kind === 'let' &&
      parent.id.type === AST_NODE_TYPES.Identifier &&
      parent.id.typeAnnotation === undefined
    ) {
      return `\`let ${parent.id.name}\` takes the new type and may be widened later`;
    }
  }

  return undefined;
};

/**
 * Whether `type` is a primitive (a number, a string, …), or a union all of whose
 * members are, or an intersection one of whose members is (a branded number):
 * not an object a comparison converts anew each time, nor an `any` or an
 * `unknown`, which may hold one. A type parameter, an indexed access, a
 * conditional or a substitution type is read by its constraint.
 */
const isPrimitiveType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  if (type.isUnion()) {
    return type.types.every((member) => isPrimitiveType(member, checker));
  }

  if (type.isIntersection()) {
    return type.types.some((member) => isPrimitiveType(member, checker));
  }

  // A type known only once instantiated is read by its constraint.
  if (
    (type.flags &
      (ts.TypeFlags.TypeParameter |
        ts.TypeFlags.IndexedAccess |
        ts.TypeFlags.Conditional |
        ts.TypeFlags.Substitution)) !==
    0
  ) {
    const constraint = checker.getBaseConstraintOfType(type);

    return constraint !== undefined && isPrimitiveType(constraint, checker);
  }

  return (
    (type.flags &
      (ts.TypeFlags.NumberLike |
        ts.TypeFlags.BigIntLike |
        ts.TypeFlags.StringLike |
        ts.TypeFlags.BooleanLike |
        ts.TypeFlags.EnumLike |
        ts.TypeFlags.Null |
        ts.TypeFlags.Undefined)) !==
    0
  );
};

/** Whether `type` is a number, or a branded one: `-x` of it is a number. */
const isNumberType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean =>
  type.isUnion()
    ? type.types.every((member) => isNumberType(member, checker))
    : type.isIntersection()
      ? type.types.some((member) => isNumberType(member, checker))
      : (type.flags & ts.TypeFlags.NumberLike) !== 0;
