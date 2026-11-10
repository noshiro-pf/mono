import type { Child, JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { BlockId } from '../../domain/index.mjs';

/** What the layout draws for each block. */
export type BlockView = Readonly<{
  /** The title, a heading's content. */
  title: Child;
  /** Links and counts after the title, in the same sticky line. */
  extras?: Child;
  /** The block itself, made once and kept while the block is in the page. */
  body: () => JSX.Element;
}>;

export type BlockViews = ReadonlyRecord<BlockId, BlockView>;
