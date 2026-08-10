import { execAsync } from '@noshiro/mono-utils';
import {
  Arr,
  ISet,
  Json,
  Result,
  isRecord,
  isString,
  toUint32,
} from '@noshiro/ts-utils';
import type * as fsType from 'node:fs';
import 'zx/globals';
import { extractExt } from './extract-ext.mjs';
import { getAllJsonFiles } from './get-all-json-files.mjs';
import { validateJsonObject } from './validator.mjs';

const thisDir = import.meta.dirname;
const rootDir = path.resolve(thisDir, '..');

const srcDir = path.resolve(
  rootDir,
  'archive',
  'Slack_export_Sep_23_2020_-_Aug_24_2024',
);

const maxFileDownloadCount = toUint32(20_000);
// const maxFileDownloadCount = toUint32(200);

const downloadParallelSize = 10;

const reExportMessageFiles: boolean = Math.random() < 0;

export const main = async (): Promise<void> => {
  const jsonFiles: readonly fsType.Dirent[] = await getAllJsonFiles(srcDir);

  const distDir = `${srcDir}_dist`;
  const fileDistDir = `${srcDir}_dist_file`;

  if (reExportMessageFiles) {
    await fs.rm(distDir, { recursive: true, force: true });
  }

  const mut_downloadList: Readonly<{ url: string; outputFilePath: string }>[] =
    [];

  if (reExportMessageFiles) {
    console.log(`Started re-exporting ${jsonFiles.length} message files...`);
  }

  for (const file of jsonFiles) {
    const distSubDir = file.parentPath.replace(srcDir, distDir);
    const fileDistSubDir = file.parentPath.replace(srcDir, fileDistDir);
    const srcFile = path.resolve(file.parentPath, file.name);

    const contentString = await fs.readFile(srcFile, 'utf8');

    const content = Json.parse(contentString);

    if (Result.isErr(content)) {
      console.error(content.value);
      return;
    }

    if (!validateJsonObject(content.value, srcFile)) {
      return;
    }

    const { value } = content;

    mut_downloadList.push(
      ...listDownloadFileRecursively(
        value,
        path.resolve(fileDistSubDir, path.parse(file.name).name),
        '',
      ),
    );

    if (reExportMessageFiles) {
      const contentStr = Json.stringify(value, undefined, 2);

      if (Result.isErr(contentStr)) {
        console.error(contentStr.value);
        return;
      }

      await fs.mkdir(distSubDir, { recursive: true });

      const distFile = path.resolve(distSubDir, file.name);

      await fs.writeFile(distFile, contentStr.value);
    }
  }

  const downloadListSliced = mut_downloadList.slice(0, maxFileDownloadCount);

  {
    // create folders

    const dirnames = ISet.new(
      downloadListSliced.map(({ outputFilePath }) =>
        path.dirname(outputFilePath),
      ),
    );

    console.log(`Started creating ${dirnames.size} folders...`);

    for (const chunk of Arr.chunk(Array.from(dirnames), 10)) {
      await Promise.all(chunk.map((dir) => fs.mkdir(dir, { recursive: true })));
    }
  }

  {
    console.log(`Started downloading ${downloadListSliced.length} files...`);

    for (const [index, chunk] of Arr.chunk(
      downloadListSliced,
      downloadParallelSize,
    ).entries()) {
      // for (const { url } of chunk) {
      //   console.log(`downloading ${url}`);
      // }
      await Promise.all(
        chunk.map(({ url, outputFilePath }) =>
          execAsync(`wget ${url} -O ${outputFilePath}`),
        ),
      );

      console.log(
        `${index * downloadParallelSize}/${downloadListSliced.length} files downloaded.`,
      );
    }
  }

  console.log('Done.');

  console.log({
    unknownExtensions: Array.from(mut_unknownExtensions.values()),
  });
};

const listDownloadFileRecursively = (
  data: unknown,
  dir: string,
  prop: string,
): DeepReadonly<{ url: string; outputFilePath: string }[]> => {
  if (Array.isArray(data)) {
    return data.flatMap((el, i) =>
      listDownloadFileRecursively(el, path.resolve(dir, prop), i.toString()),
    );
  }

  if (isRecord(data)) {
    return Object.entries(data).flatMap(([key, value]) =>
      listDownloadFileRecursively(value, path.resolve(dir, prop), key),
    );
  }

  if (isString(data) && matchFileURL(data)) {
    const ext = extractExt(data);
    if (knownExtensions.has(ext)) {
      return [
        {
          url: data,
          outputFilePath: path.resolve(dir, `${prop}${ext}`),
        },
      ];
    } else {
      mut_unknownExtensions.add(ext);
      return [];
    }
  }

  return [];
};

// eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-restricted-types
const mut_unknownExtensions: Set<string> = new Set<string>();

const knownExtensions = ISet.new<`.${string}`>([
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

const matchFileURL = (s: string): s is `https://files.slack.com${string}` =>
  s.startsWith('https://files.slack.com');

await main();
