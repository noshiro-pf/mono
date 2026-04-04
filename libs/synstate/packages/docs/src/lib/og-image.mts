/* eslint-disable security/detect-non-literal-fs-filename */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { inflateSync } from 'node:zlib';
import type * as React from 'react';
import satori from 'satori';
import { asSafeUint, range } from 'ts-data-forge';

const OG_WIDTH = 1200;

const OG_HEIGHT = 630;

// ---------------------------------------------------------------------------
// WOFF → TTF converter (satori does not support WOFF)
// ---------------------------------------------------------------------------
const woffToTtf = (woffBuf: Readonly<Buffer>): Buffer => {
  const view = new DataView(
    woffBuf.buffer,
    woffBuf.byteOffset,
    woffBuf.byteLength,
  );

  const numTables = view.getUint16(12);

  const flavor = view.getUint32(4);

  const mut_tables: {
    tag: string;
    offset: number;
    compLength: number;
    origLength: number;
    origChecksum: number;
  }[] = [];

  let mut_dirOffset = 44;

  for (const _i of range(0, asSafeUint(numTables))) {
    mut_tables.push({
      tag: woffBuf.subarray(mut_dirOffset, mut_dirOffset + 4).toString('ascii'),
      offset: view.getUint32(mut_dirOffset + 4),
      compLength: view.getUint32(mut_dirOffset + 8),
      origLength: view.getUint32(mut_dirOffset + 12),
      origChecksum: view.getUint32(mut_dirOffset + 16),
    });

    mut_dirOffset += 20;
  }

  const tables: readonly Readonly<{
    tag: string;
    offset: number;
    compLength: number;
    origLength: number;
    origChecksum: number;
  }>[] = mut_tables;

  const searchRange = 2 ** Math.floor(Math.log2(numTables)) * 16;

  const entrySelector = Math.floor(Math.log2(numTables));

  const rangeShift = numTables * 16 - searchRange;

  const sfntHeaderSize = 12;

  const sfntDirSize = numTables * 16;

  const decompressed = tables.map((t) => {
    const chunk = woffBuf.subarray(t.offset, t.offset + t.compLength);

    return t.compLength < t.origLength ? inflateSync(chunk) : chunk;
  });

  const mut_paddedOffsets: number[] = [];

  let mut_currentOffset = sfntHeaderSize + sfntDirSize;

  for (const d of decompressed) {
    mut_paddedOffsets.push(mut_currentOffset);

    mut_currentOffset += d.length + ((4 - (d.length % 4)) % 4);
  }

  const paddedOffsets: readonly number[] = mut_paddedOffsets;

  const output = Buffer.alloc(mut_currentOffset);

  const ov = new DataView(output.buffer);

  ov.setUint32(0, flavor);

  ov.setUint16(4, numTables);

  ov.setUint16(6, searchRange);

  ov.setUint16(8, entrySelector);

  ov.setUint16(10, rangeShift);

  let mut_dp = sfntHeaderSize;

  for (const i of range(0, asSafeUint(numTables))) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const table = tables[i]!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const padOffset = paddedOffsets[i]!;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decompressedEntry = decompressed[i]!;

    output.write(table.tag, mut_dp, 4, 'ascii');

    ov.setUint32(mut_dp + 4, table.origChecksum);

    ov.setUint32(mut_dp + 8, padOffset);

    ov.setUint32(mut_dp + 12, decompressedEntry.length);

    mut_dp += 16;
  }

  for (const i of range(0, asSafeUint(decompressed.length))) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    decompressed[i]!.copy(output, paddedOffsets[i]);
  }

  return output;
};

// ---------------------------------------------------------------------------
// Font loading — convert all @fontsource WOFF subsets to TTF at startup.
// Each subset is registered under a unique name (F0, F1, …) because satori
// does not do character-level fallback across fonts that share the same name.
// The CSS fontFamily is set to "F0, F1, …" so satori searches each subset.
// ---------------------------------------------------------------------------
const require = createRequire(import.meta.url);

const fontsDir = require
  .resolve('@fontsource/noto-sans-jp/400.css')
  .replace(/400\.css$/u, 'files/');

const loadSubsets = (weight: string): readonly Buffer[] =>
  readdirSync(fontsDir)
    .filter(
      (f) => f.includes(`-${weight}-normal.woff`) && !f.endsWith('.woff2'),
    )
    .toSorted()
    .map((f) => woffToTtf(readFileSync(fontsDir + f)));

const subsets400 = loadSubsets('400');

const subsets700 = loadSubsets('700');

const fontNames = subsets400.map((_, i) => `F${i}`);

const fontFamily = fontNames.join(', ');

const fonts = [
  ...subsets400.map((data, i) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    name: fontNames[i]!,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    data: data.buffer as ArrayBuffer,
    weight: 400 as const,
    style: 'normal' as const,
  })),
  ...subsets700.map((data, i) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    name: fontNames[i]!,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    data: data.buffer as ArrayBuffer,
    weight: 700 as const,
    style: 'normal' as const,
  })),
] as const;

// ---------------------------------------------------------------------------
// OG image generation
// ---------------------------------------------------------------------------
export const generateOgImage = async (
  title: string,
  description: string | undefined,
): Promise<Buffer> => {
  const svg = await satori(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily,
          color: '#f8fafc',
        },
        children: [
          // Header: logo + site name
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background:
                        'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#94a3b8',
                    },
                    children: 'SynState',
                  },
                },
              ],
            },
          },
          // Body: title + description
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                flex: 1,
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 30 ? '48px' : '56px',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      color: '#f8fafc',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                    children: title,
                  },
                },
                ...(description !== undefined && description !== ''
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '24px',
                            lineHeight: 1.5,
                            color: '#94a3b8',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                          children:
                            description.length > 120
                              ? `${description.slice(0, 117)}...`
                              : description,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
          // Footer: site URL
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '20px',
                      color: '#64748b',
                    },
                    children: 'noshiro-pf.github.io/synstate',
                  },
                },
              ],
            },
          },
        ],
      },
    } as React.ReactNode,
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: Array.from(fonts),
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
  });

  return resvg.render().asPng();
};
