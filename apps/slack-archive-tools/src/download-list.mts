import * as path from 'node:path';
import { Arr, ISet, isRecord, isString } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { extractExt } from './extract-ext.mjs';

/**
 * Lists the files.slack.com URLs found anywhere in `data` together with the
 * path each is saved to. Every `outputFilePath` lies under `dir`; an entry
 * whose keys would place it elsewhere is dropped.
 */
export const listDownloadFiles = (
  data: unknown,
  dir: string,
): DeepReadonly<{ url: string; outputFilePath: string }[]> =>
  listDownloadFileRecursively(data, dir, '').filter(({ outputFilePath }) =>
    isInside(dir, outputFilePath),
  );

export const unknownExtensions = (): readonly string[] =>
  Array.from(mut_unknownExtensions);

const listDownloadFileRecursively = (
  data: unknown,
  dir: string,
  prop: string,
): DeepReadonly<{ url: string; outputFilePath: string }[]> => {
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

  if (url !== undefined) {
    const ext = extractExt(url);

    if (knownExtensions.has(ext)) {
      return [
        {
          url,
          outputFilePath: path.resolve(dir, `${prop}${ext}`),
        },
      ];
    }

    mut_unknownExtensions.add(ext);

    return [];
  }

  return [];
};

const mut_unknownExtensions: Set<string> = new Set<string>();

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
  if (!URL.canParse(s)) {
    return undefined;
  }

  const url = new URL(s);

  return url.protocol === 'https:' && url.hostname === 'files.slack.com'
    ? url.href
    : undefined;
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
