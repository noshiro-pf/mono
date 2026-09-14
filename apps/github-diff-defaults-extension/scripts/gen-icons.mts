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
 * one: the icon is two rounded bars, which is arithmetic, and `node:zlib` is
 * the only thing a PNG needs beyond that.
 *
 * The bars are an addition above a deletion — the two colours GitHub gives a
 * diff — and they sit on nothing at all rather than on a square. A toolbar can
 * be light or dark and this extension has no say in which; a shape with no
 * background reads on both, where a coloured square reads on one of them.
 *
 * The output is committed, so this runs when the shape changes and not as part
 * of the build.
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

/** A bar, in unit space, with the colour it is drawn in. */
type Bar = Readonly<{
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  colour: readonly [number, number, number];
}>;

/**
 * The two bars.
 *
 * The deletion is the shorter of the two, which is what stops the pair from
 * reading as an equals sign, and the gap between them is wide enough to survive
 * being a single pixel at 16px.
 */
const bars: readonly Bar[] = [
  { x0: 0.09, x1: 0.91, y0: 0.2, y1: 0.44, colour: [63, 185, 80] },
  { x0: 0.09, x1: 0.68, y0: 0.56, y1: 0.8, colour: [248, 81, 73] },
] as const;

/** How round the ends are, in unit space. About a pixel at 16px. */
const barRadius = 0.055;

/** Subsamples per axis. Enough to make a curve at 16px look like one. */
const samples = 4;

/** One subsample, as a fraction of a pixel. */
const subsampleStep = Num.div(1, samples);

/**
 * What one subsample contributes to the pixel it is in.
 *
 * Guarded rather than written as `1 / 16`, so that it follows `samples`: the
 * safe divide takes a literal or a number known to be non-zero, and the product
 * of two constants is neither as far as the types are concerned.
 */
const subsampleCount = samples ** 2;

const subsampleWeight = Num.isNonZero(subsampleCount)
  ? Num.div(1, subsampleCount)
  : 1;

/** Where the subsamples sit inside a pixel, along one axis. */
const subsampleOffsets = Array.from(
  { length: samples },
  (_unused, step) => (step + 0.5) * subsampleStep,
);

const rowsOf = (size: number): readonly (readonly number[])[] =>
  Array.from({ length: size }, (_unusedRow, y) =>
    Array.from({ length: size }, (_unusedColumn, x) =>
      pixelAt(size, x, y),
    ).flat(),
  );

/**
 * One pixel, as RGBA.
 *
 * The bars do not overlap, so the weighting below is only ever one bar against
 * nothing. It is written as a mix anyway because a bar moved by a tenth would
 * otherwise turn a shared pixel into whichever colour came first in the list.
 */
const pixelAt = (
  size: number,
  x: number,
  y: number,
): readonly [number, number, number, number] => {
  const weighted = bars.map(
    (bar) => [coverageOf(bar, size, x, y), bar.colour] as const,
  );

  const total = weighted.reduce((sum, [coverage]) => sum + coverage, 0);

  if (!Num.isNonZero(total)) {
    return [0, 0, 0, 0];
  }

  const channelAt = (channel: 0 | 1 | 2): number =>
    Math.round(
      Num.div(
        weighted.reduce(
          (sum, [coverage, colour]) => sum + coverage * colour[channel],
          0,
        ),
        total,
      ),
    );

  return [
    channelAt(0),
    channelAt(1),
    channelAt(2),
    Math.round(Math.min(total, 1) * 255),
  ];
};

/** How much of one pixel one bar covers, as a fraction. */
const coverageOf = (bar: Bar, size: number, x: number, y: number): number =>
  subsampleOffsets
    .flatMap((dy) => subsampleOffsets.map((dx) => [dx, dy] as const))
    .filter(([dx, dy]) => isInsideBar(bar, size, x + dx, y + dy)).length *
  subsampleWeight;

/**
 * Whether a point in pixel space is inside a bar.
 *
 * Only a corner can fall outside a rectangle it is otherwise within, so the
 * distance test is against whichever corner circle the point is nearest to.
 */
const isInsideBar = (
  bar: Bar,
  size: number,
  px: number,
  py: number,
): boolean => {
  const x0 = bar.x0 * size;

  const x1 = bar.x1 * size;

  const y0 = bar.y0 * size;

  const y1 = bar.y1 * size;

  if (px < x0 || px > x1 || py < y0 || py > y1) {
    return false;
  }

  const radius = Math.min(
    barRadius * size,
    Num.div(x1 - x0, 2),
    Num.div(y1 - y0, 2),
  );

  const cx = Math.min(Math.max(px, x0 + radius), x1 - radius);

  const cy = Math.min(Math.max(py, y0 + radius), y1 - radius);

  return (px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2;
};

/**
 * The whole file for one size.
 *
 * The bytes travel as plain arrays rather than as `Buffer`s, which cannot be
 * parameter types here — the lint rules want a deeply readonly one, and a
 * `Buffer` is mutable all the way down.
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

const crcTable = Array.from({ length: 256 }, (_unused, index) =>
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
