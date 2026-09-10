import * as path from 'node:path';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { embedExamplesInMarkdown } from '../../../../tools/configs/embed-examples-in-markdown.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const documents = [
  {
    mdPath: path.resolve(workspaceRootPath, 'README.md'),
    samplesDir: path.resolve(workspaceRootPath, 'samples/readme'),
    sampleCodeFiles: [
      'quick-start/quick-start.test.mts',
      'default-values-and-data-filling/intro.test.mts',
      'default-values-and-data-filling/convenient-default-values/01.test.mts',
      'default-values-and-data-filling/convenient-default-values/02.test.mts',
      'default-values-and-data-filling/convenient-default-values/03.test.mts',
      'primitive-constraints/string-constraints.mts',
      'primitive-constraints/number-constraints.mts',
      'primitive-constraints/bigint-constraints.mts',
      'primitive-constraints/reading-constraints.mts',
      'why-ts-fortress-over-zod-and-io-ts/migration-from-io-ts/io-ts.test.mts',
      'why-ts-fortress-over-zod-and-io-ts/migration-from-io-ts/ts-fortress.test.mts',
      'core-concepts/type-interface/type.test.mts',
      'core-concepts/type-interface/validate.test.mts',
      'core-concepts/type-interface/assert-is.test.mts',
      'core-concepts/type-interface/cast.test.mts',
      'core-concepts/type-interface/default-value.test.mts',
      'core-concepts/primitive-types/01.test.mts',
      'core-concepts/record-types/01.test.mts',
      'core-concepts/refined-types/01.test.mts',
      'core-concepts/refined-types/02.test.mts',
      'core-concepts/branded-types/01.test.mts',
      'core-concepts/union-and-intersection-types/01.test.mts',
      'core-concepts/enums/01.test.mts',
      'error-handling/01.error-handling.test.mts',
      'error-handling/02.validation-error-structure.test.mts',
    ],
  },
  {
    mdPath: path.resolve(
      workspaceRootPath,
      'documents/why-ts-fortress-over-zod-and-io-ts.md',
    ),
    samplesDir: path.resolve(
      workspaceRootPath,
      'samples/why-ts-fortress-over-zod-and-io-ts',
    ),
    sampleCodeFiles: [
      // Type Safety when Building Schemas
      'type-safety-when-building-schemas/01.zod-incorrect.test.mts',
      'type-safety-when-building-schemas/02.zod-correct.test.mts',
      'type-safety-when-building-schemas/03.ts-fortress.test.mts',

      // Deep Readonly Types by Default
      'deep-readonly-types-by-default/01.ts-fortress-user-type.test.mts',
      'deep-readonly-types-by-default/02.zod-user-schema.test.mts',
      'deep-readonly-types-by-default/03.io-ts-nested-readonly.test.mts',
      'deep-readonly-types-by-default/04.ts-fortress-clean-structure.test.mts',
      'deep-readonly-types-by-default/05.zod-prettify-error.test.mts',

      // Runtime-Type Consistency Issues in io-ts
      'runtime-type-consistency-issues-in-io-ts/keyof-type-mismatch/01.io-ts.test.mts',
      'runtime-type-consistency-issues-in-io-ts/keyof-type-mismatch/02.ts-fortress.test.mts',
      'runtime-type-consistency-issues-in-io-ts/union-undefined-decode-issues/01.io-ts.test.mts',
      'runtime-type-consistency-issues-in-io-ts/union-undefined-decode-issues/02.ts-fortress.test.mts',
    ],
  },
] as const;

/** Embeds sample code from ./samples/readme directory into README.md */
export const embedExamples = async (): Promise<Result<undefined, unknown>> =>
  embedExamplesInMarkdown({ documents });

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedExamples();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
