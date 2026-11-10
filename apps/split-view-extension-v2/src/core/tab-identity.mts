import { Num } from 'ts-data-forge';
import { paneIdsOf } from './layout/index.mjs';
import { findPane, type Workspace } from './workspace/index.mjs';

/** The tab's title (spec W7): the number first, since a tab strip cuts the end. */
export const tabTitleOf = (position: number, label: string): string =>
  `${position.toString()}: ${label}` as const;

/**
 * What follows the number: the view's own title, else what the first pane in
 * tree order reported, else the split view's name.
 */
export const tabLabelOf = (workspace: Workspace, name: string): string => {
  const first = paneIdsOf(workspace.root)[0];

  return (
    workspace.title ??
    (first === undefined
      ? undefined
      : findPane(workspace, first)?.live.title) ??
    name
  );
};

/**
 * The favicon's colour for a position: a fixed cycle, so renaming does not
 * change the icon the user has learned to look for.
 */
export const accentColorOf = (position: number): string =>
  accentColors[(Math.max(1, Math.round(position)) - 1) % accentColors.length] ??
  '#4f7fd9';

/**
 * The extension's icon, in unit space: a rounded square with four panes. Drawn
 * by `scripts/gen-icons.mts` into `public/icons/` and, faded under a number,
 * into each split view's favicon, so the tab shows the toolbar's shape.
 */
export const extensionIcon = {
  background: [79, 127, 217],
  pane: [255, 255, 255],
  squareInset: 0.02,
  squareRadius: 0.2,
  paneInset: 0.2,
  paneGutter: 0.07,
} as const;

/**
 * Where the four panes start and end along either axis, in whole pixels:
 * snapped, or a one-pixel gutter at 16px blurs the panes into one.
 */
export const iconPaneBoundsOf = (
  size: number,
): readonly [number, number, number, number] => {
  const inset = Math.max(1, Math.round(extensionIcon.paneInset * size));

  const gutter = Math.max(1, Math.round(extensionIcon.paneGutter * size));

  const span = Math.max(1, Math.floor(Num.div(size - 2 * inset - gutter, 2)));

  return [inset, inset + span, size - inset - span, size - inset];
};

/** The favicon's number and its font size: more digits, a smaller font. */
export const faviconLabelOf = (
  position: number,
): Readonly<{ label: string; fontPx: number }> => {
  const label = Math.max(1, Math.round(position)).toString();

  return {
    label,
    fontPx: label.length === 1 ? 24 : label.length === 2 ? 18 : 13,
  };
};

const accentColors = [
  '#4f7fd9',
  '#d9734f',
  '#4fa96b',
  '#b45cc0',
  '#c9a227',
  '#4fb0c0',
  '#d95f7f',
  '#7f7fd9',
] as const;
