import { Num } from 'ts-data-forge';
import {
  accentColorOf,
  extensionIcon,
  faviconLabelOf,
  iconPaneBoundsOf,
  tabTitleOf,
} from '../core/index.mjs';

/**
 * Titles the tab `<position>: <label>` and draws its favicon (spec W7): the
 * extension's icon in the position's colour, its panes faded, the number across
 * it — the panes kept so that it does not read as a calendar's tab.
 */
export const applyTabIdentity = (position: number, label: string): void => {
  const mut_page = document;

  mut_page.title = tabTitleOf(position, label);

  const href = faviconDataUrlOf(position);

  if (href === undefined) {
    return;
  }

  const existing = document.querySelector(`link#${faviconLinkId}`);

  const mut_link =
    existing instanceof HTMLLinkElement
      ? existing
      : document.createElement('link');

  mut_link.id = faviconLinkId;

  mut_link.rel = 'icon';

  mut_link.href = href;

  if (mut_link !== existing) {
    document.head.append(mut_link);
  }
};

/** Twice what a tab shows at 1x. */
const faviconPx = 32;

const faviconLinkId = 'split-view-favicon';

/** Enough to read as the icon at 16px, little enough that the number wins. */
const paneAlpha = 0.32;

const faviconDataUrlOf = (position: number): string | undefined => {
  const mut_canvas = document.createElement('canvas');

  mut_canvas.width = faviconPx;

  mut_canvas.height = faviconPx;

  const mut_context = mut_canvas.getContext('2d');

  if (mut_context === null) {
    return undefined;
  }

  const accent = accentColorOf(position);

  const inset = Math.round(extensionIcon.squareInset * faviconPx);

  mut_context.fillStyle = accent;

  mut_context.beginPath();

  mut_context.roundRect(
    inset,
    inset,
    faviconPx - 2 * inset,
    faviconPx - 2 * inset,
    extensionIcon.squareRadius * faviconPx,
  );

  mut_context.fill();

  const [near, nearEnd, far, farEnd] = iconPaneBoundsOf(faviconPx);

  const [r, g, b] = extensionIcon.pane;

  mut_context.fillStyle = `rgb(${r.toString()} ${g.toString()} ${b.toString()} / ${paneAlpha.toString()})`;

  for (const [x0, x1] of [
    [near, nearEnd],
    [far, farEnd],
  ] as const) {
    for (const [y0, y1] of [
      [near, nearEnd],
      [far, farEnd],
    ] as const) {
      mut_context.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
  }

  const { label, fontPx } = faviconLabelOf(position);

  mut_context.font = `700 ${fontPx.toString()}px system-ui, sans-serif`;

  mut_context.textAlign = 'center';

  // Centred on the glyphs' ink, not the em box, which sits a digit low.
  const metrics = mut_context.measureText(label);

  const x = Num.div(faviconPx, 2);

  const y = Num.div(
    faviconPx +
      metrics.actualBoundingBoxAscent -
      metrics.actualBoundingBoxDescent,
    2,
  );

  // Outlined in the square's colour, so a digit stays legible over a pane.
  mut_context.lineJoin = 'round';

  mut_context.lineWidth = 3;

  mut_context.strokeStyle = accent;

  mut_context.strokeText(label, x, y);

  mut_context.fillStyle = '#ffffff';

  mut_context.fillText(label, x, y);

  return mut_canvas.toDataURL('image/png');
};
