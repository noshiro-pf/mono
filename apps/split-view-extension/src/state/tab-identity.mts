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
 * The favicon for a position, as a PNG data URL: the extension's icon with the
 * number on a badge in its corner, as an extension's toolbar icon carries one.
 *
 * The icon rather than a plain square with the number in it, because a
 * coloured square with a number is also what Google Calendar's tab shows, and
 * the two could not be told apart in a tab strip.
 */
export const faviconDataUri = (position: number): string | undefined => {
  const mut_canvas = mut_page.createElement('canvas');

  mut_canvas.width = faviconPx;

  mut_canvas.height = faviconPx;

  const mut_context = mut_canvas.getContext('2d');

  if (mut_context === null) {
    return undefined;
  }

  const { label, fontPx, icon, badge, cutout } = faviconLayoutOf(position);

  mut_context.fillStyle = rgbOf(extensionIcon.background);

  mut_context.fill(roundRectPathOf(extensionIconSquareOf(icon)));

  mut_context.fillStyle = rgbOf(extensionIcon.pane);

  mut_context.fill(extensionIconPanesPathOf(icon));

  // Cleared rather than outlined in a fixed colour: the tab strip behind the
  // gap may be light or dark, and the gap is what keeps a badge in the same
  // blue as the icon from merging into it.
  mut_context.globalCompositeOperation = 'destination-out';

  mut_context.fill(roundRectPathOf(cutout));

  mut_context.globalCompositeOperation = 'source-over';

  mut_context.fillStyle = accentColorOf(position);

  mut_context.fill(roundRectPathOf(badge));

  mut_context.fillStyle = '#ffffff';

  mut_context.font = `700 ${String(fontPx)}px system-ui, sans-serif`;

  mut_context.textAlign = 'center';

  mut_context.textBaseline = 'alphabetic';

  // Centred on the glyphs' own ink rather than on `textBaseline = 'middle'`,
  // which centres the font's em box and leaves a digit sitting low by an
  // amount that depends on the platform's font.
  const metrics = mut_context.measureText(label);

  mut_context.fillText(
    label,
    badge.x + Num.div(badge.width, 2),
    badge.y +
      Num.div(
        badge.height +
          metrics.actualBoundingBoxAscent -
          metrics.actualBoundingBoxDescent,
        2,
      ),
  );

  return mut_canvas.toDataURL('image/png');
};

/** The favicon's side, in canvas pixels: twice what a tab shows at 1x. */
export const faviconPx = 32;

/**
 * Where the favicon's parts go, for a position.
 *
 * The icon is drawn smaller than the favicon and in its top left corner, and
 * the badge overhangs it in the bottom right, so that at one digit the badge
 * hides only the pane under it and the other three still read as the icon.
 * More digits widen the badge leftwards and shrink the number, the badge never
 * leaving the favicon.
 */
export const faviconLayoutOf = (
  position: number,
): Readonly<{
  label: string;
  fontPx: number;
  icon: IconPlacement;
  badge: RoundRect;
  cutout: RoundRect;
}> => {
  const label = String(Math.max(1, Math.round(position)));

  const { width, fontPx } =
    badgeSizes[Math.min(label.length, badgeSizes.length) - 1] ?? badgeSizes[0];

  const radius = Num.div(badgeHeight, 2);

  const badge = {
    x: faviconPx - width,
    y: faviconPx - badgeHeight,
    width,
    height: badgeHeight,
    radius,
  } as const;

  return {
    label,
    fontPx,
    icon: { x: 0, y: 0, size: iconPx },
    badge,
    cutout: {
      x: badge.x - badgeGap,
      y: badge.y - badgeGap,
      width: badge.width + 2 * badgeGap,
      height: badge.height + 2 * badgeGap,
      radius: radius + badgeGap,
    },
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

/** The icon under the badge, in canvas pixels. */
const iconPx = 22;

const badgeHeight = 20;

/** The cleared ring around the badge, in canvas pixels. */
const badgeGap = 2;

/** By the number of digits: one, two, and anything longer. */
const badgeSizes = [
  { width: badgeHeight, fontPx: 18 },
  { width: 28, fontPx: 15 },
  { width: faviconPx, fontPx: 12 },
] as const;

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

const rgbOf = ([r, g, b]: readonly [number, number, number]): string =>
  `rgb(${String(r)} ${String(g)} ${String(b)})` as const;
