import type * as tsm from 'ts-morph';

export type TsMorphTransformer = Readonly<{
  /**
   * Name identifier for this transformer.
   * Used to enable transformer-specific ignore comments.
   * Example: 'append-as-const', 'replace-any-with-unknown'
   */
  name: string;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  transform: (sourceFile: tsm.SourceFile) => void;
}>;
