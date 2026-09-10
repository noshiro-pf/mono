import { evenChain, evenChainOf, paneNode, splitNode } from './tree.mjs';
import { type LayoutNode, type PaneId } from './types.mjs';

export type PresetId =
  | 'columns-2'
  | 'columns-3'
  | 'grid-2x2'
  | 'grid-2x3'
  | 'left-1-right-2'
  | 'rows-2'
  | 'rows-3'
  | 'single'
  | 'top-1-bottom-2';

/**
 * Supplies the pane for the nth slot of a preset.
 *
 * A preset asks for panes by index instead of indexing an array, so that
 * applying one can reuse the panes already open — keeping their addresses — and
 * create only the shortfall. It also means a preset cannot be written in a way
 * that has to handle a missing pane.
 *
 * The slots are filled in the order `paneIdsOf` reads a tree, and a preset must
 * lay them out in that same order, or applying one twice would shuffle the
 * panes around. For a grid that means slot 0 and 1 are the left column, not the
 * top row.
 */
export type PaneIdSource = (index: number) => PaneId;

export type LayoutPreset = Readonly<{
  id: PresetId;

  /**
   * What the button says. Short, because the nine of them share one toolbar
   * row with everything else: a row that wraps costs the panes a whole line of
   * height for as long as the window is that wide.
   */
  label: string;

  /** What the button's tooltip says, in full. */
  title: string;

  paneCount: number;
  build: (pane: PaneIdSource) => LayoutNode;
}>;

export const layoutPresets: readonly LayoutPreset[] = [
  {
    id: 'single',
    label: '1',
    title: 'One pane',
    paneCount: 1,
    build: (pane) => paneNode(pane(0)),
  },
  {
    id: 'columns-2',
    label: '2 cols',
    title: 'Two columns',
    paneCount: 2,
    build: (pane) => evenChain('row', [pane(0), pane(1)]),
  },
  {
    id: 'columns-3',
    label: '3 cols',
    title: 'Three columns',
    paneCount: 3,
    build: (pane) => evenChain('row', [pane(0), pane(1), pane(2)]),
  },
  {
    id: 'rows-2',
    label: '2 rows',
    title: 'Two rows',
    paneCount: 2,
    build: (pane) => evenChain('column', [pane(0), pane(1)]),
  },
  {
    id: 'rows-3',
    label: '3 rows',
    title: 'Three rows',
    paneCount: 3,
    build: (pane) => evenChain('column', [pane(0), pane(1), pane(2)]),
  },
  // A grid is a row of columns, never a column of rows. Both shapes look the
  // same, but they differ in which divider spans the whole stage: nested this
  // way the vertical one does, and each column's horizontal divider moves on
  // its own. The other way round every column shares one horizontal divider,
  // so making one pane taller shortens the pane beside it — which is almost
  // never what is wanted.
  {
    id: 'grid-2x2',
    label: '2×2',
    title: 'Four panes (2×2)',
    paneCount: 4,
    build: (pane) =>
      splitNode(
        'row',
        splitNode('column', paneNode(pane(0)), paneNode(pane(1))),
        splitNode('column', paneNode(pane(2)), paneNode(pane(3))),
      ),
  },
  {
    id: 'grid-2x3',
    label: '2×3',
    title: 'Six panes (2×3)',
    paneCount: 6,
    build: (pane) =>
      evenChainOf('row', [
        evenChain('column', [pane(0), pane(1)]),
        evenChain('column', [pane(2), pane(3)]),
        evenChain('column', [pane(4), pane(5)]),
      ]),
  },
  {
    id: 'left-1-right-2',
    label: 'L1+R2',
    title: 'One on the left, two on the right',
    paneCount: 3,
    build: (pane) =>
      splitNode(
        'row',
        paneNode(pane(0)),
        evenChain('column', [pane(1), pane(2)]),
      ),
  },
  {
    id: 'top-1-bottom-2',
    label: 'T1+B2',
    title: 'One on top, two below',
    paneCount: 3,
    build: (pane) =>
      splitNode(
        'column',
        paneNode(pane(0)),
        evenChain('row', [pane(1), pane(2)]),
      ),
  },
] as const;

/** The layout a freshly opened split view starts in. */
export const defaultPresetId: PresetId = 'grid-2x2';
