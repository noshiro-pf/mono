/* eslint-disable security/detect-non-literal-fs-filename */
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

// Renders every tab icon / home-screen icon from `public/synstate-logo.png`
// (1200×674: a white rounded square on a blue glow, centered). Not part of
// `gen`: the output only changes when the logo does, and a resvg upgrade
// would otherwise dirty the tree with byte-level differences.

const logoPath = path.resolve(workspaceRootPath, 'public/synstate-logo.png');

const outDir = path.resolve(workspaceRootPath, 'public/favicon');

const LOGO_WIDTH = 1200;

const LOGO_HEIGHT = 674;

type Crop = Readonly<{
  /** Side of the square cut out of the logo, centered on it. */
  side: number;
  /** Clip to the white rounded square and leave the rest transparent. */
  rounded: boolean;
}>;

/** The white rounded square alone, for browser tabs. */
const markCrop: Crop = { side: 368, rounded: true } as const;

/** The square with some glow around it, for opaque home-screen icons. */
const tileCrop: Crop = { side: 600, rounded: false } as const;

/**
 * The full logo height, so the mark stays inside the maskable safe zone (the
 * central circle of 80% diameter).
 */
const maskableCrop: Crop = { side: LOGO_HEIGHT, rounded: false } as const;

const MARK_CORNER_RADIUS_RATIO = 0.2;

const renderCrop = (logoDataUri: string, crop: Crop, size: number): Buffer => {
  const x = (LOGO_WIDTH - crop.side) / 2;

  const y = (LOGO_HEIGHT - crop.side) / 2;

  const radius = crop.side * MARK_CORNER_RADIUS_RATIO;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${x} ${y} ${crop.side} ${crop.side}">`,
    crop.rounded
      ? `<defs><clipPath id="c"><rect x="${x}" y="${y}" width="${crop.side}" height="${crop.side}" rx="${radius}" ry="${radius}"/></clipPath></defs>`
      : '',
    `<image ${crop.rounded ? 'clip-path="url(#c)" ' : ''}x="0" y="0" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}" href="${logoDataUri}"/>`,
    '</svg>',
  ].join('');

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });

  return resvg.render().asPng();
};

/** An ICO container holding PNG images, which every current browser reads. */
const toIco = (
  icons: readonly Readonly<{ size: number; png: Readonly<Buffer> }>[],
): Buffer => {
  const headerSize = 6;

  const entrySize = 16;

  const header = Buffer.alloc(headerSize + entrySize * icons.length);

  header.writeUInt16LE(0, 0);

  header.writeUInt16LE(1, 2);

  header.writeUInt16LE(icons.length, 4);

  let mut_offset = header.length;

  for (const [i, { size, png }] of icons.entries()) {
    const at = headerSize + entrySize * i;

    header.writeUInt8(size >= 256 ? 0 : size, at);

    header.writeUInt8(size >= 256 ? 0 : size, at + 1);

    header.writeUInt8(0, at + 2);

    header.writeUInt8(0, at + 3);

    header.writeUInt16LE(1, at + 4);

    header.writeUInt16LE(32, at + 6);

    header.writeUInt32LE(png.length, at + 8);

    header.writeUInt32LE(mut_offset, at + 12);

    mut_offset += png.length;
  }

  return Buffer.concat(Arr.toUnshifted(header)(icons.map(({ png }) => png)));
};

const main = async (): Promise<void> => {
  const logo = await fs.readFile(logoPath);

  // `Uint8Array#toBase64` arrived only in Node.js 25; `engines.node` is lower.
  // eslint-disable-next-line unicorn/prefer-uint8array-base64
  const logoBase64 = logo.toString('base64');

  const logoDataUri = `data:image/png;base64,${logoBase64}` as const;

  const outputs: readonly Readonly<{
    file: string;
    crop: Crop;
    size: number;
  }>[] = [
    { file: 'favicon-16x16.png', crop: markCrop, size: 16 },
    { file: 'favicon-32x32.png', crop: markCrop, size: 32 },
    { file: 'favicon-48x48.png', crop: markCrop, size: 48 },
    // Read by src/lib/og-image.mts for the logo on every OG image.
    { file: 'logo-mark-256x256.png', crop: markCrop, size: 256 },
    { file: 'apple-touch-icon.png', crop: tileCrop, size: 180 },
    { file: 'icon-192x192.png', crop: tileCrop, size: 192 },
    { file: 'icon-512x512.png', crop: tileCrop, size: 512 },
    { file: 'icon-maskable-512x512.png', crop: maskableCrop, size: 512 },
  ] as const;

  const rendered = outputs.map(({ file, crop, size }) => ({
    file,
    size,
    png: renderCrop(logoDataUri, crop, size),
  }));

  await fs.mkdir(outDir, { recursive: true });

  await Promise.all(
    rendered.map(({ file, png }) => fs.writeFile(path.join(outDir, file), png)),
  );

  const ico = toIco(
    rendered.filter(({ file }) => /^favicon-\d+x\d+\.png$/u.test(file)),
  );

  await fs.writeFile(path.join(outDir, 'favicon.ico'), ico);

  console.log(`Wrote ${rendered.length + 1} files to ${outDir}`);
};

await main();
