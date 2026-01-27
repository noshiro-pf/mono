import type * as tsm from 'ts-morph';

export type TsMorphTransformer = {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  (sourceFile: tsm.SourceFile): void;

  /**
   * Optional name identifier for this transformer.
   * Used to enable transformer-specific ignore comments.
   * Example: 'append-as-const', 'replace-any-with-unknown'
   */
  transformerName?: string;
};
