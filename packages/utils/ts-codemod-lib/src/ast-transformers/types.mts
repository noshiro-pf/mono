import type * as tsm from 'ts-morph';

export type TsMorphTransformer = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.SourceFile,
) => void;
