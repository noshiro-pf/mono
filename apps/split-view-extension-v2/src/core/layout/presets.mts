import { evenChain, paneLeaf, split } from './tree.mjs';
import type { LayoutNode, PaneId } from './types.mjs';

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

export type LayoutPreset = Readonly<{
  id: PresetId;
  /** The button's text: short, since all nine share the top bar's one row. */
  label: string;
  /** The button's tooltip. */
  title: string;
  /**
   * The tree, its panes asked for by slot. Slots are laid out in tree order, so
   * applying a preset twice keeps every pane where it is.
   */
  build: (pane: (slot: number) => PaneId) => LayoutNode;
  paneCount: number;
}>;

export const presetOf = (id: string): LayoutPreset | undefined =>
  layoutPresets.find((preset) => preset.id === id);

const leaves = (
  pane: (slot: number) => PaneId,
  slots: readonly number[],
): readonly LayoutNode[] => slots.map((slot) => paneLeaf(pane(slot)));

/**
 * The preset layouts. A grid is a row of columns, never a column of rows: the
 * full-height divider is then the vertical one, and each column's horizontal
 * divider moves on its own.
 */
export const layoutPresets: readonly LayoutPreset[] = [
  {
    id: 'single',
    label: '1',
    title: 'One pane',
    paneCount: 1,
    build: (pane) => paneLeaf(pane(0)),
  },
  {
    id: 'columns-2',
    label: '2 cols',
    title: 'Two columns',
    paneCount: 2,
    build: (pane) => evenChain('row', leaves(pane, [0, 1])),
  },
  {
    id: 'columns-3',
    label: '3 cols',
    title: 'Three columns',
    paneCount: 3,
    build: (pane) => evenChain('row', leaves(pane, [0, 1, 2])),
  },
  {
    id: 'rows-2',
    label: '2 rows',
    title: 'Two rows',
    paneCount: 2,
    build: (pane) => evenChain('column', leaves(pane, [0, 1])),
  },
  {
    id: 'rows-3',
    label: '3 rows',
    title: 'Three rows',
    paneCount: 3,
    build: (pane) => evenChain('column', leaves(pane, [0, 1, 2])),
  },
  {
    id: 'grid-2x2',
    label: '2×2',
    title: 'Four panes (2×2)',
    paneCount: 4,
    build: (pane) =>
      evenChain('row', [
        evenChain('column', leaves(pane, [0, 1])),
        evenChain('column', leaves(pane, [2, 3])),
      ]),
  },
  {
    id: 'grid-2x3',
    label: '2×3',
    title: 'Six panes (2×3)',
    paneCount: 6,
    build: (pane) =>
      evenChain('row', [
        evenChain('column', leaves(pane, [0, 1])),
        evenChain('column', leaves(pane, [2, 3])),
        evenChain('column', leaves(pane, [4, 5])),
      ]),
  },
  {
    id: 'left-1-right-2',
    label: 'L1+R2',
    title: 'One on the left, two on the right',
    paneCount: 3,
    build: (pane) =>
      split(
        'row',
        paneLeaf(pane(0)),
        evenChain('column', leaves(pane, [1, 2])),
      ),
  },
  {
    id: 'top-1-bottom-2',
    label: 'T1+B2',
    title: 'One on top, two below',
    paneCount: 3,
    build: (pane) =>
      split(
        'column',
        paneLeaf(pane(0)),
        evenChain('row', leaves(pane, [1, 2])),
      ),
  },
] as const;

/** The layout a new split view starts in. */
export const defaultPresetId: PresetId = 'grid-2x2';
