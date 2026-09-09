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
