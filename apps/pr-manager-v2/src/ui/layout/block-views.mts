import type { Child, JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { BlockId } from '../../domain/index.mjs';

/** What the layout draws for each block. */
export type BlockView = Readonly<{
  /** The title, a heading's content. */
  title: Child;
  /** Links after the title, on its line. */
  extras?: Child;
  /** Counts and filters under the title's line, kept in view with it. */
  controls?: Child;
  /** The block itself, made once and kept while the block is in the page. */
  body: () => JSX.Element;
}>;

export type BlockViews = ReadonlyRecord<BlockId, BlockView>;
