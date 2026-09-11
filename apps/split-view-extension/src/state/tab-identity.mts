import { Num } from 'ts-data-forge';

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
 * The colour of the favicon for a position, from a fixed cycle.
 *
 * Fixed rather than derived from the name, so that renaming a workspace does
 * not change the icon the user has learned to look for, and saturated enough
 * to carry white text at 16px on both a light and a dark tab strip.
 */
export const accentColorOf = (position: number): string =>
  accentColors[(Math.max(1, position) - 1) % accentColors.length] ?? '#4f7fd9';

/**
 * Gives the tab a title and a numbered favicon.
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

/** The favicon for a position, as a PNG data URL. */
export const faviconDataUri = (position: number): string | undefined => {
  const mut_canvas = mut_page.createElement('canvas');

  mut_canvas.width = faviconPx;

  mut_canvas.height = faviconPx;

  const mut_context = mut_canvas.getContext('2d');

  if (mut_context === null) {
    return undefined;
  }

  const label = String(Math.max(1, Math.round(position)));

  mut_context.fillStyle = accentColorOf(position);

  mut_context.beginPath();

  mut_context.roundRect(0, 0, faviconPx, faviconPx, 7);

  mut_context.fill();

  mut_context.fillStyle = '#ffffff';

  mut_context.font = `700 ${String(label.length > 1 ? 18 : 24)}px system-ui, sans-serif`;

  mut_context.textAlign = 'center';

  mut_context.textBaseline = 'middle';

  mut_context.fillText(label, Num.div(faviconPx, 2), Num.div(faviconPx, 2) + 1);

  return mut_canvas.toDataURL('image/png');
};

const faviconLinkId = 'split-view-favicon';

const faviconPx = 32;

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
