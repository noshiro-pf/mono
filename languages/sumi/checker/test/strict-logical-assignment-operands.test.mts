import dedent from 'dedent';
import { strictLogicalAssignmentOperands } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

describe(strictLogicalAssignmentOperands.ruleId, () => {
  testRule(strictLogicalAssignmentOperands, {
    valid: [
      {
        name: 'both operands are boolean',
        code: dedent`
          export const fold = (flag: boolean, other: boolean): boolean => {
            let mut_result = flag;

            mut_result &&= other;

            mut_result ||= other;

            return mut_result;
          };
        `,
      },
      {
        name: '??= coalesces a value, so it is exempt',
        code: dedent`
          export const coalesce = (value: string | undefined): string => {
            let mut_text = value;

            mut_text ??= 'fallback';

            return mut_text;
          };
        `,
      },
    ],
    invalid: [
      {
        name: 'the truthiness idiom on a string',
        code: dedent`
          export const idiom = (name: string | undefined, fallback: string): string => {
            let mut_name = name;

            mut_name ||= fallback;

            return mut_name ?? fallback;
          };
        `,
        errors: [{ messageId: 'nonBooleanOperand', line: 4 }],
      },
      {
        name: 'numbers folded with &&=',
        code: dedent`
          export const clamp = (count: number, floor: number): number => {
            let mut_count = count;

            mut_count &&= floor;

            return mut_count;
          };
        `,
        errors: [{ messageId: 'nonBooleanOperand', line: 4 }],
      },
    ],
  });
});

describe(`${strictLogicalAssignmentOperands.ruleId} through type wrappers`, () => {
  testRule(strictLogicalAssignmentOperands, {
    valid: [
      {
        name: 'boolean operands behind `satisfies`',
        code: dedent`
          export const both = (flag: boolean, other: boolean): boolean => {
            let mut_flag = flag;

            (mut_flag satisfies boolean) ||= other satisfies boolean;

            return mut_flag;
          };
        `,
      },
    ],
    invalid: [
      {
        name: 'a `!` or a cast does not make an operand boolean',
        code: dedent`
          export const asserted = (flag: boolean | undefined, count: number): readonly unknown[] => {
            let mut_a = flag;
            let mut_b = flag;
            let mut_c = flag;
            let mut_ok = true;

            mut_a! ||= true;
            (mut_b as boolean) &&= true;
            (<boolean>mut_c) ||= true;
            mut_ok &&= count as unknown as boolean;

            return [mut_a, mut_b, mut_c, mut_ok];
          };
        `,
        errors: [
          { messageId: 'nonBooleanOperand', line: 7 },
          { messageId: 'nonBooleanOperand', line: 8 },
          { messageId: 'nonBooleanOperand', line: 9 },
          { messageId: 'nonBooleanOperand', line: 10 },
        ],
      },
    ],
  });
});
