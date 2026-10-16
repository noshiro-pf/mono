import { Num } from 'ts-data-forge';
import { paneIdsOf, type WorkspaceState } from '../layout/index.mjs';
import { extensionIcon, extensionIconPaneBoundsOf } from '../shared/index.mjs';
import { findPane } from './reducer.mjs';

// `document.title = …` is a mutation the lint rules reject unless the object it
// is reached through is named as mutable — the same trick `frame-agent.mts`
// uses for `history`. Everything in this module goes through it.
const { document: mut_page } = globalThis;

/**
 * What the tab shows for a workspace: its number and its name.
 *
 * The number comes first because a tab strip truncates from the right, and a
 * row of tabs all reading `split-view…` says nothing about which is which.
 */
export const tabTitleOf = (position: number, workspaceName: string): string =>
  `${String(position)}: ${workspaceName}` as const;

/**
 * What follows the number in the tab's title.
 *
 * The title the split view was opened with, when it has one. Otherwise the
 * title of the first pane in tree order — the top left, which is where a
 * reader looks first — so that the tab says what is on screen, as an ordinary
 * tab does. The split view's name only while that pane has reported nothing:
 * before its page has loaded, for an empty pane, and for a page the frame
 * agent cannot run in.
 */
export const tabLabelOf = (
  state: WorkspaceState,
  workspaceName: string,
): string => {
  const firstPaneId = paneIdsOf(state.root)[0];

  const firstPaneTitle =
    firstPaneId === undefined ? undefined : findPane(state, firstPaneId)?.title;

  return state.title ?? firstPaneTitle ?? workspaceName;
};

/**
 * The colour of the favicon for a position, from a fixed cycle.
 *
 * Fixed rather than derived from the name, so that renaming a workspace does
 * not change the icon the user has learned to look for, and saturated enough
 * to carry white text at 16px on both a light and a dark tab strip.
 */
export const accentColorOf = (position: number): string =>
  accentColors[(Math.max(1, position) - 1) % accentColors.length] ?? '#4f7fd9';

/**
 * Gives the tab a title and a favicon with its number on it.
 *
 * The favicon is drawn on a canvas and handed over as a PNG data URL rather
 * than written as an SVG one: an SVG favicon is rasterized outside the page's
 * CSS context, where a `font-family` resolves to whatever the platform decides,
 * and the whole point of the icon is a legible digit. A canvas uses the fonts
 * this page already has.
 */
export const applyTabIdentity = (
  position: number,
  workspaceName: string,
): void => {
  mut_page.title = tabTitleOf(position, workspaceName);

  const dataUri = faviconDataUri(position);

  if (dataUri === undefined) {
    return;
  }

  const existing = mut_page.querySelector(`link#${faviconLinkId}`);

  const mut_link =
    existing instanceof HTMLLinkElement
      ? existing
      : mut_page.createElement('link');

  mut_link.id = faviconLinkId;

  mut_link.rel = 'icon';

  mut_link.href = dataUri;

  if (existing === null) {
    mut_page.head.append(mut_link);
  }
};

/**
 * The favicon for a position, as a PNG data URL: the extension's icon in the
 * position's colour, its panes faded, and the number large across the middle.
 *
 * The number on the icon rather than on a badge in its corner, because a badge
 * is what a count of unread notifications looks like. The panes kept, faintly,
 * because a coloured square with a number and nothing else is also what Google
 * Calendar's tab shows, and the two could not be told apart in a tab strip.
 */
export const faviconDataUri = (position: number): string | undefined => {
  const mut_canvas = mut_page.createElement('canvas');

  mut_canvas.width = faviconPx;

  mut_canvas.height = faviconPx;

  const mut_context = mut_canvas.getContext('2d');

  if (mut_context === null) {
    return undefined;
  }

  const { label, fontPx, outlinePx, icon } = faviconLayoutOf(position);

  const accent = accentColorOf(position);

  mut_context.fillStyle = accent;

  mut_context.fill(roundRectPathOf(extensionIconSquareOf(icon)));

  mut_context.fillStyle = rgbOf(extensionIcon.pane, paneAlpha);

  mut_context.fill(extensionIconPanesPathOf(icon));

  mut_context.font = `700 ${String(fontPx)}px system-ui, sans-serif`;

  mut_context.textAlign = 'center';

  mut_context.textBaseline = 'alphabetic';

  // Centred on the glyphs' own ink rather than on `textBaseline = 'middle'`,
  // which centres the font's em box and leaves a digit sitting low by an
  // amount that depends on the platform's font.
  const metrics = mut_context.measureText(label);

  const x = Num.div(faviconPx, 2);

  const y = Num.div(
    faviconPx +
      metrics.actualBoundingBoxAscent -
      metrics.actualBoundingBoxDescent,
    2,
  );

  // An outline in the square's own colour, so that where a digit crosses a
  // faded pane its edge still meets the colour it is legible against.
  mut_context.lineJoin = 'round';

  mut_context.lineWidth = outlinePx;

  mut_context.strokeStyle = accent;

  mut_context.strokeText(label, x, y);

  mut_context.fillStyle = '#ffffff';

  mut_context.fillText(label, x, y);

  return mut_canvas.toDataURL('image/png');
};

/** The favicon's side, in canvas pixels: twice what a tab shows at 1x. */
export const faviconPx = 32;

/**
 * Where the favicon's parts go, for a position.
 *
 * The icon fills the favicon and the number is centred on it. More digits
 * shrink the number, so that three still fit inside the rounded square.
 */
export const faviconLayoutOf = (
  position: number,
): Readonly<{
  label: string;
  fontPx: number;
  outlinePx: number;
  icon: IconPlacement;
}> => {
  const label = String(Math.max(1, Math.round(position)));

  const fontPx =
    fontPxByDigits[Math.min(label.length, fontPxByDigits.length) - 1] ??
    fontPxByDigits[0];

  return {
    label,
    fontPx,
    outlinePx: 3,
    icon: { x: 0, y: 0, size: faviconPx },
  };
};

/** Where the extension's icon goes in the favicon, and at what size. */
type IconPlacement = Readonly<{ x: number; y: number; size: number }>;

type RoundRect = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}>;

const faviconLinkId = 'split-view-favicon';

/** By the number of digits: one, two, and anything longer. */
const fontPxByDigits = [24, 18, 13] as const;

/**
 * How much of the panes shows through. Enough to read as the extension's icon
 * at 16px, little enough that the number in front of them is what is read.
 */
const paneAlpha = 0.32;

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

/**
 * The rounded square of the extension's icon, as `scripts/gen-icons.mts`
 * draws it into `public/icons/`.
 */
const extensionIconSquareOf = ({ x, y, size }: IconPlacement): RoundRect => {
  const inset = Math.round(extensionIcon.squareInset * size);

  return {
    x: x + inset,
    y: y + inset,
    width: size - 2 * inset,
    height: size - 2 * inset,
    radius: extensionIcon.squareRadius * size,
  };
};

/** The four panes of the extension's icon, snapped as the PNGs snap them. */
const extensionIconPanesPathOf = ({ x, y, size }: IconPlacement): Path2D => {
  const [near, nearEnd, far, farEnd] = extensionIconPaneBoundsOf(size);

  const spans = [
    [near, nearEnd],
    [far, farEnd],
  ] as const;

  const mut_path = new Path2D();

  for (const [x0, x1] of spans) {
    for (const [y0, y1] of spans) {
      mut_path.rect(x + x0, y + y0, x1 - x0, y1 - y0);
    }
  }

  return mut_path;
};

const roundRectPathOf = ({
  x,
  y,
  width,
  height,
  radius,
}: RoundRect): Path2D => {
  const mut_path = new Path2D();

  mut_path.roundRect(x, y, width, height, radius);

  return mut_path;
};

const rgbOf = (
  [r, g, b]: readonly [number, number, number],
  alpha: number,
): string =>
  `rgb(${String(r)} ${String(g)} ${String(b)} / ${String(alpha)})` as const;
