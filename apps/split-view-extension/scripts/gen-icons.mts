import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import { Arr, Num } from 'ts-data-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Draws the extension's icons into `public/icons/`.
 *
 * PNG, because that is the only thing the manifest's `icons` takes, and drawn
 * here rather than kept as four hand-made files so that the shape has one
 * definition. There is no image library in the dependency tree and no need for
 * one: the icon is a rounded square with four panes in it, which is arithmetic,
 * and `node:zlib` is the only thing a PNG needs beyond that.
 *
 * The four panes are the layout the extension opens in, and they are what has
 * to survive being drawn at 16px — hence 2x2 rather than anything cleverer,
 * and hence the supersampling, which is what keeps the corners from looking
 * chewed at that size.
 */
const main = (): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(iconsPath, { recursive: true });

  for (const size of iconSizes) {
    const file = path.resolve(iconsPath, `${String(size)}.png`);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(file, encodePng(size));

    console.log(`${file}  ${String(size)}x${String(size)}`);
  }
};

/** What the manifest asks for: the toolbar, the menus, and the store. */
const iconSizes = [16, 32, 48, 128] as const;

const iconsPath = path.resolve(workspaceRootPath, 'public', 'icons');

/** The blue the interface uses for anything active. */
const background = [79, 127, 217] as const;

const pane = [255, 255, 255] as const;

/** How far the rounded square is inset, and how round it is, in unit space. */
const squareInset = 0.02;

const squareRadius = 0.2;

/** Where the four panes sit inside it, and how far apart. */
const paneInset = 0.2;

const paneGutter = 0.07;

/** Subsamples per axis. Enough to make a curve at 16px look like one. */
const samples = 4;

/** One subsample, as a fraction of a pixel. */
const subsampleStep = Num.div(1, samples);

/**
 * What one subsample contributes to the pixel it is in.
 *
 * Guarded rather than written as `1 / 16`, so that it follows `samples`: the
 * safe divide takes a literal or a number known to be non-zero, and the
 * product of two constants is neither as far as the types are concerned.
 */
const subsampleCount = samples ** 2;

const subsampleWeight = Num.isNonZero(subsampleCount)
  ? Num.div(1, subsampleCount)
  : 1;

const rowsOf = (size: number): readonly (readonly number[])[] =>
  Array.from({ length: size }, (_unusedRow, y) =>
    Array.from({ length: size }, (_unusedColumn, x) =>
      channels.map((channel) => channelAt(size, x, y, channel)),
    ).flat(),
  );

/** RGBA. */
const channels = [0, 1, 2, 3] as const;

/**
 * One channel of one pixel, averaged over a grid of subsamples.
 *
 * Averaging the colour and the coverage in one pass is what gives the rounded
 * corner its anti-aliasing. The pane edges need none — they are snapped to the
 * pixel grid — and get none, because every subsample of a boundary pixel falls
 * on the same side of them.
 */
const channelAt = (
  size: number,
  x: number,
  y: number,
  channel: number,
): number => {
  const offsets = Array.from(
    { length: samples },
    (_, step) => (step + 0.5) * subsampleStep,
  );

  const total = offsets
    .flatMap((dy) => offsets.map((dx) => [dx, dy] as const))
    .reduce(
      (sum, [dx, dy]) => sum + (colourAt(size, x + dx, y + dy)[channel] ?? 0),
      0,
    );

  return Math.round(total * subsampleWeight);
};

/** The icon in pixel space: transparent, blue, or a pane. */
const colourAt = (
  size: number,
  px: number,
  py: number,
): readonly [number, number, number, number] => {
  if (!isInRoundedSquare(size, px, py)) {
    return [0, 0, 0, 0];
  }

  const panes = paneBoundsOf(size);

  return isInPane(panes, px) && isInPane(panes, py)
    ? [pane[0], pane[1], pane[2], 255]
    : [background[0], background[1], background[2], 255];
};

const isInRoundedSquare = (size: number, px: number, py: number): boolean => {
  const low = Math.round(squareInset * size);

  const high = size - low;

  if (px < low || px > high || py < low || py > high) {
    return false;
  }

  // Only a corner can fall outside, so the distance test is against whichever
  // corner circle this point is nearest to. The radius stays fractional: this
  // is the one edge that is a curve, and it is the one that wants smoothing.
  const radius = squareRadius * size;

  const cx = Math.min(Math.max(px, low + radius), high - radius);

  const cy = Math.min(Math.max(py, low + radius), high - radius);

  return (px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2;
};

/**
 * Where the four panes start and end, in whole pixels.
 *
 * Snapped, because the alternative is what 16px looked like when this was
 * fractions of a unit square: a one-pixel gutter spread across two pixels at
 * half strength, and four panes that read as one grey smudge.
 */
const paneBoundsOf = (
  size: number,
): readonly [number, number, number, number] => {
  const inset = Math.max(1, Math.round(paneInset * size));

  const gutter = Math.max(1, Math.round(paneGutter * size));

  const span = Math.max(1, Math.floor(Num.div(size - 2 * inset - gutter, 2)));

  return [inset, inset + span, size - inset - span, size - inset];
};

/** Whether one axis falls inside either of the two panes along it. */
const isInPane = (
  [near, nearEnd, far, farEnd]: readonly [number, number, number, number],
  t: number,
): boolean => (t >= near && t < nearEnd) || (t >= far && t < farEnd);

/**
 * The whole file for one size.
 *
 * The bytes travel as plain arrays rather than as `Buffer`s, which cannot be
 * parameter types here — the lint rules want a deeply readonly one, and a
 * `Buffer` is mutable all the way down. At 128x128 that is 66,048 numbers,
 * which is nothing to hold once.
 */
const encodePng = (size: number): Buffer => {
  // Each scanline is prefixed with its filter type, and 0 means "none".
  const raw = rowsOf(size).flatMap(Arr.toUnshifted(0));

  // 8 bits a channel, colour type 6 (RGBA), and the only compression, filter
  // and interlace methods PNG has.
  const header = [...beUint32(size), ...beUint32(size), 8, 6, 0, 0, 0] as const;

  return Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
    ...chunk('IHDR', header),
    ...chunk(
      'IDAT',
      Array.from(zlib.deflateSync(Buffer.from(raw), { level: 9 })),
    ),
    ...chunk('IEND', []),
  ]);
};

const chunk = (kind: string, body: readonly number[]): readonly number[] => {
  const tagged = [...Array.from(Buffer.from(kind, 'latin1')), ...body] as const;

  return [...beUint32(body.length), ...tagged, ...beUint32(crc32(tagged))];
};

const beUint32 = (value: number): readonly number[] =>
  [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ] as const;

const crcTable = Array.from({ length: 256 }, (_, index) =>
  Array.from({ length: 8 }).reduce<number>(
    (value) =>
      (value & 1) === 1 ? 0xed_b8_83_20 ^ (value >>> 1) : value >>> 1,
    index,
  ),
);

const crc32 = (bytes: readonly number[]): number =>
  (bytes.reduce(
    (value, byte) => (crcTable[(value ^ byte) & 0xff] ?? 0) ^ (value >>> 8),
    0xff_ff_ff_ff,
  ) ^
    0xff_ff_ff_ff) >>>
  0;

main();
