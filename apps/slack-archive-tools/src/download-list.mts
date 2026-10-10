import * as path from 'node:path';
import { Arr, ISet, isRecord, isString } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { extractExt } from './extract-ext.mjs';

/**
 * Lists the files.slack.com URLs found anywhere in `data` together with the
 * path each is saved to, and the extensions of the URLs it skipped because
 * their extension is not one it downloads. Every `outputFilePath` lies under
 * `dir`; an entry whose keys would place it elsewhere is dropped.
 */
export const listDownloadFiles = (data: unknown, dir: string): DownloadList => {
  const found = listDownloadFileRecursively(data, dir, '');

  return {
    files: Arr.generate(function* () {
      for (const entry of found) {
        if (entry.type === 'file') {
          yield entry.file;
        }
      }
    }).filter(({ outputFilePath }) => isInside(dir, outputFilePath)),
    unknownExtensions: Arr.generate(function* () {
      for (const entry of found) {
        if (entry.type === 'unknownExtension') {
          yield entry.ext;
        }
      }
    }),
  };
};

export type DownloadFile = Readonly<{ url: string; outputFilePath: string }>;

export type DownloadList = DeepReadonly<{
  files: DownloadFile[];
  unknownExtensions: string[];
}>;

type Found = Readonly<
  | { type: 'file'; file: DownloadFile }
  | { type: 'unknownExtension'; ext: string }
>;

const knownExtensions = ISet.create<`.${string}`>([
  '.jpg',
  '.png',
  '.gif',
  '.jpeg',
  '.pdf',
  '.html',
  '.bmp',
  '.heic',
  '.zip',
  '.xlsx',
  '.co',
  // '.mov',
  // '.mp4',
  // '.vtt', // error
  // '.m3u8', // error
]);

/**
 * Returns `s` normalized by `URL` when it is an https URL on files.slack.com,
 * and `undefined` otherwise.
 */
const parseFileURL = (s: string): string | undefined => {
  const url = URL.parse(s);

  return url?.protocol === 'https:' && url.hostname === 'files.slack.com'
    ? url.href
    : undefined;
};

const listDownloadFileRecursively = (
  data: unknown,
  dir: string,
  prop: string,
): readonly Found[] => {
  if (Arr.isArray(data)) {
    return data.flatMap((el, i) =>
      listDownloadFileRecursively(el, path.resolve(dir, prop), i.toString()),
    );
  }

  if (isRecord(data)) {
    return Object.entries(data).flatMap(([key, value]) =>
      listDownloadFileRecursively(value, path.resolve(dir, prop), key),
    );
  }

  const url = isString(data) ? parseFileURL(data) : undefined;

  if (url === undefined) {
    return [];
  }

  const ext = extractExt(url);

  return [
    knownExtensions.has(ext)
      ? {
          type: 'file',
          file: { url, outputFilePath: path.resolve(dir, `${prop}${ext}`) },
        }
      : { type: 'unknownExtension', ext },
  ];
};

const isInside = (dir: string, filePath: string): boolean => {
  const relative = path.relative(dir, filePath);

  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
};
