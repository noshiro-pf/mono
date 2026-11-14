import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getArgumentText,
  hasCommentWithin,
  isIdentifierNamed,
  parenthesesDepth,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
  typeWrapperLayers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import { TS_TYPE_FORGE_BRAND_MARKER } from './constants.mjs';
import { tsDataForgeValueAt } from './import-binding.mjs';

type Options = readonly [];

type MessageIds =
  'useRangeForLoop' | 'suggestRangeForLoop' | 'noCastFitsRangeForLoop';

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
      noCastFitsRangeForLoop:
        '`for (const {{varName}} of range({{args}}))` from ts-data-forge cannot replace this loop: {{reasons}}.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    /**
     * Whether `node` is the same value on every iteration: a literal, or a
     * variable this file writes nowhere but in its declarations (not only in
     * the loop, since a function the loop calls could write it). The loop reads
     * its end and its step on every iteration, and `range` reads them once.
     *
     * Anything else is taken for changing, whether it changes or not. The check
     * can also take a changing value for stable; the known cases are listed in
     * https://github.com/noshiro-pf/mono/issues/4135.
     */
    const isStableBound = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      wrapped: TSESTree.Node,
    ): boolean => {
      const node = skipTypeWrappers(wrapped);

      if (node.type === AST_NODE_TYPES.Literal) {
        return true;
      }

      if (node.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      const variable = ASTUtils.findVariable(
        sourceCode.getScope(node),
        node.name,
      );

      return (
        variable !== null &&
        variable.defs.length > 0 &&
        variable.references.every(
          (reference) => !reference.isWrite() || reference.init === true,
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
          // An end that is `-` applied to a number literal (`i < -5`) is
          // stable, as `isStableBound` says any literal is. No other `-x` end,
          // and no `-x` step (a step `-` on a literal returned above), is taken
          // for stable.
          //
          // A step `-k` stays refused however stable `k` is: `-k` of a
          // `PositiveSafeInt` is never positive, but its type is `number`, from
          // which `isNeverPositive` cannot tell that, so the loop would be
          // offered a cast that throws on every run.
          //
          // An end `-len` is refused too, though it is as stable as `len`, as
          // before this rule read types: `isStableBound` takes no `-x`, and
          // `signedLiteral` reads `-` on a literal only. Taking `-len` would
          // take `-box` as well, as `isStableBound` already takes `box` (an
          // object end, one of its known cases), so it waits until an end's
          // stability is read from its type.
          (signedLiteral(sourceCode, endExpr) !== undefined ||
            isStableBound(endExpr)) &&
          (node.update.type !== AST_NODE_TYPES.AssignmentExpression ||
            isStableBound(node.update.right)) &&
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
          // `SafeUint` or a `SafeInt`, where the loop declared a `number` (and
          // drops a `let i: number` annotation): a body that widens it, such as
          // `let acc = i; acc += 0.5`, stops compiling. Only the `range` call is
          // checked, since telling would mean type-checking the body again
          // against the new type.
          const fix: TSESLint.ReportFixFunction = (fixer) => {
            const bodyText = sourceCode.getText(node.body);

            const replacement = `for (const ${varName} of ${range.localName}(${rangeArgs})) ${bodyText}`;

            return [
              ...range.edits(fixer),
              fixer.replaceText(node, replacement),
            ];
          };

          if (rewrite === 'fix') {
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
                    stepNote: entry.hasTypedStep
                      ? ' Its step has to be a positive one (`asPositiveSafeInt` throws on anything else): `range` takes no zero step, and with a negative one it runs while the value is above the end, where the loop runs while it is below.'
                      : '',
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
 * `test/range-for-loop-fix-output.mts` compiles the fixes against the real
 * `range`, so the restatement cannot drift from it unnoticed.
 */

/**
 * `range` takes the integer literals from `-SMALL_INT_END` up to, and not
 * including, `SMALL_INT_END` beside a `SafeInt`: the `MaxInt` its parameters
 * hand to ts-type-forge's `WithSmallInt`. `test/range-for-loop-fix-output.mts`
 * stops compiling when that width changes.
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

/**
 * Whether `holds` is true of the type of `node` at some layer of its type
 * wrappers: a cast changes the type, not the value (`b as unknown as number` is
 * still a bigint). Without type information it holds of nothing.
 *
 * It is eslint-rule-forge's `typeHoldsAtEveryLayer` with `some` for `every`,
 * written here because eslint-rule-forge has no such counterpart yet.
 */
const typeHoldsAtSomeLayer = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  holds: TypePredicate,
): boolean => {
  const services = sourceCode.parserServices;

  const checker = services?.program?.getTypeChecker();

  return (
    checker !== undefined &&
    typeWrapperLayers(node).some((layer) => {
      const tsNode = services?.esTreeNodeToTSNodeMap?.get(layer);

      return (
        tsNode !== undefined &&
        holds(checker.getTypeAtLocation(tsNode), checker)
      );
    })
  );
};

const isWithin = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  container: TSESTree.Node,
): boolean =>
  container.range[0] <= node.range[0] && node.range[1] <= container.range[1];

/**
 * Whether the loop variable declared by `declaration` is written anywhere but
 * its initializer and the loop's `update`.
 *
 * It reads the scope manager's write references, which see through one `as`,
 * `<T>` or `!` on an assignment target and no `satisfies`: a body that writes
 * `(i satisfies number)++` is not seen, and the fix to `const i` then throws on
 * that write at run time, which TypeScript does not report. Such a write is
 * rare, and reading every reference's parents through type wrappers is not done
 * yet.
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
        reference.isWrite() &&
        reference.init !== true &&
        !isWithin(reference.identifier, update),
    );
