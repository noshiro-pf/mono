import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import {
  createNoSideEffectImport,
  createPreferArrayIsArray,
  createPreferIsNonNullObject,
  createPreferIsRecordAndHasKey,
  createPreferSafeParseFloat,
  createPreferSafeParseInt,
} from '../src/index.mjs';

// The rules are tested in full by the plugins that build them, each with its
// own module; these cases check only that what a factory is told reaches the
// messages, the fix and the import it writes.

const ruleTester = new RuleTester();

ruleTester.run(
  'createPreferIsNonNullObject',
  createPreferIsNonNullObject({ moduleName: 'my-lib' }),
  {
    valid: [],
    invalid: [
      {
        name: 'imports from the module it is given',
        code: dedent`
          const ok = typeof u === 'object' && u !== null;
        `,
        output: dedent`
          import { isNonNullObject } from 'my-lib';
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
    ],
  },
);

ruleTester.run(
  'createPreferIsRecordAndHasKey',
  createPreferIsRecordAndHasKey({ moduleName: 'my-lib' }),
  {
    valid: [],
    invalid: [
      {
        name: 'imports from the module it is given, keeping isRecord without type information',
        code: dedent`
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'my-lib';
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
    ],
  },
);

ruleTester.run(
  'createPreferArrayIsArray',
  createPreferArrayIsArray({
    moduleName: 'my-lib',
    namespace: 'Lib',
  }),
  {
    valid: [
      {
        name: 'a computed member is not `isArray`',
        code: dedent`
          const result = Array[isArray](value);
        `,
      },
    ],
    invalid: [
      {
        name: 'writes the namespace it is given',
        code: dedent`
          const result = Array.isArray(value);
        `,
        output: dedent`
          import { Lib } from 'my-lib';
          const result = Lib.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
    ],
  },
);

ruleTester.run(
  'createPreferSafeParseInt and createPreferSafeParseFloat',
  createPreferSafeParseInt({
    moduleName: 'my-lib',
    namespace: 'Num',
    method: 'parseInt',
  }),
  {
    valid: [
      {
        name: 'without type information nothing is known to be a string',
        code: dedent`
          const n = parseInt(s, 10);
        `,
      },
    ],
    invalid: [],
  },
);

ruleTester.run(
  'createPreferSafeParseFloat',
  createPreferSafeParseFloat({
    moduleName: 'my-lib',
    namespace: 'Num',
    method: 'parseFloat',
  }),
  {
    valid: [
      {
        name: 'without type information nothing is known to be a string',
        code: dedent`
          const n = Number(s);
        `,
      },
    ],
    invalid: [],
  },
);

ruleTester.run(
  'createNoSideEffectImport',
  createNoSideEffectImport({
    moduleName: 'my-lib',
    type: 'problem',
    description: 'Remove it.',
    message: 'Remove `import "my-lib"`.',
  }),
  {
    valid: [
      {
        name: 'an import that binds a name',
        code: "import { a } from 'my-lib';",
      },
      {
        name: 'a subpath',
        code: "import 'my-lib/global';",
      },
    ],
    invalid: [
      {
        name: 'removes the bare side-effect import with its line',
        code: dedent`
          import 'my-lib';
          import { a } from 'other';
        `,
        output: dedent`
          import { a } from 'other';
        `,
        errors: [{ messageId: 'removeSideEffectImport' }],
      },
    ],
  },
);
