import dedent from 'dedent';
import { restrictCastMutable } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

// The cases cannot import ts-data-forge (they are compiled in a temporary
// directory), so each declares the escape under its real name. The rule goes
// by the name the reference resolves to.
const castMutableDeclaration = dedent`
  type MutableOf<T> = { -readonly [K in keyof T]: T[K] };

  const castMutable = <T,>(readonlyValue: T): MutableOf<T> =>
    readonlyValue as MutableOf<T>;
`;

describe(restrictCastMutable.ruleId, () => {
  testRule(restrictCastMutable, {
    valid: [
      {
        name: 'handed straight to a parameter typed mutable',
        code: dedent`
          ${castMutableDeclaration}

          declare const takesArray: (xs: string[]) => number;

          export const passed = (xs: readonly string[]): number =>
            takesArray(castMutable(xs));
        `,
      },
      {
        name: 'inside an object or array literal handed to the call',
        code: dedent`
          ${castMutableDeclaration}

          declare const takesOptions: (
            options: Readonly<{ list: string[]; nested: (string[])[] }>,
          ) => number;

          export const nested = (xs: readonly string[]): number =>
            takesOptions({ list: castMutable(xs), nested: [castMutable(xs)] });
        `,
      },
      {
        name: 'through parentheses and type wrappers',
        code: dedent`
          ${castMutableDeclaration}

          declare const takesWrapped: (xs: string[]) => number;

          export const wrapped = (xs: readonly string[]): number =>
            takesWrapped((castMutable(xs) satisfies string[]) as string[]);
        `,
      },
      {
        name: 'a constructor argument',
        code: dedent`
          ${castMutableDeclaration}

          declare const Holder: new (xs: string[]) => object;

          export const constructed = (xs: readonly string[]): object =>
            new Holder(castMutable(xs));
        `,
      },
      {
        name: 'a function of one’s own with another name',
        code: dedent`
          const castOther = <T,>(value: T): T => value;

          export const other = castOther([1]);
        `,
      },
    ],
    invalid: [
      {
        name: 'kept in a binding',
        code: dedent`
          ${castMutableDeclaration}

          export const bound = (xs: readonly number[]): number => {
            const mut_ys = castMutable(xs);

            mut_ys.push(1);

            return mut_ys.length;
          };
        `,
        errors: [{ messageId: 'notAtBoundary', line: 7 }],
      },
      {
        name: 'returned',
        code: dedent`
          ${castMutableDeclaration}

          export const returned = (xs: readonly number[]): number[] =>
            castMutable(xs);
        `,
        errors: [{ messageId: 'notAtBoundary', line: 7 }],
      },
      {
        name: 'passed as a value rather than called',
        code: dedent`
          ${castMutableDeclaration}

          export const mapped = (
            xss: readonly (readonly number[])[],
          ): readonly number[][] => xss.map(castMutable);
        `,
        errors: [{ messageId: 'notAtBoundary', line: 8 }],
      },
      {
        name: 'the parameter already accepts the readonly value',
        code: dedent`
          ${castMutableDeclaration}

          declare const takesReadonly: (xs: readonly string[]) => number;

          export const unneeded = (xs: readonly string[]): number =>
            takesReadonly(castMutable(xs));
        `,
        errors: [{ messageId: 'unnecessary', line: 9 }],
      },
      {
        name: 'the value is mutable already',
        code: dedent`
          ${castMutableDeclaration}

          declare const takesMutable: (xs: string[]) => number;

          export const alreadyMutable = (): number =>
            takesMutable(castMutable(['a']));
        `,
        errors: [{ messageId: 'unnecessary', line: 9 }],
      },
    ],
  });
});
